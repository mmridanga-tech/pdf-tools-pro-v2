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
   * Estimate compressed file size based on level & original size
   */
  static estimateCompressedSize(originalSize: number, level: CompressionLevel): number {
    switch (level) {
      case 'less':
        return Math.round(originalSize * 0.82); // ~18% reduction
      case 'recommended':
        return Math.round(originalSize * 0.52); // ~48% reduction
      case 'extreme':
        return Math.round(originalSize * 0.28); // ~72% reduction
      default:
        return Math.round(originalSize * 0.5);
    }
  }

  /**
   * Main Compression Function supporting client & server engines with cancellation & progress
   */
  static async compressPDF(
    file: File,
    options: CompressOptions
  ): Promise<CompressResult> {
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

        progressBridge(5, 'Reading PDF structure...');

        // Try server API first if engine mode is 'server' or 'auto'
        if (engine === 'server') {
          try {
            progressBridge(10, 'Sending PDF to server compression microservice...');
            const formData = new FormData();
            formData.append('file', inputFile);
            formData.append('level', level);

            const response = await fetch('/api/convert/compress', {
              method: 'POST',
              body: formData,
              signal,
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
              const blob = await response.blob();
              const durationMs = Date.now() - startTime;
              const savingsBytes = Math.max(0, inputFile.size - blob.size);
              const savingsPercentage = Math.round((savingsBytes / inputFile.size) * 100);

              progressBridge(100, 'Server compression finished!');

              compressResultContainer = {
                blob,
                originalSize: inputFile.size,
                newSize: blob.size,
                savingsBytes,
                savingsPercentage,
                pageCount: 1,
                durationMs,
              };

              return blob;
            }
          } catch (err: any) {
            if (err?.name === 'AbortError') {
              throw new Error('Compression cancelled by user.');
            }
            console.warn('Server compression endpoint returned fallback, switching to client-side engine.');
          }
        }

        // High-Fidelity Client-Side Compression Engine
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
      throw new Error('PDF compression failed to produce a valid output result.');
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

    if (onProgress) onProgress(15, 'Optimizing PDF object streams...');

    // Step 1: Pass through pdf-lib for object stream compaction & metadata clean
    const { PDFDocument } = await import('pdf-lib');
    const pdfDocLib = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Remove unneeded metadata or forms for higher compression
    if (level === 'extreme' || level === 'recommended') {
      try {
        pdfDocLib.setTitle('');
        pdfDocLib.setAuthor('');
        pdfDocLib.setProducer('SmartPDF AI Compressor');
      } catch {
        // Ignore non-fatal metadata edit errors
      }
    }

    const pdfBytesLib = await pdfDocLib.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    const libBlob = new Blob([pdfBytesLib as any], { type: 'application/pdf' });

    let finalBlob = libBlob;
    let pageCount = 1;

    // Step 2: For medium/high compression or raster-heavy PDFs, apply image re-encoding
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      if (signal?.aborted) throw new Error('Compression cancelled by user.');

      // Scale and quality rules per level
      const scale = level === 'extreme' ? 1.0 : level === 'recommended' ? 1.25 : 1.5;
      const quality = level === 'extreme' ? 0.45 : level === 'recommended' ? 0.65 : 0.85;

      const jsPDFMod = await import('jspdf');
      const jsPDF = jsPDFMod.default;

      const firstPage = await pdfDoc.getPage(1);
      const vp1 = firstPage.getViewport({ scale: 1.0 });

      const doc = new jsPDF({
        orientation: vp1.width > vp1.height ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [vp1.width, vp1.height],
      });

      for (let i = 1; i <= pageCount; i++) {
        if (signal?.aborted) throw new Error('Compression cancelled by user.');

        if (onProgress) {
          const percent = 20 + Math.floor((i / pageCount) * 75);
          onProgress(percent, `Downsampling images & pages (${i}/${pageCount})...`);
        }

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
          await (page.render({ canvasContext: context, viewport } as any)).promise;
        }

        const jpegUrl = canvas.toDataURL('image/jpeg', quality);
        const pVp = page.getViewport({ scale: 1.0 });
        doc.addImage(jpegUrl, 'JPEG', 0, 0, pVp.width, pVp.height, undefined, 'FAST');
      }

      const renderBlob = doc.output('blob');

      // Always pick whichever blob produces the smaller file size without corruption
      if (renderBlob.size < libBlob.size) {
        finalBlob = renderBlob;
      }
    } catch (err: any) {
      if (err?.message === 'Compression cancelled by user.') {
        throw err;
      }
      console.warn('Canvas re-encoding step skipped, utilizing stream compacted PDF-lib output.', err);
      finalBlob = libBlob;
    }

    // Never return a compressed file larger than the original
    if (finalBlob.size > originalSize) {
      finalBlob = libBlob.size < originalSize ? libBlob : file;
    }

    if (onProgress) onProgress(100, 'Compression completed!');

    const durationMs = Date.now() - startTime;
    const newSize = finalBlob.size;
    const savingsBytes = Math.max(0, originalSize - newSize);
    const savingsPercentage = Math.round((savingsBytes / originalSize) * 100);

    return {
      blob: finalBlob,
      originalSize,
      newSize,
      savingsBytes,
      savingsPercentage,
      pageCount,
      durationMs,
    };
  }
}
