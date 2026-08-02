import { parsePageRange } from '../utils/fileUtils';
import { WatermarkOptions, PageNumberOptions, OCROptions, ProcessedResult, PDFProtectOptions } from '../types/pdfTypes';
import { OCRService } from './ocrService';

export class PDFService {
  /**
   * Get total number of pages in a PDF file
   */
  static async getPageCount(file: File): Promise<number> {
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  }

  /**
   * Merge multiple PDF files into one
   */
  static async mergePDFs(files: File[], onProgress?: (percent: number) => void): Promise<Blob> {
    if (files.length === 0) throw new Error('No files selected for merging.');

    const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();
    let totalProcessed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      copiedPages.forEach((page) => mergedPdf.addPage(page));

      totalProcessed++;
      if (onProgress) {
        onProgress(Math.round((totalProcessed / files.length) * 100));
      }
    }

    const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Split a PDF by page ranges (e.g. "1-3, 5")
   */
  static async splitPDF(file: File, rangeStr: string): Promise<Blob> {
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    const selectedIndices = parsePageRange(rangeStr, totalPages);
    if (selectedIndices.length === 0) {
      throw new Error('No valid pages selected for splitting.');
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, selectedIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Rotate specific pages in a PDF
   */
  static async rotatePDF(
    file: File,
    pageRotations: { [pageIndex: number]: number }
  ): Promise<Blob> {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    pages.forEach((page, idx) => {
      const addAngle = pageRotations[idx] || 0;
      if (addAngle !== 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + addAngle) % 360));
      }
    });

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Compress a PDF by re-saving with object stream optimization and intelligent image downsampling
   */
  static async compressPDF(
    file: File,
    level: 'recommended' | 'extreme' | 'less'
  ): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
    const originalSize = file.size;
    const arrayBuffer = await file.arrayBuffer();

    const { PDFDocument } = await import('pdf-lib');
    const pdfDocLib = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pdfBytesLib = await pdfDocLib.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    const libBlob = new Blob([pdfBytesLib], { type: 'application/pdf' });

    let finalBlob = libBlob;

