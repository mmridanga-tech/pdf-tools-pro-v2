import { parsePageRange } from '../utils/fileUtils';
import { WatermarkOptions, PageNumberOptions, OCROptions, ProcessedResult, PDFProtectOptions } from '../types/pdfTypes';
import { OCRService } from './ocrService';
import { WordConverterService, WordConversionOptions } from './wordConverterService';
import { PDFToWordService, PDFToWordOptions } from './pdfToWordService';
import { PDFCompressionService, CompressionLevel } from './pdfCompressionService';
import { ConversionManager } from '../core/ConversionManager';

export class PDFService {
  /**
   * Helper to safely copy standard metadata between PDF documents
   */
  private static copyMetadata(sourcePdf: any, targetPdf: any): void {
    try {
      const title = sourcePdf.getTitle();
      if (title) targetPdf.setTitle(title);
      const author = sourcePdf.getAuthor();
      if (author) targetPdf.setAuthor(author);
      const subject = sourcePdf.getSubject();
      if (subject) targetPdf.setSubject(subject);
      const keywords = sourcePdf.getKeywords();
      if (keywords) targetPdf.setKeywords(keywords);
      const creator = sourcePdf.getCreator();
      if (creator) targetPdf.setCreator(creator);
      const producer = sourcePdf.getProducer();
      if (producer) targetPdf.setProducer(producer);
    } catch {
      // Non-critical if metadata extraction fails
    }
  }

