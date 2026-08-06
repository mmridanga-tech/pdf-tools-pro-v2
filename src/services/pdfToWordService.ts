import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  ImageRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  AlignmentType,
  PageBreak,
} from 'docx';
import {
  LayoutAnalyzer,
  TypographyEngine,
  MemoryManager,
  FileValidator,
  OutputValidator,
  PositionedTextItem,
  StructuredLine,
  SemanticParagraph,
  DocxParagraphBuilder,
  DocxImageBuilder,
  DocxTablePlaceholder,
  DocxDocumentBuilder,
  DocxPageBreakEngine,
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

interface TextItemData extends PositionedTextItem {}

interface ImageItemData {
  topY: number;
  leftX: number;
  width: number;
  height: number;
  dataUrl: string;
  buffer: Uint8Array;
}

interface LineData extends StructuredLine {}

export class PDFToWordService {
  /**
   * Main entry point to convert PDF to DOCX
   */
  static async convertToWord(
    file: File,
    options: PDFToWordOptions = {}
  ): Promise<Blob> {
    const engine = options.engine || 'client';
    const serverEndpoint = options.serverEndpoint || '/api/convert/pdfToWord';

    if (engine === 'server') {
      return this.convertOnServer(file, serverEndpoint, options.onProgress);
    }

    if (engine === 'auto') {
      try {
        return await this.convertOnServer(file, serverEndpoint, options.onProgress);
      } catch (err) {
        console.warn(
          'Server-side PDF to Word service unavailable. Falling back to high-fidelity client-side engine:',
          err
        );
        return this.convertOnClient(file, options);
      }
    }

    return this.convertOnClient(file, options);
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

    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    if (onProgress) onProgress(15, `Analyzing layout, typography & structure for ${pageCount} page(s)...`);

    const docTitle = file.name.replace(/\.pdf$/i, '');

    // Header & Footer definitions
    const header = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${docTitle} • Converted with SmartPDF`,
              size: 16, // 8pt
              color: '888888',
              italics: true,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `${docTitle} — Converted Document`,
              size: 18, // 9pt
              color: '888888',
              italics: true,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });

    const sectionChildren: any[] = [];

    // Document Title Heading
    sectionChildren.push(
      new Paragraph({
        text: docTitle,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 240 },
      })
    );

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

    const bodyFontSize = this.calculateMedian(allFontSizes, 11);
    DocxImageBuilder.resetDeduplicationCache();

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (onProgress) {
        const percent = 15 + Math.floor((pageNum / pageCount) * 70);
        onProgress(
          percent,
          `Processing page ${pageNum} of ${pageCount} (layout, tables, images & hyperlinks)...`
        );
      }

      // Page Break before page 2+ using DocxPageBreakEngine
      if (pageNum > 1) {
        DocxPageBreakEngine.appendPageBreakIfNeeded(sectionChildren);
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

      const textItems: TextItemData[] = [];

      for (const item of rawItems) {
        if ('str' in item && typeof item.str === 'string') {
          const cleanedStr = this.cleanUnicodeText(item.str);
          if (!cleanedStr && item.str.trim().length > 0) continue;

          const transform = item.transform || [1, 0, 0, 1, 0, 0];
          const fontSize = Math.abs(transform[0] || transform[3] || item.height || 12);
          const pdfFontName = item.fontName || '';
          const fontStyleObj = stylesDict[pdfFontName] || {};
          const fontFamilyName = fontStyleObj.fontFamily || pdfFontName;

          const leftX = transform[4] || 0;
          const topY = pageHeight - (transform[5] || 0);
          const width = item.width || cleanedStr.length * fontSize * 0.5;
          const height = item.height || fontSize;

          const isBold = this.detectIsBold(pdfFontName, fontFamilyName);
          const isItalic = this.detectIsItalic(pdfFontName, fontFamilyName);

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
            linkUrl,
          });
        }
      }

      // Extract Embedded Images & Positions via Operator List
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

              if (imgW >= 20 && imgH >= 20 && imgX >= -50 && imgY >= -50) {
                const cropX = Math.max(0, Math.floor(imgX * renderScale));
                const cropY = Math.max(0, Math.floor(imgY * renderScale));
                const cropW = Math.min(canvas.width - cropX, Math.ceil(imgW * renderScale));
                const cropH = Math.min(canvas.height - cropY, Math.ceil(imgH * renderScale));

                if (cropW > 10 && cropH > 10) {
                  const imgCanvas = document.createElement('canvas');
                  imgCanvas.width = cropW;
                  imgCanvas.height = cropH;
                  const imgCtx = imgCanvas.getContext('2d');

                  if (imgCtx) {
                    imgCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                    const dataUrl = imgCanvas.toDataURL('image/png');
                    const base64Data = dataUrl.split(',')[1];
                    if (base64Data) {
                      const binaryStr = atob(base64Data);
                      const buffer = new Uint8Array(binaryStr.length);
                      for (let k = 0; k < binaryStr.length; k++) {
                        buffer[k] = binaryStr.charCodeAt(k);
                      }

                      imageItems.push({
                        topY: imgY,
                        leftX: imgX,
                        width: imgW,
                        height: imgH,
                        dataUrl,
                        buffer,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } catch (imgErr) {
        console.warn(`Image extraction notice for page ${pageNum}:`, imgErr);
      }

      const hasText = textItems.some((t) => t.str.trim().length > 0);

      // OCR Fallback for Scanned Pages
      if (!hasText && enableOCR) {
        if (onProgress) {
          onProgress(
            15 + Math.floor((pageNum / pageCount) * 70),
            `Running OCR Pro on scanned page ${pageNum}...`
          );
        }

        try {
          const renderScale = 2.0;
          const highResViewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement('canvas');
          canvas.width = highResViewport.width;
          canvas.height = highResViewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: highResViewport, canvas }).promise;
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            const { data } = await worker.recognize(canvas.toDataURL('image/png'));
            await worker.terminate();

            if (data && data.text) {
              const ocrLines = data.text.split('\n').filter((l) => l.trim().length > 0);
              for (const lineText of ocrLines) {
                sectionChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: lineText,
                        size: 24, // 12pt
                        font: 'Calibri',
                      }),
                    ],
                    spacing: { after: 120, line: 240 },
                  })
                );
              }
            } else {
              await this.appendPageSnapshotImage(sectionChildren, canvas, pageWidth, pageHeight);
            }
          }
        } catch (ocrErr) {
          console.warn(`OCR fallback failed on page ${pageNum}:`, ocrErr);
        }

        continue;
      }

      // File Validation using FileValidator core module
      await FileValidator.validateFile(file, { allowedExtensions: ['pdf'] });

      // Multi-Column Layout Detection & Block Sorting via LayoutAnalyzer
      const sortedItems = LayoutAnalyzer.sortItemsByReadingOrder(textItems, pageWidth, pageHeight);

      // Line Grouping & Analysis via LayoutAnalyzer
      const lines = LayoutAnalyzer.groupItemsIntoLines(sortedItems, pageWidth, bodyFontSize);

      // Table Detection & Paragraph Reconstruction across lines
      const blocks = this.detectTablesAndParagraphs(lines, imageItems, pageWidth, bodyFontSize);

      // Render Page Blocks into DOCX using dedicated builder modules
      for (const block of blocks) {
        if (block.type === 'table') {
          sectionChildren.push(block.tableComponent);
          sectionChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        } else if (block.type === 'image') {
          const imgPara = DocxImageBuilder.buildImageParagraph(block.image);
          if (imgPara) {
            sectionChildren.push(imgPara);
          }
        } else if (block.type === 'paragraph') {
          const paragraph = DocxParagraphBuilder.buildParagraph(block.paragraph, bodyFontSize);
          sectionChildren.push(paragraph);
        }
      }
    }

    if (onProgress) onProgress(85, 'Assembling DOCX structure, XML elements & styles...');

    const doc = DocxDocumentBuilder.buildDocument({
      sectionChildren,
      header,
      footer,
    });

    const docxBlob = await DocxDocumentBuilder.exportToBlob(doc);

    // Validate Output Blob using OutputValidator core module
    await OutputValidator.validateOutputBlob(docxBlob, 'docx');

    if (onProgress) onProgress(100, 'PDF to Word conversion completed successfully!');

    return docxBlob;
  }

  /**
   * Sort text items handling multi-column layouts & reading order
   */
  private static sortItemsByColumnsAndFlow(
    items: TextItemData[],
    pageWidth: number
  ): TextItemData[] {
    if (items.length === 0) return [];

    const nonEmpty = items.filter((it) => it.str.trim().length > 0);
    if (nonEmpty.length === 0) return [];

    const midX = pageWidth / 2;
    const leftColumnItems = nonEmpty.filter((it) => it.leftX + it.width < midX + 20);
    const rightColumnItems = nonEmpty.filter((it) => it.leftX > midX - 20);

    const isTwoColumn =
      leftColumnItems.length > 5 &&
      rightColumnItems.length > 5 &&
      leftColumnItems.length + rightColumnItems.length >= nonEmpty.length * 0.75;

    if (isTwoColumn) {
      const sortFn = (a: TextItemData, b: TextItemData) => {
        if (Math.abs(a.topY - b.topY) > 6) return a.topY - b.topY;
        return a.leftX - b.leftX;
      };

      leftColumnItems.sort(sortFn);
      rightColumnItems.sort(sortFn);

      return [...leftColumnItems, ...rightColumnItems];
    }

    return [...nonEmpty].sort((a, b) => {
      if (Math.abs(a.topY - b.topY) > 5) return a.topY - b.topY;
      return a.leftX - b.leftX;
    });
  }

  /**
   * Group sorted text items into structured lines with alignment and headings
   */
  private static groupItemsIntoLines(
    items: TextItemData[],
    pageWidth: number,
    bodyFontSize: number
  ): LineData[] {
    const lines: LineData[] = [];
    if (items.length === 0) return lines;

    let currentLineItems: TextItemData[] = [items[0]];

    for (let i = 1; i < items.length; i++) {
      const prev = currentLineItems[currentLineItems.length - 1];
      const curr = items[i];

      const sameLine = Math.abs(curr.topY - prev.topY) <= Math.max(4, curr.fontSize * 0.35);

      if (sameLine) {
        currentLineItems.push(curr);
      } else {
        lines.push(this.analyzeLine(currentLineItems, pageWidth, bodyFontSize));
        currentLineItems = [curr];
      }
    }

    if (currentLineItems.length > 0) {
      lines.push(this.analyzeLine(currentLineItems, pageWidth, bodyFontSize));
    }

    return lines;
  }

  /**
   * Analyze line metrics, alignment, lists, and headings
   */
  private static analyzeLine(
    items: TextItemData[],
    pageWidth: number,
    bodyFontSize: number
  ): LineData {
    items.sort((a, b) => a.leftX - b.leftX);

    const rawText = items.map((it) => it.str).join(' ');
    const cleanText = rawText.replace(/\s+/g, ' ').trim();

    const topY = items[0].topY;
    const leftX = items[0].leftX;
    const lastItem = items[items.length - 1];
    const rightX = lastItem.leftX + lastItem.width;
    const height = Math.max(...items.map((it) => it.height));
    const maxFontSize = Math.max(...items.map((it) => it.fontSize));

    // Detect Alignment
    const lineWidth = rightX - leftX;
    const lineCenter = leftX + lineWidth / 2;
    const pageCenter = pageWidth / 2;

    let alignment: any = AlignmentType.LEFT;
    if (Math.abs(lineCenter - pageCenter) < 35 && lineWidth < pageWidth * 0.7) {
      alignment = AlignmentType.CENTER;
    } else if (rightX > pageWidth - 60 && leftX > pageWidth * 0.35) {
      alignment = AlignmentType.RIGHT;
    }

    // Detect Headings
    let heading: any = undefined;
    const isShort = cleanText.length < 120 && !cleanText.endsWith('.');

    if (isShort) {
      if (maxFontSize >= bodyFontSize * 1.75 || maxFontSize >= 20) {
        heading = HeadingLevel.HEADING_1;
      } else if (maxFontSize >= bodyFontSize * 1.38 || maxFontSize >= 15.5) {
        heading = HeadingLevel.HEADING_2;
      } else if (maxFontSize >= bodyFontSize * 1.18 || (maxFontSize >= 13 && items.some((it) => it.isBold))) {
        heading = HeadingLevel.HEADING_3;
      }
    }

    // Detect Bullet or Numbered Lists
    const bulletRegex = /^[\u2022\u25CF\u25CB\u25AA\u25A0\u2013\u2014\-\*\•\▪\►\◦]\s*/;
    const numberedRegex = /^(\d+|[A-Za-z]|[IVXLCDMivxlcdm]+)[\.\)]\s+/;

    const isBulletList = bulletRegex.test(cleanText);
    const isNumberedList = !isBulletList && numberedRegex.test(cleanText);

    let listMarker: string | undefined = undefined;
    if (isBulletList) {
      const match = cleanText.match(bulletRegex);
      if (match) listMarker = match[0];
    } else if (isNumberedList) {
      const match = cleanText.match(numberedRegex);
      if (match) listMarker = match[0];
    }

    return {
      items,
      topY,
      leftX,
      rightX,
      width: rightX - leftX,
      height,
      maxFontSize,
      alignment,
      heading,
      isBulletList,
      isNumberedList,
      listMarker,
      cleanText,
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

      const isTableRow =
        currentLine.items.length >= 2 &&
        this.hasWideColumnGaps(currentLine.items) &&
        !currentLine.headingLevel;

      if (isTableRow) {
        const tableLines: StructuredLine[] = [currentLine];
        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j];
          const isNextTableRow =
            nextLine.items.length >= 2 &&
            this.hasWideColumnGaps(nextLine.items) &&
            !nextLine.headingLevel;

          if (isNextTableRow && Math.abs(nextLine.topY - lines[j - 1].topY) < 40) {
            tableLines.push(nextLine);
            j++;
          } else {
            break;
          }
        }

        if (tableLines.length >= 2) {
          const tableComponent = DocxTablePlaceholder.buildTableFromLines(tableLines, pageWidth);
          blocks.push({ type: 'table', tableComponent });
          i = j;
          continue;
        }
      }

      // Collect contiguous non-table lines until next table or image
      const nonTableLines: StructuredLine[] = [currentLine];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (remainingImages.length > 0 && remainingImages[0].topY <= nextLine.topY) {
          break;
        }
        const isNextTableRow =
          nextLine.items.length >= 2 &&
          this.hasWideColumnGaps(nextLine.items) &&
          !nextLine.headingLevel;

        if (isNextTableRow) {
          break;
        }

        nonTableLines.push(nextLine);
        j++;
      }

      // Reconstruct semantic paragraphs from continuous non-table lines
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

  /**
   * Check if text items on a line are separated by table column gaps
   */
  private static hasWideColumnGaps(items: PositionedTextItem[]): boolean {
    if (items.length < 2) return false;
    for (let k = 1; k < items.length; k++) {
      const gap = items[k].leftX - (items[k - 1].leftX + items[k - 1].width);
      if (gap >= 25) return true;
    }
    return false;
  }

  /**
   * Build a DOCX Table component from detected table lines
   */
  private static buildTableFromLines(tableLines: StructuredLine[], pageWidth: number): Table {
    const colXSet = new Set<number>();
    tableLines.forEach((l) => {
      l.items.forEach((it) => colXSet.add(Math.round(it.leftX / 15) * 15));
    });

    const colXList = Array.from(colXSet).sort((a, b) => a - b);
    const colCount = Math.max(2, colXList.length);

    const rows = tableLines.map((line, rIdx) => {
      const cells = line.items.map((item) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.str,
                  bold: item.isBold || rIdx === 0,
                  italics: item.isItalic,
                  size: Math.max(16, Math.round(item.fontSize * 2)),
                  font: TypographyEngine.mapFontFamily(item.fontName, item.fontFamily),
                }),
              ],
              spacing: { before: 40, after: 40 },
            }),
          ],
          shading: rIdx === 0 ? { fill: 'F3F4F6' } : undefined,
          width: {
            size: Math.floor(100 / Math.max(1, line.items.length)),
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          },
        });
      });

      while (cells.length < colCount) {
        cells.push(
          new TableCell({
            children: [new Paragraph({ text: '' })],
            width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            },
          })
        );
      }

      return new TableRow({ children: cells });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    });
  }

  /**
   * Build DOCX Paragraph from SemanticParagraph preserving fonts, styles, links, headings & lists
   */
  private static buildParagraphFromSemanticParagraph(
    para: SemanticParagraph,
    bodyFontSize: number
  ): Paragraph {
    const textRuns: any[] = [];

    let docxAlignment: any = AlignmentType.LEFT;
    if (para.alignment === 'center') docxAlignment = AlignmentType.CENTER;
    else if (para.alignment === 'right') docxAlignment = AlignmentType.RIGHT;
    else if (para.alignment === 'justify') docxAlignment = AlignmentType.JUSTIFIED;

    let docxHeading: any = undefined;
    if (para.headingLevel === 'h1') docxHeading = HeadingLevel.HEADING_1;
    else if (para.headingLevel === 'h2') docxHeading = HeadingLevel.HEADING_2;
    else if (para.headingLevel === 'h3') docxHeading = HeadingLevel.HEADING_3;

    for (let lIdx = 0; lIdx < para.lines.length; lIdx++) {
      const line = para.lines[lIdx];
      let lineItems = line.items;

      if ((para.isBulletList || para.isNumberedList) && para.listMarker && lIdx === 0) {
        const firstStr = lineItems[0].str.replace(para.listMarker, '').trim();
        if (firstStr) {
          lineItems = [{ ...lineItems[0], str: firstStr }, ...lineItems.slice(1)];
        } else if (lineItems.length > 1) {
          lineItems = lineItems.slice(1);
        }
      }

      for (let k = 0; k < lineItems.length; k++) {
        const item = lineItems[k];
        const isLastInLine = k === lineItems.length - 1;

        let itemStr = TypographyEngine.normalizeText(item.str);
        if (!itemStr) continue;

        if (!isLastInLine) {
          const nextItem = lineItems[k + 1];
          if (nextItem.leftX - (item.leftX + item.width) > 2) {
            itemStr += ' ';
          }
        } else if (lIdx < para.lines.length - 1) {
          if (/[a-zA-Z]-$/.test(itemStr)) {
            itemStr = itemStr.slice(0, -1);
          } else {
            itemStr += ' ';
          }
        }

        const fontName = TypographyEngine.mapFontFamily(item.fontName, item.fontFamily);
        const fontSizeInPts = Math.max(16, Math.round(item.fontSize * 2));

        if (item.linkUrl || itemStr.startsWith('http://') || itemStr.startsWith('https://')) {
          const url = item.linkUrl || itemStr;
          textRuns.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: itemStr,
                  style: 'Hyperlink',
                  color: '0563C1',
                  underline: {},
                  size: fontSizeInPts,
                  font: fontName,
                }),
              ],
              link: url,
            })
          );
        } else {
          textRuns.push(
            new TextRun({
              text: itemStr,
              bold: item.isBold,
              italics: item.isItalic,
              size: fontSizeInPts,
              font: fontName,
            })
          );
        }
      }
    }

    const paragraphOptions: any = {
      children: textRuns,
      alignment: docxAlignment,
      heading: docxHeading,
      spacing: {
        before: docxHeading ? 200 : 40,
        after: docxHeading ? 120 : 100,
        line: 240,
      },
    };

    if (para.isBulletList) {
      paragraphOptions.bullet = { level: para.bulletLevel };
    } else if (para.isNumberedList) {
      paragraphOptions.indent = { left: 360 * (para.bulletLevel + 1) };
    }

    return new Paragraph(paragraphOptions);
  }

  /**
   * Helper: Append page snapshot image for non-text scanned pages
   */
  private static async appendPageSnapshotImage(
    children: any[],
    canvas: HTMLCanvasElement,
    pageWidth: number,
    pageHeight: number
  ) {
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    if (base64Data) {
      const binaryStr = atob(base64Data);
      const buffer = new Uint8Array(binaryStr.length);
      for (let k = 0; k < binaryStr.length; k++) {
        buffer[k] = binaryStr.charCodeAt(k);
      }

      const imgRun = new ImageRun({
        data: buffer,
        type: 'png',
        transformation: {
          width: 500,
          height: Math.round(500 * (pageHeight / Math.max(1, pageWidth))),
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
  }

  /**
   * Helper: Map PDF font names to DOCX standard font family names
   */
  private static mapToDocxFont(pdfFontName: string, fontFamily?: string): string {
    const combined = `${pdfFontName} ${fontFamily || ''}`.toLowerCase();
    if (combined.includes('times') || combined.includes('serif')) return 'Times New Roman';
    if (combined.includes('courier') || combined.includes('mono') || combined.includes('code')) return 'Courier New';
    if (combined.includes('arial') || combined.includes('helvetica') || combined.includes('sans')) return 'Arial';
    if (combined.includes('calibri')) return 'Calibri';
    if (combined.includes('georgia')) return 'Georgia';
    if (combined.includes('garamond')) return 'Garamond';
    if (combined.includes('verdana')) return 'Verdana';
    if (combined.includes('cambria')) return 'Cambria';
    if (combined.includes('trebuchet')) return 'Trebuchet MS';
    if (combined.includes('tahoma')) return 'Tahoma';
    return 'Calibri';
  }

  /**
   * Helper: Detect bold formatting from font names
   */
  private static detectIsBold(pdfFontName: string, fontFamily?: string): boolean {
    const combined = `${pdfFontName} ${fontFamily || ''}`.toLowerCase();
    return (
      combined.includes('bold') ||
      combined.includes('heavy') ||
      combined.includes('black') ||
      combined.includes('semibold') ||
      combined.includes('medium') ||
      combined.includes('w700') ||
      combined.includes('w800') ||
      combined.includes('w900') ||
      combined.includes('bolder')
    );
  }

  /**
   * Helper: Detect italic formatting from font names
   */
  private static detectIsItalic(pdfFontName: string, fontFamily?: string): boolean {
    const combined = `${pdfFontName} ${fontFamily || ''}`.toLowerCase();
    return (
      combined.includes('italic') ||
      combined.includes('oblique') ||
      combined.includes('slanted')
    );
  }

  /**
   * Helper: Clean unicode text, normalize characters & remove PDF font artifacts
   */
  private static cleanUnicodeText(str: string): string {
    if (!str) return '';
    let text = str.normalize('NFC');

    text = text
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'st')
      .replace(/\uFB06/g, 'st');

    text = text.replace(/[\uE000-\uF8FF\uFFFD]/g, '');

    return text;
  }

  /**
   * Helper: Calculate median of numbers array
   */
  private static calculateMedian(numbers: number[], fallback: number): number {
    if (numbers.length === 0) return fallback;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
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
