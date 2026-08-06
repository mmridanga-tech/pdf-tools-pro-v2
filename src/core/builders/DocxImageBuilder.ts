import { Paragraph, ImageRun, AlignmentType } from 'docx';

export interface ImageBlockData {
  buffer: Uint8Array;
  width: number;
  height: number;
  topY?: number;
  leftX?: number;
  id?: string;
}

export class DocxImageBuilder {
  private static processedHashes = new Set<string>();

  /**
   * Reset processed image deduplication set per conversion job
   */
  static resetDeduplicationCache(): void {
    this.processedHashes.clear();
  }

  /**
   * Calculate SHA-256 / quick hash of buffer for deduplication
   */
  private static computeHash(buffer: Uint8Array): string {
    let hash = 0;
    const len = Math.min(buffer.length, 1024);
    for (let i = 0; i < len; i += 4) {
      hash = (hash << 5) - hash + buffer[i];
      hash |= 0;
    }
    return `${buffer.length}_${hash}`;
  }

  /**
   * Build DOCX Image paragraph maintaining aspect ratio and quality without stretching
   */
  static buildImageParagraph(
    img: ImageBlockData,
    maxWidthPt = 500
  ): Paragraph | null {
    if (!img || !img.buffer || img.buffer.length === 0) return null;

    // Deduplication check
    const imgHash = img.id || this.computeHash(img.buffer);
    if (this.processedHashes.has(imgHash)) {
      return null; // Skip duplicate image insertion
    }
    this.processedHashes.add(imgHash);

    const origWidth = Math.max(1, img.width || 300);
    const origHeight = Math.max(1, img.height || 200);
    const aspectRatio = origHeight / origWidth;

    // Constrain width to container max width preserving original aspect ratio
    const targetWidth = Math.min(maxWidthPt, Math.round(origWidth * 0.8));
    const targetHeight = Math.round(targetWidth * aspectRatio);

    const imgRun = new ImageRun({
      data: img.buffer,
      type: 'png',
      transformation: {
        width: Math.max(20, targetWidth),
        height: Math.max(20, targetHeight),
      },
    });

    return new Paragraph({
      children: [imgRun],
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 140 },
    });
  }
}
