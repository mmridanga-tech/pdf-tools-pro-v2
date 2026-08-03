import { formatBytes } from '../utils/fileUtils';

export interface ImageToPDFItem {
  file: File;
  rotation?: number; // 0, 90, 180, 270
}

export interface ImageToPDFOptions {
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number; // in pt or mm
  pageSize: 'a4' | 'letter' | 'fit';
  quality?: number; // 0.1 to 1.0
}

export interface CompressImageOptions {
  quality: number; // 0.1 to 1.0
  format: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface ResizeImageOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
}

export interface ConvertedPdfPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
}

export class ImageService {
  /**
   * Helper to load an HTML Image element from a File or Blob
   */
  static async loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file. Please ensure it is a valid image format.'));
      };
      img.src = url;
    });
  }

  /**
   * Convert multiple image files or items into a compiled PDF
   */
  static async imageToPDF(
    itemsInput: (File | ImageToPDFItem)[],
    options: ImageToPDFOptions = { orientation: 'auto', margin: 20, pageSize: 'a4', quality: 0.92 },
    onProgress?: (percent: number, msg: string) => void
  ): Promise<Blob> {
    if (itemsInput.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    if (onProgress) onProgress(5, 'Initializing PDF compiler engine...');

    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;

    let doc: InstanceType<typeof jsPDF> | null = null;
    const quality = typeof options.quality === 'number' ? Math.min(1.0, Math.max(0.1, options.quality)) : 0.92;

    for (let i = 0; i < itemsInput.length; i++) {
      const rawItem = itemsInput[i];
      const file = rawItem instanceof File ? rawItem : rawItem.file;
      const rotation = rawItem instanceof File ? 0 : rawItem.rotation || 0;

      if (onProgress) {
        const pct = Math.round(10 + (i / itemsInput.length) * 85);
        onProgress(pct, `Processing image ${i + 1} of ${itemsInput.length}...`);
      }

      const img = await ImageService.loadImageFromFile(file);
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      const isRotated90 = rotation === 90 || rotation === 270;
      const canvasW = isRotated90 ? naturalH : naturalW;
      const canvasH = isRotated90 ? naturalW : naturalH;

      // Create canvas to render clean rotated data URL
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas 2d context.');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -naturalW / 2, -naturalH / 2);
      ctx.restore();

      const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      let pageW = 595.28; // A4 pt width
      let pageH = 841.89; // A4 pt height

      if (options.pageSize === 'letter') {
        pageW = 612;
        pageH = 792;
      } else if (options.pageSize === 'fit') {
        pageW = imgWidth + options.margin * 2;
        pageH = imgHeight + options.margin * 2;
      }

      let orientation: 'p' | 'l' = 'p';
      if (options.orientation === 'auto') {
        orientation = imgWidth > imgHeight ? 'l' : 'p';
        if (orientation === 'l' && options.pageSize !== 'fit' && pageW < pageH) {
          const tmp = pageW;
          pageW = pageH;
          pageH = tmp;
        }
      } else if (options.orientation === 'landscape') {
        orientation = 'l';
        if (options.pageSize !== 'fit' && pageW < pageH) {
          const tmp = pageW;
          pageW = pageH;
          pageH = tmp;
        }
      } else {
        orientation = 'p';
        if (options.pageSize !== 'fit' && pageW > pageH) {
          const tmp = pageW;
          pageW = pageH;
          pageH = tmp;
        }
      }

      if (i === 0) {
        doc = new jsPDF({
          orientation: orientation,
          unit: 'pt',
          format: options.pageSize === 'fit' ? [pageW, pageH] : options.pageSize,
        });
      } else {
        doc?.addPage(
          options.pageSize === 'fit' ? [pageW, pageH] : options.pageSize,
          orientation
        );
      }

      // Calculate placement inside margin
      const margin = options.margin;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;

      let drawW = availW;
      let drawH = (imgHeight * drawW) / imgWidth;

      if (drawH > availH) {
        drawH = availH;
        drawW = (imgWidth * drawH) / imgHeight;
      }

      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      doc?.addImage(imgDataUrl, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');
    }

    if (onProgress) onProgress(100, 'Compilation finished!');

    if (!doc) throw new Error('Failed to create PDF document.');
    return doc.output('blob');
  }

  /**
   * Quick thumbnail generator for PDF page preview grid
   */
  static async getPdfThumbnails(
    file: File,
    onProgress?: (percent: number, msg?: string) => void
  ): Promise<{ pageNumber: number; thumbnailDataUrl: string; width: number; height: number }[]> {
    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const thumbnails = [];

    for (let i = 1; i <= pageCount; i++) {
      if (onProgress) {
        onProgress(Math.round((i / pageCount) * 100), `Loading page preview ${i}/${pageCount}...`);
      }

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        thumbnails.push({
          pageNumber: i,
          thumbnailDataUrl: canvas.toDataURL('image/jpeg', 0.75),
          width: Math.round(viewport.width / 0.35),
          height: Math.round(viewport.height / 0.35),
        });
      }
    }

    return thumbnails;
  }

  /**
   * Convert PDF document pages into high quality image files (PNG or JPEG)
   */
  static async pdfToImage(
    file: File,
    options: {
      format: 'png' | 'jpeg';
      qualityPreset?: 'standard' | 'hd' | 'ultrahd';
      quality?: number;
      scale?: number;
      pagesToExtract?: number[];
    } = { format: 'png', qualityPreset: 'hd' },
    onProgress?: (percent: number, msg?: string) => void
  ): Promise<ConvertedPdfPageImage[]> {
    if (onProgress) onProgress(5, 'Loading PDF document renderer...');

    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    ensurePdfWorkerConfigured();

    // Resolution scale and compression quality per preset
    let scale = options.scale || 2.0;
    let quality = options.quality || 0.92;

    if (options.qualityPreset === 'standard') {
      scale = 1.0;
      quality = 0.82;
    } else if (options.qualityPreset === 'hd') {
      scale = 2.0;
      quality = 0.92;
    } else if (options.qualityPreset === 'ultrahd') {
      scale = 3.0;
      quality = 0.98;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const pagesToProcess = options.pagesToExtract && options.pagesToExtract.length > 0
      ? options.pagesToExtract.filter((p) => p >= 1 && p <= pageCount)
      : Array.from({ length: pageCount }, (_, idx) => idx + 1);

    const results: ConvertedPdfPageImage[] = [];
    const baseName = file.name.replace(/\.pdf$/i, '');

    for (let index = 0; index < pagesToProcess.length; index++) {
      const i = pagesToProcess[index];
      if (onProgress) {
        const pct = Math.round(10 + ((index + 1) / pagesToProcess.length) * 85);
        onProgress(pct, `Extracting page ${i} of ${pageCount} (${index + 1}/${pagesToProcess.length})...`);
      }

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) continue;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, quality);
      });

      const ext = options.format === 'jpeg' ? 'jpg' : 'png';
      results.push({
        pageNumber: i,
        dataUrl,
        blob,
        width: viewport.width,
        height: viewport.height,
        fileName: `${baseName}_page_${i}.${ext}`,
      });
    }

    if (onProgress) onProgress(100, 'All requested pages extracted successfully!');
    return results;
  }

  /**
   * Compress image file size using canvas re-encoding
   */
  static async compressImage(
    file: File,
    options: CompressImageOptions = { quality: 0.7, format: 'image/jpeg' }
  ): Promise<{ blob: Blob; originalSize: number; newSize: number; dataUrl: string; width: number; height: number }> {
    const originalSize = file.size;
    const img = await ImageService.loadImageFromFile(file);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context for image compression.');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL(options.format, options.quality);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to compress image.'));
        },
        options.format,
        options.quality
      );
    });

    return {
      blob,
      originalSize,
      newSize: blob.size,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  }

  /**
   * Resize image dimensions and format
   */
  static async resizeImage(
    file: File,
    options: ResizeImageOptions
  ): Promise<{ blob: Blob; width: number; height: number; dataUrl: string; originalWidth: number; originalHeight: number }> {
    const img = await ImageService.loadImageFromFile(file);
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    let targetW = options.width;
    let targetH = options.height;

    if (options.maintainAspectRatio) {
      if (targetW && !targetH) {
        targetH = Math.round((origH * targetW) / origW);
      } else if (targetH && !targetW) {
        targetW = Math.round((origW * targetH) / origH);
      }
    }

    targetW = Math.max(1, Math.round(targetW || origW));
    targetH = Math.max(1, Math.round(targetH || origH));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context for image resizing.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (options.format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(img, 0, 0, origW, origH, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL(options.format, options.quality || 0.92);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to generate resized image blob.'));
        },
        options.format,
        options.quality || 0.92
      );
    });

    return {
      blob,
      width: targetW,
      height: targetH,
      dataUrl,
      originalWidth: origW,
      originalHeight: origH,
    };
  }
}
