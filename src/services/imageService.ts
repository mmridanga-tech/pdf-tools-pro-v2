import { formatBytes } from '../utils/fileUtils';

export interface ImageToPDFOptions {
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number; // in pt or mm
  pageSize: 'a4' | 'letter' | 'fit';
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
   * Convert multiple image files into a compiled PDF
   */
  static async imageToPDF(
    files: File[],
    options: ImageToPDFOptions = { orientation: 'auto', margin: 20, pageSize: 'a4' }
  ): Promise<Blob> {
    if (files.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;

    let doc: InstanceType<typeof jsPDF> | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const img = await ImageService.loadImageFromFile(file);

      // Create canvas to render clean data URL
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas 2d context.');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
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
      const margin = options.pageSize === 'fit' ? options.margin : options.margin;
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

    if (!doc) throw new Error('Failed to create PDF document.');
    return doc.output('blob');
  }

  /**
   * Convert PDF document pages into image files (PNG or JPEG)
   */
  static async pdfToImage(
    file: File,
    options: { format: 'png' | 'jpeg'; quality: number; scale: number } = { format: 'png', quality: 0.9, scale: 2.0 },
    onProgress?: (percent: number, msg?: string) => void
  ): Promise<ConvertedPdfPageImage[]> {
    if (onProgress) onProgress(5, 'Loading PDF document renderer...');

    const pdfjsLib = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const results: ConvertedPdfPageImage[] = [];
    const baseName = file.name.replace(/\.pdf$/i, '');

    for (let i = 1; i <= pageCount; i++) {
      if (onProgress) {
        const pct = Math.round(10 + (i / pageCount) * 85);
        onProgress(pct, `Rendering PDF page ${i} of ${pageCount}...`);
      }

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: options.scale || 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) continue;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, options.quality);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, options.quality);
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

    if (onProgress) onProgress(100, 'All pages rendered successfully!');
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
