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
   * Convert Word (.docx) file to PDF using mammoth + jsPDF
   */
  static async wordToPDF(file: File): Promise<Blob> {
    const mammothMod = await import('mammoth');
    const mammoth = mammothMod.default || mammothMod;
    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;

    const arrayBuffer = await file.arrayBuffer();

    // Extract raw text from Word document
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || 'Converted Document';

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
    });

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(rawText, maxLineWidth);
    let y = margin;
    const lineHeight = 16;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    return doc.output('blob');
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
}
