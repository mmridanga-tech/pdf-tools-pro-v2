export interface ProcessedImageData {
  width: number;
  height: number;
  dataUrl: string;
  buffer: Uint8Array;
  mimeType: string;
}

export class ImageProcessor {
  /**
   * Convert base64 Data URL to Uint8Array binary buffer
   */
  static dataUrlToBuffer(dataUrl: string): Uint8Array {
    const base64Data = dataUrl.split(',')[1] || dataUrl;
    const binaryStr = atob(base64Data);
    const buffer = new Uint8Array(binaryStr.length);
    for (let k = 0; k < binaryStr.length; k++) {
      buffer[k] = binaryStr.charCodeAt(k);
    }
    return buffer;
  }

  /**
   * Calculate proportional dimensions bounded by maxWidth and maxHeight
   */
  static calculateProportionalDimensions(
    origWidth: number,
    origHeight: number,
    maxWidth = 500,
    maxHeight = 700
  ): { width: number; height: number } {
    if (origWidth <= 0 || origHeight <= 0) {
      return { width: maxWidth, height: Math.round(maxWidth * 0.75) };
    }

    const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight, 1.0);
    return {
      width: Math.round(origWidth * ratio),
      height: Math.round(origHeight * ratio),
    };
  }

  /**
   * Crop canvas region and export PNG image
   */
  static cropCanvasToBuffer(
    sourceCanvas: HTMLCanvasElement,
    cropX: number,
    cropY: number,
    cropW: number,
    cropH: number
  ): ProcessedImageData | null {
    if (cropW <= 0 || cropH <= 0) return null;

    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = cropW;
    imgCanvas.height = cropH;
    const ctx = imgCanvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const dataUrl = imgCanvas.toDataURL('image/png');
    const buffer = this.dataUrlToBuffer(dataUrl);

    return {
      width: cropW,
      height: cropH,
      dataUrl,
      buffer,
      mimeType: 'image/png',
    };
  }
}
