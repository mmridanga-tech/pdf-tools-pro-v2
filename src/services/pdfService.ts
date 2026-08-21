import { parsePageRange } from '../utils/fileUtils';
import { WatermarkOptions, PageNumberOptions, OCROptions, ProcessedResult, PDFProtectOptions } from '../types/pdfTypes';
import { OCRService } from './ocrService';
import { WordConverterService, WordConversionOptions } from './wordConverterService';
import { PDFToWordService, PDFToWordOptions } from './pdfToWordService';
import { PDFCompressionService, CompressionLevel } from './pdfCompressionService';
import { ConversionManager } from '../core/ConversionManager';

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

    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      files,
      'pdf',
      async (_, tracker) => {
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
          const pct = Math.round((totalProcessed / files.length) * 100);
          if (onProgress) onProgress(pct);
          tracker.update('processing', pct, `Merging document ${totalProcessed} of ${files.length}...`);
        }

        const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Split a PDF by page ranges (e.g. "1-3, 5")
   */
  static async splitPDF(file: File, rangeStr: string): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        tracker.update('loading', 20, 'Loading PDF for page splitting...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const totalPages = sourcePdf.getPageCount();

        const selectedIndices = parsePageRange(rangeStr, totalPages);
        if (selectedIndices.length === 0) {
          throw new Error('No valid pages selected for splitting.');
        }

        tracker.update('processing', 50, `Splitting ${selectedIndices.length} page(s)...`);
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, selectedIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        tracker.update('rendering', 85, 'Compiling split PDF document...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }
    );
  }

  /**
   * Rotate specific pages in a PDF
   */
  static async rotatePDF(
    file: File,
    pageRotations: { [pageIndex: number]: number }
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        tracker.update('loading', 20, 'Loading PDF document...');
        const { PDFDocument, degrees } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        tracker.update('processing', 50, 'Applying page rotation angles...');
        pages.forEach((page, idx) => {
          const addAngle = pageRotations[idx] || 0;
          if (addAngle !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + addAngle) % 360));
          }
        });

        tracker.update('rendering', 85, 'Saving rotated PDF stream...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }
    );
  }

  /**
   * Compress a PDF by re-saving with object stream optimization and intelligent image downsampling
   */
  static async compressPDF(
    file: File,
    level: 'recommended' | 'extreme' | 'less' | CompressionLevel
  ): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
    const res = await PDFCompressionService.compressPDF(file, { level: level as CompressionLevel });
    return {
      blob: res.blob,
      originalSize: res.originalSize,
      newSize: res.newSize,
    };
  }

  /**
   * High-Fidelity Word (.docx / .doc) and ODT (.odt) to PDF conversion preserving styles, fonts, tables, images, margins, lists & headers/footers
   */
  static async wordToPDF(
    file: File,
    onProgress?: (percent: number, statusMsg?: string) => void,
    options?: WordConversionOptions
  ): Promise<Blob> {
    return WordConverterService.convertToPDF(file, {
      ...options,
      onProgress,
    });
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
   * Convert PDF to editable Word document (.docx)
   */
  static async pdfToWord(
    file: File,
    onProgress?: (percent: number, statusMsg?: string) => void,
    options?: PDFToWordOptions
  ): Promise<Blob> {
    return PDFToWordService.convertToWord(file, {
      ...options,
      onProgress,
    });
  }

  /**
   * Add text watermark to PDF
   */
  static async addWatermark(file: File, options: WatermarkOptions): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        tracker.update('loading', 20, 'Loading PDF document...');
        const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        tracker.update('processing', 50, 'Stamping text watermark on document pages...');
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

        tracker.update('rendering', 85, 'Saving watermarked PDF...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }
    );
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(file: File, options: PageNumberOptions): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        tracker.update('loading', 20, 'Loading PDF document...');
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        tracker.update('processing', 50, 'Inserting dynamic page numbers...');
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

        tracker.update('rendering', 85, 'Saving numbered PDF...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }
    );
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
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Reading PDF document...');
        const { PDFDocument } = await import('@cantoo/pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

        progressBridge(35, 'Parsing document structural tree...');
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        progressBridge(60, 'Applying encryption keys and permission flags...');
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

        progressBridge(85, 'Serializing protected PDF streams...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        progressBridge(100, 'PDF protection completed!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Unlock a password-protected PDF document
   */
  static async unlockPDF(
    file: File,
    password?: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Loading encrypted PDF document...');
        const { PDFDocument } = await import('@cantoo/pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

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

        progressBridge(50, 'Decrypting PDF streams and stripping password restrictions...');

        const unlockedDoc = await PDFDocument.create();
        const copiedPages = await unlockedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => unlockedDoc.addPage(page));

        progressBridge(85, 'Saving unlocked PDF document...');
        const pdfBytes = await unlockedDoc.save({ useObjectStreams: true });

        progressBridge(100, 'PDF unlocked successfully!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
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
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Loading PDF document...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const totalPages = pdfDoc.getPageCount();

        if (pageIndicesToDelete.length === 0) {
          throw new Error('No pages selected for deletion.');
        }

        if (pageIndicesToDelete.length >= totalPages) {
          throw new Error('Cannot delete all pages from a PDF. At least one page must remain in the document.');
        }

        progressBridge(40, `Removing ${pageIndicesToDelete.length} selected pages...`);

        // Sort indices in descending order so deleting higher indices does not alter lower indices
        const sortedIndices = [...new Set(pageIndicesToDelete)]
          .filter((idx) => idx >= 0 && idx < totalPages)
          .sort((a, b) => b - a);

        for (const pageIdx of sortedIndices) {
          pdfDoc.removePage(pageIdx);
        }

        progressBridge(80, 'Optimizing PDF document streams...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        progressBridge(100, 'Page deletion complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Extract specific pages from a PDF file into a new document
   */
  static async extractPages(
    file: File,
    pageIndicesToExtract: number[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Loading PDF document...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

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

        progressBridge(40, `Extracting ${validIndices.length} page(s)...`);

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

        progressBridge(80, 'Optimizing output PDF stream...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

        progressBridge(100, 'Page extraction complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Rearrange pages of a PDF file according to a new page index ordering
   */
  static async rearrangePages(
    file: File,
    newPageOrderIndices: number[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Loading PDF document...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

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

        progressBridge(40, `Re-ordering ${newPageOrderIndices.length} page(s)...`);

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

        progressBridge(80, 'Optimizing output PDF stream...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

        progressBridge(100, 'Page rearrangement complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
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
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(10, 'Loading PDF document...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

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

        progressBridge(30, `Duplicating ${validSelected.length} page(s)...`);

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

        progressBridge(60, `Assembling document with ${targetIndices.length} total pages...`);
        const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        progressBridge(85, 'Optimizing output PDF stream...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

        progressBridge(100, 'Page duplication complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }
}


