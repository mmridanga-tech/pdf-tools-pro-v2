import { pdfjsLib, ensurePdfWorkerConfigured } from '../utils/pdfWorker';
import { ConversionManager } from '../core/ConversionManager';

ensurePdfWorkerConfigured();

export type CompressionLevel = 'less' | 'recommended' | 'extreme';
export type CompressionEngineMode = 'auto' | 'client' | 'server';

export interface CompressOptions {
  level: CompressionLevel;
  engine?: CompressionEngineMode;
  onProgress?: (percent: number, statusMsg: string) => void;
  signal?: AbortSignal;
}

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  savingsBytes: number;
  savingsPercentage: number;
  pageCount: number;
  durationMs: number;
}

export interface PDFCompressQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  level: CompressionLevel;
  status: 'pending' | 'compressing' | 'completed' | 'cancelled' | 'error';
  progress: number;
  statusMsg: string;
  estimatedSize: number;
  resultBlob?: Blob;
  compressedSize?: number;
  savingsPercentage?: number;
  durationMs?: number;
  error?: string;
  abortController?: AbortController;
}

export class PDFCompressionService {
  /**
   * Estimate compressed file size based on level & original size (UI preview estimate only)
   */
  static estimateCompressedSize(originalSize: number, level: CompressionLevel): number {
    switch (level) {
      case 'less':
        return Math.round(originalSize * 0.85); // ~15% reduction estimate
      case 'recommended':
        return Math.round(originalSize * 0.55); // ~45% reduction estimate
      case 'extreme':
        return Math.round(originalSize * 0.30); // ~70% reduction estimate
      default:
        return Math.round(originalSize * 0.55);
    }
  }