  /**
   * Get total number of pages in a PDF file
   */
  static async getPageCount(file: File): Promise<number> {
    if (!file) throw new Error('No PDF file provided.');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      return pdfDoc.getPageCount();
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('encrypted') || msg.includes('password')) {
        throw new Error('This PDF file is password protected. Please unlock it first.');
      }
      throw new Error('Could not parse PDF pages. The file may be damaged or invalid.');
    }
  }

  /**
   * Merge multiple PDF files into one
   */
  static async mergePDFs(
    files: File[],
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (!files || files.length === 0) {
      throw new Error('No files selected for merging. Please select at least one PDF file.');
    }

    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      files,
      'pdf',
      async (_, tracker) => {
        const { PDFDocument } = await import('pdf-lib');
        const mergedPdf = await PDFDocument.create();
        let totalProcessed = 0;
        let firstDocCopied = false;

        tracker.update('processing', 5, `Preparing to merge ${files.length} document(s)...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const arrayBuffer = await file.arrayBuffer();
          let pdfDoc;
          try {
            pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          } catch (err: any) {
            const errLower = err?.message?.toLowerCase() || '';
            if (errLower.includes('encrypted') || errLower.includes('password')) {
              throw new Error(`File "${file.name}" is password protected. Please unlock it before merging.`);
            }
            throw new Error(`Failed to load "${file.name}". The file may be corrupt.`);
          }

          if (!firstDocCopied) {
            this.copyMetadata(pdfDoc, mergedPdf);
            firstDocCopied = true;
          }

          const pageIndices = pdfDoc.getPageIndices();
          if (pageIndices.length > 0) {
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          }

          totalProcessed++;
          const pct = Math.round(10 + (totalProcessed / files.length) * 75);
          const msg = `Merged document ${totalProcessed} of ${files.length} ("${file.name}")...`;
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        }

        tracker.update('rendering', 88, 'Serializing unified PDF document...');
        const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
        tracker.update('assembling', 100, 'Merge completed successfully!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Split a PDF by page ranges (e.g. "1-3, 5")
   */
  static async splitPDF(
    file: File,
    rangeStr: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (!file) throw new Error('No PDF file provided for splitting.');
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(15, 'Loading PDF document for page splitting...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

        let sourcePdf;
        try {
          sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (err: any) {
          const errLower = err?.message?.toLowerCase() || '';
          if (errLower.includes('encrypted') || errLower.includes('password')) {
            throw new Error('This PDF file is password protected. Please unlock it before splitting.');
          }
          throw new Error('The selected PDF file is corrupted or unreadable.');
        }

        const totalPages = sourcePdf.getPageCount();
        if (totalPages === 0) {
          throw new Error('The source PDF document contains no pages.');
        }

        const selectedIndices = parsePageRange(rangeStr, totalPages);
        if (!selectedIndices || selectedIndices.length === 0) {
          throw new Error(`No valid pages found in range "${rangeStr}". Document has ${totalPages} page(s).`);
        }

        progressBridge(45, `Extracting ${selectedIndices.length} split page(s)...`);
        const newPdf = await PDFDocument.create();
        this.copyMetadata(sourcePdf, newPdf);

        const copiedPages = await newPdf.copyPages(sourcePdf, selectedIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        progressBridge(85, 'Compiling and saving split PDF document...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

        progressBridge(100, 'PDF splitting completed!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Rotate specific pages in a PDF
   */
  static async rotatePDF(
    file: File,
    pageRotations: { [pageIndex: number]: number },
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (!file) throw new Error('No PDF file provided for rotation.');
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(15, 'Loading PDF document for page rotation...');
        const { PDFDocument, degrees } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

        let pdfDoc;
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (err: any) {
          const errLower = err?.message?.toLowerCase() || '';
          if (errLower.includes('encrypted') || errLower.includes('password')) {
            throw new Error('This PDF file is password protected. Please unlock it before rotating.');
          }
          throw new Error('The selected PDF file is corrupted or unreadable.');
        }

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
          throw new Error('The PDF document contains no pages to rotate.');
        }

        progressBridge(50, 'Applying rotation angles to PDF pages...');
        pages.forEach((page, idx) => {
          const addAngle = pageRotations[idx] || 0;
          if (addAngle !== 0) {
            const currentRotation = page.getRotation()?.angle || 0;
            const totalAngle = ((currentRotation + addAngle) % 360 + 360) % 360;
            page.setRotation(degrees(totalAngle));
          }
        });

        progressBridge(85, 'Saving rotated PDF stream...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        progressBridge(100, 'PDF rotation complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
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
  static async addWatermark(
    file: File,
    options: WatermarkOptions,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (!file) throw new Error('No PDF file provided for watermarking.');
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(15, 'Loading PDF document for watermarking...');
        const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

        let pdfDoc;
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (err: any) {
          const errLower = err?.message?.toLowerCase() || '';
          if (errLower.includes('encrypted') || errLower.includes('password')) {
            throw new Error('This PDF file is password protected. Please unlock it before adding a watermark.');
          }
          throw new Error('The selected PDF file is corrupted or unreadable.');
        }

        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
          throw new Error('The PDF document contains no pages.');
        }

        progressBridge(45, 'Stamping text watermark on document pages...');
        const watermarkText = options.text || 'CONFIDENTIAL';
        const fontSize = options.fontSize || 48;
        const rotAngle = options.rotation !== undefined ? options.rotation : 45;
        const opacity = Math.max(0.01, Math.min(1.0, options.opacity !== undefined ? options.opacity : 0.3));

        // Parse color hex
        const cleanHex = (options.color || '#ff0000').replace(/^#/, '');
        let r = 0.8, g = 0.1, b = 0.1;
        if (cleanHex.length === 6) {
          r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
          g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
          b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
        } else if (cleanHex.length === 3) {
          r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255 || 0;
          g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255 || 0;
          b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255 || 0;
        }

        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        const thetaRad = (rotAngle * Math.PI) / 180;

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          // Calculate center offset with rotation
          const x = width / 2 - (textWidth / 2) * Math.cos(thetaRad) + (textHeight / 2) * Math.sin(thetaRad);
          const y = height / 2 - (textWidth / 2) * Math.sin(thetaRad) - (textHeight / 2) * Math.cos(thetaRad);

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotAngle),
          });
        });

        progressBridge(85, 'Saving watermarked PDF...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        progressBridge(100, 'Watermark applied successfully!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
    );
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(
    file: File,
    options: PageNumberOptions,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (!file) throw new Error('No PDF file provided for adding page numbers.');
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (pct: number, msg: string) => {
          if (onProgress) onProgress(pct, msg);
          tracker.update('processing', pct, msg);
        };

        progressBridge(15, 'Loading PDF document for page numbering...');
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const arrayBuffer = await inputFile.arrayBuffer();

        let pdfDoc;
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (err: any) {
          const errLower = err?.message?.toLowerCase() || '';
          if (errLower.includes('encrypted') || errLower.includes('password')) {
            throw new Error('This PDF file is password protected. Please unlock it before adding page numbers.');
          }
          throw new Error('The selected PDF file is corrupted or unreadable.');
        }

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        if (totalPages === 0) {
          throw new Error('The PDF document contains no pages.');
        }

        progressBridge(45, 'Inserting dynamic page numbers...');
        const startFrom = options.startFrom !== undefined ? options.startFrom : 1;
        const fontSize = 10;
        const margin = 25;

        pages.forEach((page, idx) => {
          const pageNum = startFrom + idx;
          const text =
            options.format === 'page-of-total'
              ? `Page ${pageNum} of ${totalPages}`
              : `${pageNum}`;

          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          let x = width / 2 - textWidth / 2;
          let y = margin;

          if (options.position.includes('left')) {
            x = margin;
          } else if (options.position.includes('right')) {
            x = width - textWidth - margin;
          }

          if (options.position.includes('top')) {
            y = height - margin - textHeight;
          } else {
            y = margin;
          }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        });

        progressBridge(85, 'Saving numbered PDF...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        progressBridge(100, 'Page numbering complete!');
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      { onProgress }
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
    if (!file) throw new Error('No PDF file provided for page deletion.');
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
          const errLower = err?.message?.toLowerCase() || '';
          if (errLower.includes('encrypted') || errLower.includes('password')) {
            throw new Error('This PDF file is password protected. Please unlock it before deleting pages.');
          }
          throw new Error('The selected PDF file appears to be corrupted or invalid.');
        }

        const totalPages = sourcePdf.getPageCount();

        if (!pageIndicesToDelete || pageIndicesToDelete.length === 0) {
          throw new Error('No pages selected for deletion.');
        }

        const toDeleteSet = new Set(
          pageIndicesToDelete.filter((idx) => idx >= 0 && idx < totalPages)
        );

        if (toDeleteSet.size === 0) {
          throw new Error('Selected page indices are out of range for this document.');
        }

        if (toDeleteSet.size >= totalPages) {
          throw new Error('Cannot delete all pages from a PDF. At least one page must remain in the document.');
        }

        progressBridge(40, `Removing ${toDeleteSet.size} selected page(s)...`);

        const remainingIndices = Array.from({ length: totalPages }, (_, i) => i).filter(
          (i) => !toDeleteSet.has(i)
        );

        const newPdf = await PDFDocument.create();
        this.copyMetadata(sourcePdf, newPdf);

        const copiedPages = await newPdf.copyPages(sourcePdf, remainingIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        progressBridge(80, 'Optimizing PDF document streams...');
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

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
        this.copyMetadata(sourcePdf, newPdf);

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
    if (!file) throw new Error('No PDF file provided for rearranging pages.');
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

        const validIndices = newPageOrderIndices.filter((idx) => idx >= 0 && idx < totalPages);
        if (validIndices.length === 0) {
          throw new Error('Selected page order indices are out of range for this document.');
        }

        progressBridge(40, `Re-ordering ${validIndices.length} page(s)...`);

        const newPdf = await PDFDocument.create();
        this.copyMetadata(sourcePdf, newPdf);

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
    if (!file) throw new Error('No PDF file provided for duplicating pages.');
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
        this.copyMetadata(sourcePdf, newPdf);

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