    if (level === 'recommended' || level === 'extreme') {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;

        const jsPDFMod = await import('jspdf');
        const jsPDF = jsPDFMod.default;

        const scale = level === 'extreme' ? 1.0 : 1.25;
        const quality = level === 'extreme' ? 0.45 : 0.65;

        const firstPage = await pdfDoc.getPage(1);
        const vp1 = firstPage.getViewport({ scale: 1.0 });

        const doc = new jsPDF({
          orientation: vp1.width > vp1.height ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [vp1.width, vp1.height],
        });

        for (let i = 1; i <= pageCount; i++) {
          if (i > 1) {
            const p = await pdfDoc.getPage(i);
            const pVp = p.getViewport({ scale: 1.0 });
            doc.addPage([pVp.width, pVp.height], pVp.width > pVp.height ? 'landscape' : 'portrait');
          }

          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');

          if (context) {
            await page.render({ canvasContext: context, viewport, canvas }).promise;
          }

          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          const pVp = page.getViewport({ scale: 1.0 });
          doc.addImage(jpegUrl, 'JPEG', 0, 0, pVp.width, pVp.height, undefined, 'FAST');
        }

        const renderBlob = doc.output('blob');

        // Choose the smaller blob between libBlob and renderBlob
        if (renderBlob.size < libBlob.size) {
          finalBlob = renderBlob;
        }
      } catch {
        finalBlob = libBlob;
      }
    }

    const newSize = finalBlob.size;
    return { blob: finalBlob, originalSize, newSize };
  }

  /**
   * High-Fidelity Word (.docx / .doc) to PDF conversion preserving styles, fonts, tables, images, margins, lists & Unicode
   */
  static async wordToPDF(
    file: File,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading Word document buffer...');
    const arrayBuffer = await file.arrayBuffer();

    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;
    const html2canvasMod: any = await import('html2canvas');
    const html2canvas = html2canvasMod.default || html2canvasMod;

    // Create an off-screen container for high-fidelity DOM layout rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '816px'; // standard Letter/A4 width at 96 DPI
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.zIndex = '-9999';
    document.body.appendChild(container);

    const overrideStyles = document.createElement('style');
    overrideStyles.innerHTML = `
      .docx-wrapper { background: #ffffff !important; padding: 0 !important; }
      section.docx { box-shadow: none !important; margin: 0 auto !important; background: #ffffff !important; border: none !important; }
    `;
    container.appendChild(overrideStyles);

    try {
      if (onProgress) onProgress(25, 'Rendering document layout, tables, and typography...');

      let pageElements: HTMLElement[] = [];

      // Primary rendering attempt: docx-preview for exact OpenXML Word rendering
      try {
        const docxPreview = await import('docx-preview');
        const renderAsync = docxPreview.renderAsync;

        await renderAsync(arrayBuffer, container, undefined, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
        });

        // Query rendered section elements representing distinct pages
        const sections = Array.from(container.querySelectorAll('section.docx')) as HTMLElement[];
        if (sections.length > 0) {
          pageElements = sections;
        } else {
          const wrapper = container.querySelector('.docx-wrapper') as HTMLElement;
          if (wrapper && wrapper.children.length > 0) {
            pageElements = Array.from(wrapper.children) as HTMLElement[];
          } else {
            pageElements = [container];
          }
        }
      } catch (docErr) {
        console.warn('docx-preview rendering notice, falling back to Mammoth HTML rendering:', docErr);
        container.innerHTML = '';
        container.appendChild(overrideStyles);

        const mammothMod = await import('mammoth');
        const mammoth = mammothMod.default || mammothMod;

        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = htmlResult.value || '<p>Empty Document</p>';

        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.padding = '48px';
        wrapperDiv.style.fontFamily = "'Calibri', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
        wrapperDiv.style.fontSize = '14px';
        wrapperDiv.style.lineHeight = '1.6';
        wrapperDiv.style.color = '#111111';
        wrapperDiv.innerHTML = `
          <style>
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: 600; }
            img { max-width: 100%; height: auto; margin: 12px 0; display: block; }
            h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 20px; margin-bottom: 10px; font-weight: 700; line-height: 1.3; }
            h1 { font-size: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            h2 { font-size: 20px; }
            h3 { font-size: 16px; }
            ul, ol { padding-left: 24px; margin: 12px 0; }
            p { margin: 8px 0; }
            blockquote { border-left: 4px solid #3b82f6; padding-left: 12px; margin: 12px 0; color: #4b5563; }
          </style>
          ${htmlContent}
        `;
        container.appendChild(wrapperDiv);
        pageElements = [wrapperDiv];
      }

      if (onProgress) onProgress(50, `Capturing ${pageElements.length} page(s) into PDF...`);

      let pdfDoc: any = null;

      for (let i = 0; i < pageElements.length; i++) {
        const elem = pageElements[i];
        if (onProgress) {
          const stepPercent = 50 + Math.floor(((i + 1) / pageElements.length) * 40);
          onProgress(stepPercent, `Processing page ${i + 1} of ${pageElements.length}...`);
        }

        const canvas = await html2canvas(elem, {
          scale: 2, // 2x high DPI for vector-like text & crisp graphics
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 816,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const pdfWidth = imgWidth * 0.75;
        const pdfHeight = imgHeight * 0.75;

        // If a single page element is longer than 1000pt (e.g. multi-page mammoth fallback)
        if (pageElements.length === 1 && pdfHeight > 1000) {
          const pageHeightPt = 841.89; // Standard A4 height in pt
          const pageWidthPt = 595.28;  // Standard A4 width in pt
          const scaleRatio = pageWidthPt / pdfWidth;
          const scaledTotalHeightPt = pdfHeight * scaleRatio;

          let yOffsetPt = 0;
          let pageIndex = 0;

          while (yOffsetPt < scaledTotalHeightPt) {
            if (pageIndex > 0) {
              pdfDoc.addPage([pageWidthPt, pageHeightPt], 'portrait');
            } else {
              pdfDoc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: [pageWidthPt, pageHeightPt],
              });
            }

            pdfDoc.addImage(
              imgData,
              'JPEG',
              0,
              -yOffsetPt,
              pageWidthPt,
              scaledTotalHeightPt
            );

            yOffsetPt += pageHeightPt;
            pageIndex++;
          }
        } else {
          // Standard page section rendering
          if (i === 0) {
            pdfDoc = new jsPDF({
              orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [pdfWidth, pdfHeight],
            });
            pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          } else {
            pdfDoc.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'landscape' : 'portrait');
            pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          }
        }
      }

      if (onProgress) onProgress(95, 'Generating output PDF stream...');
      const outputBlob = pdfDoc ? pdfDoc.output('blob') : new Blob([], { type: 'application/pdf' });

      if (onProgress) onProgress(100, 'Word to PDF conversion complete!');
      return outputBlob;

    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Helper to extract real text lines from a pdfjs page
   */
  private static async extractLinesFromPDFPage(page: any): Promise<string[]> {
    const textContent = await page.getTextContent();
    const items = textContent.items || [];
    const textItems: { str: string; x: number; y: number }[] = [];

    for (const item of items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        textItems.push({
          str: item.str,
          x: transform[4] || 0,
          y: transform[5] || 0,
        });
      }
    }

    if (textItems.length === 0) {
      // Fallback: Check if scanned image page and run OCR
      try {
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('eng');
          const { data } = await worker.recognize(canvas.toDataURL('image/png'));
          await worker.terminate();
          if (data && data.text) {
            return data.text.split('\n').map((l: string) => l.trim()).filter(Boolean);
          }
        }
      } catch {
        return [];
      }
      return [];
    }

    // Group items into lines based on Y coordinate (Y rounded to 4pt buckets)
    const linesMap = new Map<number, { str: string; x: number }[]>();
    for (const item of textItems) {
      const lineKey = Math.round(item.y / 4) * 4;
      if (!linesMap.has(lineKey)) {
        linesMap.set(lineKey, []);
      }
      linesMap.get(lineKey)!.push(item);
    }

    // Sort line keys descending (PDF Y=0 is bottom, higher Y is top of page)
    const sortedLineKeys = Array.from(linesMap.keys()).sort((a, b) => b - a);

    const lines: string[] = [];
    for (const lineKey of sortedLineKeys) {
      const lineItems = linesMap.get(lineKey)!;
      lineItems.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim();
      if (lineText) {
        lines.push(lineText);
      }
    }

    return lines;
  }

  /**
   * Convert PDF to editable Word document (.docx) by extracting real text
   */
  static async pdfToWord(file: File): Promise<Blob> {
    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import('docx');

    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const docChildren: InstanceType<typeof Paragraph>[] = [
      new Paragraph({
        text: file.name.replace(/\.pdf$/i, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Converted from PDF document (${pageCount} ${pageCount === 1 ? 'page' : 'pages'})`,
            italics: true,
            color: '666666',
          }),
        ],
        spacing: { after: 300 },
      }),
    ];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const pageLines = await PDFService.extractLinesFromPDFPage(page);

      if (pageCount > 1) {
        docChildren.push(
          new Paragraph({
            text: `Page ${i}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 240, after: 120 },
          })
        );
      }

      if (pageLines.length > 0) {
        for (const lineText of pageLines) {
          docChildren.push(
            new Paragraph({
              text: lineText,
              spacing: { after: 100 },
            })
          );
        }
      } else {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '[No extractable text on this page]',
                italics: true,
                color: '888888',
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Add text watermark to PDF
   */
  static async addWatermark(file: File, options: WatermarkOptions): Promise<Blob> {
    const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    const hex = options.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.5;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.5;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.5;

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = font.heightAtSize(options.fontSize);

      page.drawText(options.text, {
        x: width / 2 - textWidth / 2,
        y: height / 2 - textHeight / 2,
        size: options.fontSize,
        font: font,
        color: rgb(r, g, b),
        opacity: options.opacity,
        rotate: degrees(options.rotation || 45),
      });
    });

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(file: File, options: PageNumberOptions): Promise<Blob> {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    pages.forEach((page, idx) => {
      const pageNum = options.startFrom + idx;
      const text =
        options.format === 'page-of-total'
          ? `Page ${pageNum} of ${totalPages}`
          : `${pageNum}`;

      const { width, height } = page.getSize();
      const fontSize = 10;
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x = width / 2 - textWidth / 2;
      let y = 20;

      if (options.position.includes('left')) x = 30;
      if (options.position.includes('right')) x = width - textWidth - 30;
      if (options.position.includes('top')) y = height - 30;

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Perform OCR Pro on scanned PDF or image files
   */
  static async ocrPDF(
    file: File,
    options: OCROptions,
    onProgress?: (percent: number, statusMessage?: string) => void
  ): Promise<ProcessedResult> {
    return OCRService.processOCR(file, options, onProgress);
  }

  /**
   * Protect a PDF document with user/owner passwords and granular permissions
   */
  static async protectPDF(
    file: File,
    options: PDFProtectOptions,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Reading PDF document...');
    const { PDFDocument } = await import('@cantoo/pdf-lib');
    const arrayBuffer = await file.arrayBuffer();

    if (onProgress) onProgress(35, 'Parsing document structural tree...');
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    if (onProgress) onProgress(60, 'Applying encryption keys and permission flags...');
    pdfDoc.encrypt({
      userPassword: options.userPassword || '',
      ownerPassword: options.ownerPassword || options.userPassword || '',
      permissions: {
        printing: options.permissions.printing ? 'highResolution' : false,
        copying: options.permissions.copying,
        modifying: options.permissions.editing,
        annotating: options.permissions.annotating,
        fillingForms: options.permissions.editing,
        contentAccessibility: true,
        documentAssembly: options.permissions.editing,
      },
    });

    if (onProgress) onProgress(85, 'Serializing protected PDF streams...');
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'PDF protection completed!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Unlock a password-protected PDF document
   */
  static async unlockPDF(
    file: File,
    password?: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading encrypted PDF document...');
    const { PDFDocument } = await import('@cantoo/pdf-lib');
    const arrayBuffer = await file.arrayBuffer();

    let pdfDoc: any;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { password: password || '' });
    } catch (err: any) {
      if (
        err &&
        err.message &&
        (err.message.toLowerCase().includes('encrypted') ||
          err.message.toLowerCase().includes('password'))
      ) {
        throw new Error('Incorrect password or document is password protected. Please enter the valid password.');
      }
      throw err;
    }

    if (onProgress) onProgress(50, 'Decrypting PDF streams and stripping password restrictions...');

    const unlockedDoc = await PDFDocument.create();
    const copiedPages = await unlockedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => unlockedDoc.addPage(page));

    if (onProgress) onProgress(85, 'Saving unlocked PDF document...');
    const pdfBytes = await unlockedDoc.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'PDF unlocked successfully!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Check if a PDF file is encrypted/password protected
   */
  static async isPDFEncrypted(file: File): Promise<boolean> {
    try {
      const { PDFDocument } = await import('@cantoo/pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.isEncrypted;
    } catch (err: any) {
      if (
        err &&
        err.message &&
        (err.message.toLowerCase().includes('encrypted') ||
          err.message.toLowerCase().includes('password'))
      ) {
        return true;
      }
      return false;
    }
  }

  /**
   * Delete specific pages from a PDF file
   */
  static async deletePages(
    file: File,
    pageIndicesToDelete: number[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading PDF document...');
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    if (pageIndicesToDelete.length === 0) {
      throw new Error('No pages selected for deletion.');
    }

    if (pageIndicesToDelete.length >= totalPages) {
      throw new Error('Cannot delete all pages from a PDF. At least one page must remain in the document.');
    }

    if (onProgress) onProgress(40, `Removing ${pageIndicesToDelete.length} selected pages...`);

    // Sort indices in descending order so deleting higher indices does not alter lower indices
    const sortedIndices = [...new Set(pageIndicesToDelete)]
      .filter((idx) => idx >= 0 && idx < totalPages)
      .sort((a, b) => b - a);

    for (const pageIdx of sortedIndices) {
      pdfDoc.removePage(pageIdx);
    }

    if (onProgress) onProgress(80, 'Optimizing PDF document streams...');
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'Page deletion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Extract specific pages from a PDF file into a new document
   */
  static async extractPages(
    file: File,
    pageIndicesToExtract: number[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading PDF document...');
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();

    let sourcePdf;
    try {
      sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('encrypted') || err?.message?.toLowerCase().includes('password')) {
        throw new Error('This PDF file is password protected. Please unlock it first before extracting pages.');
      }
      throw new Error('The selected PDF file appears to be corrupted or invalid.');
    }

    const totalPages = sourcePdf.getPageCount();

    if (!pageIndicesToExtract || pageIndicesToExtract.length === 0) {
      throw new Error('No pages selected for extraction.');
    }

    const validIndices = pageIndicesToExtract.filter((idx) => idx >= 0 && idx < totalPages);
    if (validIndices.length === 0) {
      throw new Error('Selected page indices are out of range for this document.');
    }

    if (onProgress) onProgress(40, `Extracting ${validIndices.length} page(s)...`);

    const newPdf = await PDFDocument.create();

    // Preserve metadata if present
    try {
      const title = sourcePdf.getTitle();
      if (title) newPdf.setTitle(title);
      const author = sourcePdf.getAuthor();
      if (author) newPdf.setAuthor(author);
      const subject = sourcePdf.getSubject();
      if (subject) newPdf.setSubject(subject);
      const creator = sourcePdf.getCreator();
      if (creator) newPdf.setCreator(creator);
      const producer = sourcePdf.getProducer();
      if (producer) newPdf.setProducer(producer);
    } catch {
      // Ignore metadata copying issues
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    if (onProgress) onProgress(80, 'Optimizing output PDF stream...');
    const pdfBytes = await newPdf.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'Page extraction complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Rearrange pages of a PDF file according to a new page index ordering
   */
  static async rearrangePages(
    file: File,
    newPageOrderIndices: number[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading PDF document...');
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();

    let sourcePdf;
    try {
      sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('encrypted') || err?.message?.toLowerCase().includes('password')) {
        throw new Error('This PDF file is password protected. Please unlock it first before rearranging pages.');
      }
      throw new Error('The selected PDF file appears to be corrupted or invalid.');
    }

    const totalPages = sourcePdf.getPageCount();

    if (!newPageOrderIndices || newPageOrderIndices.length === 0) {
      throw new Error('No page order provided.');
    }

    if (onProgress) onProgress(40, `Re-ordering ${newPageOrderIndices.length} page(s)...`);

    const newPdf = await PDFDocument.create();

    // Copy metadata
    try {
      const title = sourcePdf.getTitle();
      if (title) newPdf.setTitle(title);
      const author = sourcePdf.getAuthor();
      if (author) newPdf.setAuthor(author);
      const subject = sourcePdf.getSubject();
      if (subject) newPdf.setSubject(subject);
      const creator = sourcePdf.getCreator();
      if (creator) newPdf.setCreator(creator);
      const producer = sourcePdf.getProducer();
      if (producer) newPdf.setProducer(producer);
    } catch {
      // Ignore metadata copying issues
    }

    const validIndices = newPageOrderIndices.filter((idx) => idx >= 0 && idx < totalPages);
    const copiedPages = await newPdf.copyPages(sourcePdf, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    if (onProgress) onProgress(80, 'Optimizing output PDF stream...');
    const pdfBytes = await newPdf.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'Page rearrangement complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Duplicate specific pages from a PDF file either after each original page or at the end of the document
   */
  static async duplicatePages(
    file: File,
    pageIndicesToDuplicate: number[],
    placement: 'after' | 'end' = 'after',
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(10, 'Loading PDF document...');
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();

    let sourcePdf;
    try {
      sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('encrypted') || err?.message?.toLowerCase().includes('password')) {
        throw new Error('This PDF file is password protected. Please unlock it first before duplicating pages.');
      }
      throw new Error('The selected PDF file appears to be corrupted or invalid.');
    }

    const totalPages = sourcePdf.getPageCount();

    if (!pageIndicesToDuplicate || pageIndicesToDuplicate.length === 0) {
      throw new Error('No pages selected for duplication.');
    }

    const validSelected = pageIndicesToDuplicate
      .filter((idx) => idx >= 0 && idx < totalPages)
      .sort((a, b) => a - b);

    if (validSelected.length === 0) {
      throw new Error('Selected page indices are out of range for this document.');
    }

    if (onProgress) onProgress(30, `Duplicating ${validSelected.length} page(s)...`);

    // Build ordered list of source page indices to build into the target PDF
    const targetIndices: number[] = [];

    if (placement === 'after') {
      for (let i = 0; i < totalPages; i++) {
        targetIndices.push(i);
        if (validSelected.includes(i)) {
          targetIndices.push(i);
        }
      }
    } else {
      // placement === 'end'
      for (let i = 0; i < totalPages; i++) {
        targetIndices.push(i);
      }
      for (const idx of validSelected) {
        targetIndices.push(idx);
      }
    }

    const newPdf = await PDFDocument.create();

    // Preserve metadata
    try {
      const title = sourcePdf.getTitle();
      if (title) newPdf.setTitle(title);
      const author = sourcePdf.getAuthor();
      if (author) newPdf.setAuthor(author);
      const subject = sourcePdf.getSubject();
      if (subject) newPdf.setSubject(subject);
      const creator = sourcePdf.getCreator();
      if (creator) newPdf.setCreator(creator);
      const producer = sourcePdf.getProducer();
      if (producer) newPdf.setProducer(producer);
    } catch {
      // Ignore metadata copying issues
    }

    if (onProgress) onProgress(60, `Assembling document with ${targetIndices.length} total pages...`);
    const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    if (onProgress) onProgress(85, 'Optimizing output PDF stream...');
    const pdfBytes = await newPdf.save({ useObjectStreams: true });

    if (onProgress) onProgress(100, 'Page duplication complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
}