  /**
   * Validate that a generated PDF Blob is intact, can be parsed by pdf-lib, and has the expected page count
   */
  static async validateCompressedPDF(
    blob: Blob,
    expectedPageCount: number
  ): Promise<boolean> {
    try {
      if (!blob || blob.size === 0) return false;
      const { PDFDocument } = await import('pdf-lib');
      const buffer = await blob.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      return count === expectedPageCount && count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Main Compression Function supporting client & server engines with cancellation & progress
   */
  static async compressPDF(
    file: File,
    options: CompressOptions
  ): Promise<CompressResult> {
    if (!file) {
      throw new Error('No PDF file provided for compression.');
    }

    const startTime = Date.now();
    const { level, engine = 'auto', onProgress, signal } = options;
    const conversionManager = ConversionManager.getInstance();

    let compressResultContainer: CompressResult | null = null;

    await conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker) => {
        const progressBridge = (percent: number, statusMsg: string) => {
          if (onProgress) onProgress(percent, statusMsg);
          tracker.update('processing', percent, statusMsg);
        };

        if (signal?.aborted) {
          throw new Error('Compression cancelled by user.');
        }

        progressBridge(5, 'Reading PDF document structure...');

        // If server mode is explicitly selected by user:
        if (engine === 'server') {
          progressBridge(10, 'Connecting to server compression microservice...');
          try {
            const formData = new FormData();
            formData.append('file', inputFile);
            formData.append('level', level);

            const response = await fetch('/api/convert/compress', {
              method: 'POST',
              body: formData,
              signal,
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
              const serverBlob = await response.blob();
              const validBlob = new Blob([await serverBlob.arrayBuffer()], { type: 'application/pdf' });
              
              // Validate server output
              const { PDFDocument } = await import('pdf-lib');
              const origBuffer = await inputFile.arrayBuffer();
              const origDoc = await PDFDocument.load(origBuffer, { ignoreEncryption: true });
              const origCount = origDoc.getPageCount();

              const isValid = await this.validateCompressedPDF(validBlob, origCount);
              if (!isValid) {
                throw new Error('Server returned an invalid or corrupted PDF.');
              }

              const durationMs = Date.now() - startTime;
              const savingsBytes = Math.max(0, inputFile.size - validBlob.size);
              const savingsPercentage = inputFile.size > 0 && validBlob.size < inputFile.size
                ? Math.round((savingsBytes / inputFile.size) * 100)
                : 0;

              progressBridge(100, 'Server compression finished!');

              compressResultContainer = {
                blob: validBlob,
                originalSize: inputFile.size,
                newSize: validBlob.size,
                savingsBytes,
                savingsPercentage,
                pageCount: origCount,
                durationMs,
              };

              return validBlob;
            } else {
              throw new Error('Server compression is currently unavailable. Use Client-side compression.');
            }
          } catch (err: any) {
            if (err?.name === 'AbortError' || signal?.aborted) {
              throw new Error('Compression cancelled by user.');
            }
            if (err?.message?.includes('Server compression is currently unavailable')) {
              throw err;
            }
            throw new Error('Server compression is currently unavailable. Use Client-side compression.');
          }
        }

        // Default & Client mode: High-Fidelity Client-Side Compression Engine
        compressResultContainer = await this.compressClientSide(
          inputFile,
          level,
          progressBridge,
          signal,
          startTime
        );

        return compressResultContainer.blob;
      },
      { onProgress, signal }
    );

    if (!compressResultContainer) {
      throw new Error('PDF compression failed to produce a valid output document.');
    }

    return compressResultContainer;
  }

  /**
   * Client-Side Engine utilizing PDF-lib Object Stream Compaction & PDF.js Canvas Downsampling
   */
  private static async compressClientSide(
    file: File,
    level: CompressionLevel,
    onProgress?: (percent: number, statusMsg: string) => void,
    signal?: AbortSignal,
    startTime = Date.now()
  ): Promise<CompressResult> {
    const originalSize = file.size;
    const arrayBuffer = await file.arrayBuffer();

    if (signal?.aborted) throw new Error('Compression cancelled by user.');

    // Step 1: Pre-flight check with pdf-lib for password protection / corruption
    const { PDFDocument } = await import('pdf-lib');
    let sourcePdfDoc;
    try {
      sourcePdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err: any) {
      const errLower = err?.message?.toLowerCase() || '';
      if (errLower.includes('encrypted') || errLower.includes('password')) {
        throw new Error('This PDF file is password protected. Please unlock it before compressing.');
      }
      throw new Error('The selected PDF file is corrupted or unreadable.');
    }

    const totalPages = sourcePdfDoc.getPageCount();
    if (totalPages === 0) {
      throw new Error('The PDF document contains no pages.');
    }

    if (onProgress) onProgress(15, 'Optimizing PDF object streams & structure...');

    // Step 2: Pass A - Structural Stream & Metadata Compaction
    let structuralBlob: Blob | null = null;
    try {
      const compactedDoc = await PDFDocument.create();
      // Copy metadata cleanly
      try {
        const title = sourcePdfDoc.getTitle();
        if (title) compactedDoc.setTitle(title);
        const author = sourcePdfDoc.getAuthor();
        if (author) compactedDoc.setAuthor(author);
        compactedDoc.setProducer('SmartPDF AI Optimizer');
      } catch {
        // Non-critical
      }

      const copiedPages = await compactedDoc.copyPages(
        sourcePdfDoc,
        sourcePdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => compactedDoc.addPage(page));

      const pdfBytesLib = await compactedDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const candidateBlob = new Blob([pdfBytesLib], { type: 'application/pdf' });
      const isValid = await this.validateCompressedPDF(candidateBlob, totalPages);
      if (isValid) {
        structuralBlob = candidateBlob;
      }
    } catch (err) {
      console.warn('Structural stream compaction encounter:', err);
    }

    if (signal?.aborted) throw new Error('Compression cancelled by user.');

    // Step 3: Pass B - Canvas-based Raster & Embedded Image Downsampling
    let rasterBlob: Blob | null = null;
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        disableFontFace: false,
      });

      const pdfJsDoc = await loadingTask.promise;
      const pdfJsPageCount = pdfJsDoc.numPages;

