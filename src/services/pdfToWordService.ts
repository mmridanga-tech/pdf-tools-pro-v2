import {
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from 'docx';
import {
  LayoutAnalyzer,
  TypographyEngine,
  MemoryManager,
  FileValidator,
  OutputValidator,
  ConversionManager,
  PositionedTextItem,
  StructuredLine,
  DocxParagraphBuilder,
  DocxImageBuilder,
  DocxTableBuilder,
  DocxDocumentBuilder,
  TableEngine,
  ImageProcessor,
  SectionOptions,
  PageMarginConfig,
} from '../core';

export type PDFToWordEngineMode = 'client' | 'server' | 'auto';

export interface PDFToWordOptions {
  engine?: PDFToWordEngineMode;
  serverEndpoint?: string;
  enableOCR?: boolean;
  onProgress?: (percent: number, statusMsg?: string) => void;
}

export interface PDFQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  statusMsg?: string;
  docxBlob?: Blob;
  error?: string;
  conversionTimeMs?: number;
  pageCount?: number;
}

interface ImageItemData {
  topY: number;
  leftX: number;
  width: number;
  height: number;
  dataUrl: string;
  buffer: Uint8Array;
}

export class PDFToWordService {
  /**
   * Main entry point to convert PDF to DOCX
   */
  static async convertToWord(
    file: File,
    options: PDFToWordOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'docx',
      async (inputFile, tracker, logger) => {
        const engine = options.engine || 'client';
        const serverEndpoint = options.serverEndpoint || '/api/convert/pdfToWord';

        const progressBridge = (percent: number, msg?: string) => {
          if (options.onProgress) {
            options.onProgress(percent, msg);
          }
          tracker.update('processing', percent, msg || 'Converting PDF to Word...');
        };

        const optsWithBridge = { ...options, onProgress: progressBridge };

        if (engine === 'server') {
          return this.convertOnServer(inputFile, serverEndpoint, progressBridge);
        }

        if (engine === 'auto') {
          try {
            return await this.convertOnServer(inputFile, serverEndpoint, progressBridge);
          } catch (err) {
            logger.warn(
              'Server-side PDF to Word service unavailable. Falling back to high-fidelity client-side engine:',
              err
            );
            return this.convertOnClient(inputFile, optsWithBridge);
          }
        }

        return this.convertOnClient(inputFile, optsWithBridge);
      },
      options
    );
  }

  /**
   * High-fidelity client-side PDF to DOCX conversion
   */
  private static async convertOnClient(
    file: File,
    options: PDFToWordOptions = {}
  ): Promise<Blob> {
    const { onProgress, enableOCR = true } = options;
    if (onProgress) onProgress(5, 'Initializing PDF document loader...');

    await FileValidator.validateFile(file, { allowedExtensions: ['pdf'] });

    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    if (onProgress) onProgress(15, `Analyzing layout, typography & structure for ${pageCount} page(s)...`);

    // Calculate document-wide font size baseline (median)
    const allFontSizes: number[] = [];

    for (let pNum = 1; pNum <= Math.min(pageCount, 10); pNum++) {
      try {
        const p = await pdfDoc.getPage(pNum);
        const tc = await p.getTextContent();
        for (const item of tc.items || []) {
          if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
            const transform = item.transform || [1, 0, 0, 1, 0, 0];
            const size = Math.abs(transform[0] || transform[3] || item.height || 12);
            if (size > 4 && size < 72) allFontSizes.push(size);
          }
        }
      } catch {
        // Ignore sampling error
      }
    }

    const bodyFontSize = TypographyEngine.calculateBodyFontSize(allFontSizes, 11);
    DocxImageBuilder.resetDeduplicationCache();

    let totalParagraphs = 0;
    let totalTables = 0;
    let totalImages = 0;

    const docSections: SectionOptions[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (onProgress) {
        const percent = 15 + Math.floor((pageNum / pageCount) * 70);
        onProgress(
          percent,
          `Processing page ${pageNum} of ${pageCount} (layout, tables, images & hyperlinks)...`
        );
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;

      // Extract Hyperlink Annotations
      const linkAnnotations: { url: string; x1: number; y1: number; x2: number; y2: number }[] = [];
      try {
        const annotations = await page.getAnnotations();
        for (const ann of annotations) {
          if (ann.subtype === 'Link' && ann.url && ann.rect && ann.rect.length === 4) {
            const [rx1, ry1, rx2, ry2] = ann.rect;
            linkAnnotations.push({
              url: ann.url,
              x1: Math.min(rx1, rx2),
              y1: pageHeight - Math.max(ry1, ry2),
              x2: Math.max(rx1, rx2),
              y2: pageHeight - Math.min(ry1, ry2),
            });
          }
        }
      } catch {
        // Ignore annotation parsing errors
      }

      // Extract Raw Text Items with Fonts & Formatting
      const textContent = await page.getTextContent();
      const rawItems = textContent.items || [];
      const stylesDict: Record<string, any> = textContent.styles || {};

      const textItems: PositionedTextItem[] = [];

      for (const item of rawItems) {
        if ('str' in item && typeof item.str === 'string') {
          const cleanedStr = TypographyEngine.normalizeText(item.str);
          if (!cleanedStr && item.str.trim().length > 0) continue;

          const transform = item.transform || [1, 0, 0, 1, 0, 0];
          const fontSize = Math.abs(transform[0] || transform[3] || item.height || 12);
          const pdfFontName = item.fontName || '';
          const fontStyleObj = stylesDict[pdfFontName] || {};
          const fontFamilyName = fontStyleObj.fontFamily || pdfFontName;

          const leftX = transform[4] || 0;
          const topY = pageHeight - (transform[5] || 0);
          const width = item.width || (cleanedStr ? cleanedStr.length * fontSize * 0.5 : 10);
          const height = item.height || fontSize;

          const isBold = TypographyEngine.detectBold(pdfFontName, fontFamilyName);
          const isItalic = TypographyEngine.detectItalic(pdfFontName, fontFamilyName);
          const isUnderline = TypographyEngine.detectUnderline(pdfFontName, fontFamilyName);
          const isStrike = TypographyEngine.detectStrikeThrough(pdfFontName);
          const isSuperScript = TypographyEngine.detectSuperscript(fontSize, bodyFontSize);
          const isSubScript = TypographyEngine.detectSubscript(fontSize, bodyFontSize);

          // Find intersecting link annotation
          let linkUrl: string | undefined = undefined;
          for (const link of linkAnnotations) {
            if (
              leftX + width >= link.x1 - 5 &&
              leftX <= link.x2 + 5 &&
              topY >= link.y1 - 5 &&
              topY - height <= link.y2 + 5
            ) {
              linkUrl = link.url;
              break;
            }
          }

          textItems.push({
            str: cleanedStr,
            leftX,
            topY,
            width,
            height,
            fontSize,
            fontName: pdfFontName,
            fontFamily: fontFamilyName,
            isBold,
            isItalic,
            isUnderline,
            isStrike,
            isSuperScript,
            isSubScript,
            linkUrl,
          });
        }
      }

      // Extract Embedded Images & Positions
      const imageItems: ImageItemData[] = await this.extractImagesFromPage(page, pdfjsLib, pageHeight);

      const pageChildren: any[] = [];
      const hasText = textItems.some((t) => t.str.trim().length > 0);

      // OCR Fallback for Scanned Pages
      if (!hasText && enableOCR) {
        if (onProgress) {
          onProgress(
            15 + Math.floor((pageNum / pageCount) * 70),
            `Running OCR Pro on scanned page ${pageNum}...`
          );
        }

        const ocrSuccess = await this.processScannedPageWithOcr(
          page,
          pageChildren,
          pageWidth,
          pageHeight
        );

        if (!ocrSuccess) {
          await this.appendPageSnapshotImage(pageChildren, page, pageWidth, pageHeight);
        }

        docSections.push({
          children: pageChildren,
          size: {
            width: Math.round(pageWidth * 20),
            height: Math.round(pageHeight * 20),
          },
          margins: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        });

        if (typeof (page as any).cleanup === 'function') {
          (page as any).cleanup();
        }
        continue;
      }

      // Calculate actual content margins for page
      const pageMargins = this.estimatePageMargins(textItems, imageItems, pageWidth, pageHeight);

      // Layout & Multi-column Flow Analysis
      const sortedItems = LayoutAnalyzer.sortItemsByReadingOrder(textItems, pageWidth, pageHeight);
      const lines = LayoutAnalyzer.groupItemsIntoLines(sortedItems, pageWidth, bodyFontSize, pageHeight);

      // Detect tables and interleave images and semantic paragraphs
      const blocks = this.detectTablesAndParagraphs(lines, imageItems, pageWidth, bodyFontSize);

      for (const block of blocks) {
        if (block.type === 'table') {
          totalTables++;
          pageChildren.push(block.tableComponent);
          pageChildren.push(new Paragraph({ text: '', spacing: { before: 20, after: 40 } }));
        } else if (block.type === 'image') {
          const availWidthPt = Math.max(100, pageWidth - (pageMargins.left! + pageMargins.right!) / 20);
          const imgParas = DocxImageBuilder.buildImageParagraph(block.image, availWidthPt, pageWidth);
          if (imgParas.length > 0) totalImages++;
          for (const imgP of imgParas) {
            pageChildren.push(imgP);
          }
        } else if (block.type === 'paragraph') {
          totalParagraphs++;
          const paragraph = DocxParagraphBuilder.buildParagraph(block.paragraph, bodyFontSize);
          pageChildren.push(paragraph);
        }
      }

      // Add section for page preserving exact size and margins
      docSections.push({
        children: pageChildren,
        size: {
          width: Math.round(pageWidth * 20),
          height: Math.round(pageHeight * 20),
        },
        margins: pageMargins,
      });

      if (typeof (page as any).cleanup === 'function') {
        (page as any).cleanup();
      }
    }

    if (onProgress) onProgress(85, 'Assembling DOCX structure, XML elements & styles...');

    // Quality Validation via OutputValidator
    OutputValidator.validateDocumentMetrics({
      pageCount,
      paragraphCount: totalParagraphs,
      tableCount: totalTables,
      imageCount: totalImages,
    });

    const doc = DocxDocumentBuilder.buildDocument({
      sections: docSections,
    });

    const docxBlob = await DocxDocumentBuilder.exportToBlob(doc);

    // Validate Output Blob using OutputValidator core module
    await OutputValidator.validateOutputBlob(docxBlob, 'docx');

    if (onProgress) onProgress(100, 'PDF to Word conversion completed successfully!');

    return docxBlob;
  }

  /**
   * Estimate page margins in twips from extracted text & image bounding box
   */
  private static estimatePageMargins(
    textItems: PositionedTextItem[],
    imageItems: ImageItemData[],
    pageWidth: number,
    pageHeight: number
  ): PageMarginConfig {
    let minX = pageWidth;
    let maxX = 0;
    let minY = pageHeight;
    let maxY = 0;

    for (const item of textItems) {
      if (item.leftX < minX) minX = item.leftX;
      if (item.leftX + item.width > maxX) maxX = item.leftX + item.width;
      if (item.topY < minY) minY = item.topY;
      if (item.topY + item.height > maxY) maxY = item.topY + item.height;
    }

    for (const img of imageItems) {
      if (img.leftX < minX) minX = img.leftX;
      if (img.leftX + img.width > maxX) maxX = img.leftX + img.width;
      if (img.topY < minY) minY = img.topY;
      if (img.topY + img.height > maxY) maxY = img.topY + img.height;
    }

    if (minX >= maxX || minY >= maxY) {
      return { top: 1080, bottom: 1080, left: 1080, right: 1080 }; // 0.75"
    }

    const leftMarginPt = Math.max(36, Math.min(minX, pageWidth * 0.25));
    const rightMarginPt = Math.max(36, Math.min(pageWidth - maxX, pageWidth * 0.25));
    const topMarginPt = Math.max(36, Math.min(minY, pageHeight * 0.25));
    const bottomMarginPt = Math.max(36, Math.min(pageHeight - maxY, pageHeight * 0.25));

    return {
      top: Math.round(topMarginPt * 20),
      bottom: Math.round(bottomMarginPt * 20),
      left: Math.round(leftMarginPt * 20),
      right: Math.round(rightMarginPt * 20),
    };
  }

  /**
   * Detect tables and interleave images and semantic paragraphs
   */
  private static detectTablesAndParagraphs(
    lines: StructuredLine[],
    images: ImageItemData[],
    pageWidth: number,
    bodyFontSize: number
  ): any[] {
    const blocks: any[] = [];
    let i = 0;

    const remainingImages = [...images].sort((a, b) => a.topY - b.topY);

    while (i < lines.length) {
      const currentLine = lines[i];

      while (remainingImages.length > 0 && remainingImages[0].topY <= currentLine.topY) {
        const img = remainingImages.shift()!;
        blocks.push({ type: 'image', image: img });
      }

      const isCandidateTableRow = this.isTableLineCandidate(currentLine);

      if (isCandidateTableRow) {
        const tableLines: StructuredLine[] = [currentLine];
        const colSet = new Set<number>();
        currentLine.items.forEach((it) => colSet.add(Math.round(it.leftX / 15) * 15));

        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j];
          if (remainingImages.length > 0 && remainingImages[0].topY <= nextLine.topY) {
            break;
          }

          const yDistance = Math.abs(nextLine.topY - lines[j - 1].topY);
          const isLineClose = yDistance <= Math.max(38, (lines[j - 1].height || 14) * 2.2);

          if (!isLineClose || nextLine.headingLevel) {
            break;
          }

          const isNextCandidate = this.isTableLineCandidate(nextLine);
          const sharesColumns = nextLine.items.some((it) =>
            Array.from(colSet).some((cx) => Math.abs(Math.round(it.leftX / 15) * 15 - cx) <= 20)
          );

          if (isNextCandidate || (sharesColumns && nextLine.items.length >= 1)) {
            tableLines.push(nextLine);
            nextLine.items.forEach((it) => colSet.add(Math.round(it.leftX / 15) * 15));
            j++;
          } else {
            break;
          }
        }

        if (tableLines.length >= 1 && this.validateTableStructure(tableLines)) {
          const tableComponent = DocxTableBuilder.buildRealTable(tableLines, pageWidth);
          blocks.push({ type: 'table', tableComponent });
          i = j;
          continue;
        }
      }

      // Collect contiguous non-table lines
      const nonTableLines: StructuredLine[] = [currentLine];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (remainingImages.length > 0 && remainingImages[0].topY <= nextLine.topY) {
          break;
        }

        if (this.isTableLineCandidate(nextLine)) {
          let k = j + 1;
          let candidateRows = 1;
          while (k < lines.length && this.isTableLineCandidate(lines[k]) && Math.abs(lines[k].topY - lines[k - 1].topY) < 45) {
            candidateRows++;
            k++;
          }
          if (candidateRows >= 1 && this.validateTableStructure(lines.slice(j, k))) {
            break;
          }
        }

        nonTableLines.push(nextLine);
        j++;
      }

      const semanticParagraphs = LayoutAnalyzer.reconstructParagraphs(
        nonTableLines,
        bodyFontSize
      );

      for (const para of semanticParagraphs) {
        blocks.push({ type: 'paragraph', paragraph: para });
      }

      i = j;
    }

    while (remainingImages.length > 0) {
      const img = remainingImages.shift()!;
      blocks.push({ type: 'image', image: img });
    }

    return blocks;
  }

  private static isTableLineCandidate(line: StructuredLine): boolean {
    if (line.headingLevel) return false;
    if (line.cleanText.length > 130 && line.cleanText.endsWith('.')) return false;
    if (line.items.length >= 2) {
      return (
        TableEngine.hasColumnGaps(line.items, 12) ||
        /[:\|\-]/.test(line.cleanText) ||
        /earnings|deductions|attendance|amount|salary|gross|total|basic|present|days|allowance|rate|qty/i.test(line.cleanText)
      );
    }
    return false;
  }

  private static validateTableStructure(tableLines: StructuredLine[]): boolean {
    if (tableLines.length === 0) return false;
    if (tableLines.length === 1) {
      return tableLines[0].items.length >= 3;
    }

    const colXSet = new Set<number>();
    tableLines.forEach((l) => {
      l.items.forEach((it) => colXSet.add(Math.round(it.leftX / 15) * 15));
    });

    return colXSet.size >= 2;
  }

  /**
   * Process scanned page with OCR and append editable text
   */
  private static async processScannedPageWithOcr(
    page: any,
    children: any[],
    pageWidth: number,
    pageHeight: number
  ): Promise<boolean> {
    try {
      const renderScale = 2.0;
      const highResViewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      canvas.width = highResViewport.width;
      canvas.height = highResViewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      await page.render({ canvasContext: ctx, viewport: highResViewport, canvas }).promise;
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(canvas.toDataURL('image/png'));
      await worker.terminate();

      if (data && data.text && data.text.trim().length > 10) {
        const ocrLines = data.text.split('\n').filter((l) => l.trim().length > 0);
        for (const lineText of ocrLines) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: TypographyEngine.normalizeText(lineText),
                  size: 24, // 12pt
                  font: 'Calibri',
                }),
              ],
              spacing: { after: 120, line: 240 },
            })
          );
        }
        return true;
      }
    } catch (ocrErr) {
      console.warn('OCR fallback notice:', ocrErr);
    }
    return false;
  }

  /**
   * Snapshot fallback for scanned pages where OCR is unreliable
   */
  private static async appendPageSnapshotImage(
    children: any[],
    page: any,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    try {
      const renderScale = 2.0;
      const highResViewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      canvas.width = highResViewport.width;
      canvas.height = highResViewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: highResViewport, canvas }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        const buffer = ImageProcessor.dataUrlToBuffer(dataUrl);

        const imgRun = new ImageRun({
          data: buffer,
          type: 'png',
          transformation: {
            width: Math.round(pageWidth - 72),
            height: Math.round((pageWidth - 72) * (pageHeight / Math.max(1, pageWidth))),
          },
        });

        children.push(
          new Paragraph({
            children: [imgRun],
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
          })
        );
      }
    } catch (snapErr) {
      console.warn('Snapshot fallback notice:', snapErr);
    }
  }

  /**
   * Extract embedded images and PDF coordinates via Operator List
   */
  private static async extractImagesFromPage(
    page: any,
    pdfjsLib: any,
    pageHeight: number
  ): Promise<ImageItemData[]> {
    const imageItems: ImageItemData[] = [];
    try {
      const renderScale = 2.0;
      const highResViewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      canvas.width = highResViewport.width;
      canvas.height = highResViewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: highResViewport, canvas }).promise;

        const opList = await page.getOperatorList();
        const { fnArray, argsArray } = opList;

        let ctm = [1, 0, 0, 1, 0, 0];
        const ctmStack: number[][] = [];

        for (let i = 0; i < fnArray.length; i++) {
          const fn = fnArray[i];
          const args = argsArray[i];

          if (fn === pdfjsLib.OPS.save) {
            ctmStack.push([...ctm]);
          } else if (fn === pdfjsLib.OPS.restore) {
            if (ctmStack.length > 0) ctm = ctmStack.pop()!;
          } else if (fn === pdfjsLib.OPS.transform) {
            const [a1, b1, c1, d1, e1, f1] = ctm;
            const [a2, b2, c2, d2, e2, f2] = args;
            ctm = [
              a1 * a2 + c1 * b2,
              b1 * a2 + d1 * b2,
              a1 * c2 + c1 * d2,
              b1 * c2 + d1 * d2,
              a1 * e2 + c1 * f2 + e1,
              b1 * e2 + d1 * f2 + f1,
            ];
          } else if (
            fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintInlineImageXObject ||
            fn === pdfjsLib.OPS.paintImageMaskXObject
          ) {
            const imgW = Math.abs(ctm[0]) || 100;
            const imgH = Math.abs(ctm[3]) || 100;
            const imgX = ctm[4] || 0;
            const imgY = pageHeight - (ctm[5] || 0) - imgH;

            if (imgW >= 15 && imgH >= 15 && imgX >= -50 && imgY >= -50) {
              const cropX = Math.max(0, Math.floor(imgX * renderScale));
              const cropY = Math.max(0, Math.floor(imgY * renderScale));
              const cropW = Math.min(canvas.width - cropX, Math.ceil(imgW * renderScale));
              const cropH = Math.min(canvas.height - cropY, Math.ceil(imgH * renderScale));

              if (cropW > 10 && cropH > 10) {
                const cropped = ImageProcessor.cropCanvasToBuffer(canvas, cropX, cropY, cropW, cropH);
                if (cropped) {
                  imageItems.push({
                    topY: imgY,
                    leftX: imgX,
                    width: imgW,
                    height: imgH,
                    dataUrl: cropped.dataUrl,
                    buffer: cropped.buffer,
                  });
                }
              }
            }
          }
        }
      }
    } catch (imgErr) {
      console.warn('Image extraction notice:', imgErr);
    }
    return imageItems;
  }

  /**
   * Server Endpoint Call
   */
  private static async convertOnServer(
    file: File,
    serverEndpoint: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(20, 'Sending PDF to server conversion API...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(serverEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `Server conversion failed (${response.status}): ${errText || response.statusText}`
      );
    }

    if (onProgress) onProgress(80, 'Receiving DOCX file from server...');
    return await response.blob();
  }
}