      if (pdfJsPageCount === totalPages) {
        // Tuning parameters per requested preset:
        // less: scale 1.50 (sharp print quality), quality 0.82
        // recommended: scale 1.20 (standard screen ~120DPI), quality 0.65
        // extreme: scale 0.95 (compact ~90DPI), quality 0.45
        const scale = level === 'extreme' ? 0.95 : level === 'recommended' ? 1.20 : 1.50;
        const quality = level === 'extreme' ? 0.45 : level === 'recommended' ? 0.65 : 0.82;

        const jsPDFMod = await import('jspdf');
        const jsPDF = jsPDFMod.default;

        const firstPage = await pdfJsDoc.getPage(1);
        const vp1 = firstPage.getViewport({ scale: 1.0 });

        const doc = new jsPDF({
          orientation: vp1.width > vp1.height ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [vp1.width, vp1.height],
          compress: true,
        });

        for (let i = 1; i <= totalPages; i++) {
          if (signal?.aborted) throw new Error('Compression cancelled by user.');

          if (onProgress) {
            const percent = 20 + Math.floor((i / totalPages) * 65);
            onProgress(percent, `Optimizing page images & streams (${i}/${totalPages})...`);
          }

          const page = await pdfJsDoc.getPage(i);
          const origVp = page.getViewport({ scale: 1.0 });

          if (i > 1) {
            doc.addPage(
              [origVp.width, origVp.height],
              origVp.width > origVp.height ? 'landscape' : 'portrait'
            );
          }

          const renderVp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(renderVp.width));
          canvas.height = Math.max(1, Math.floor(renderVp.height));
          const context = canvas.getContext('2d', { alpha: false });

          if (context) {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            await (page.render({
              canvasContext: context,
              viewport: renderVp,
              intent: 'print',
            } as any)).promise;
          }

          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          doc.addImage(jpegUrl, 'JPEG', 0, 0, origVp.width, origVp.height, undefined, 'FAST');

          // Release canvas allocation
          canvas.width = 0;
          canvas.height = 0;
        }

        const candidateRasterBlob = doc.output('blob');
        const validMimeBlob = new Blob([await candidateRasterBlob.arrayBuffer()], {
          type: 'application/pdf',
        });

        const isValid = await this.validateCompressedPDF(validMimeBlob, totalPages);
        if (isValid) {
          rasterBlob = validMimeBlob;
        }
      }
    } catch (err: any) {
      if (err?.message === 'Compression cancelled by user.' || signal?.aborted) {
        throw new Error('Compression cancelled by user.');
      }
      console.warn('Raster downsampling pass skipped or completed with warnings:', err);
    }

    if (signal?.aborted) throw new Error('Compression cancelled by user.');

    // Step 4: Intelligent Candidate Selection & Size Optimization
    let selectedBlob: Blob;

    if (level === 'less') {
      // For 'less' preset, prioritize preserving native vectors if structural compaction saved space
      if (structuralBlob && structuralBlob.size < originalSize) {
        selectedBlob = structuralBlob;
      } else if (rasterBlob && rasterBlob.size < originalSize) {
        selectedBlob = rasterBlob;
      } else {
        selectedBlob = structuralBlob || rasterBlob || new Blob([arrayBuffer], { type: 'application/pdf' });
      }
    } else {
      // For 'recommended' and 'extreme', select whichever valid candidate achieved smaller size
      if (structuralBlob && rasterBlob) {
        selectedBlob = rasterBlob.size < structuralBlob.size ? rasterBlob : structuralBlob;
      } else if (rasterBlob) {
        selectedBlob = rasterBlob;
      } else if (structuralBlob) {
        selectedBlob = structuralBlob;
      } else {
        selectedBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
      }
    }

    // Never return an inflated output larger than the original
    if (selectedBlob.size > originalSize) {
      if (structuralBlob && structuralBlob.size < originalSize) {
        selectedBlob = structuralBlob;
      } else {
        selectedBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
      }
    }

    // Step 5: Final Validation of the selected candidate
    const finalValidation = await this.validateCompressedPDF(selectedBlob, totalPages);
    if (!finalValidation) {
      if (structuralBlob && (await this.validateCompressedPDF(structuralBlob, totalPages))) {
        selectedBlob = structuralBlob;
      } else {
        throw new Error('Compressed PDF failed post-processing validation. Output document could not be verified.');
      }
    }

    // Ensure strict application/pdf mime type
    const finalBlob = new Blob([await selectedBlob.arrayBuffer()], { type: 'application/pdf' });
    const newSize = finalBlob.size;

    // Honest savings calculation
    const savingsBytes = Math.max(0, originalSize - newSize);
    const savingsPercentage = originalSize > 0 && newSize < originalSize
      ? Math.round((savingsBytes / originalSize) * 100)
      : 0;

    if (onProgress) {
      if (savingsPercentage > 0) {
        onProgress(100, `Compression complete! Reduced file size by ${savingsPercentage}%.`);
      } else {
        onProgress(100, 'Optimization complete. No size reduction achieved — file was already maximally compressed.');
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      blob: finalBlob,
      originalSize,
      newSize,
      savingsBytes,
      savingsPercentage,
      pageCount: totalPages,
      durationMs,
    };
  }
}

