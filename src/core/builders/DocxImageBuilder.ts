import { Paragraph, ImageRun, AlignmentType, TextRun } from 'docx';
import { TypographyEngine } from '../TypographyEngine';

export interface ImageBlockData {
  buffer: Uint8Array;
  width: number;
  height: number;
  topY?: number;
  leftX?: number;
  id?: string;
  isChart?: boolean;
  caption?: string;
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
   * Calculate fast buffer hash for deduplication
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
   * Build DOCX Image paragraph maintaining strict aspect ratio, no stretching, with optional caption
   */
  static buildImageParagraph(
    img: ImageBlockData,
    maxWidthPt = 500,
    pageWidthPt = 612
  ): Paragraph[] {
    if (!img || !img.buffer || img.buffer.length === 0) return [];

    // Deduplication check
    const imgHash = img.id || this.computeHash(img.buffer);
    if (this.processedHashes.has(imgHash)) {
      return []; // Skip duplicate image insertion
    }
    this.processedHashes.add(imgHash);

    const origWidth = Math.max(1, img.width || 300);
    const origHeight = Math.max(1, img.height || 200);
    const aspectRatio = origHeight / origWidth;

    // Scale calculation - preserve strict aspect ratio
    let targetWidthPt = Math.min(maxWidthPt, Math.round(origWidth * 0.85));
    if (img.isChart) {
      targetWidthPt = Math.min(maxWidthPt, Math.max(380, Math.round(origWidth * 0.95)));
    }
    const targetHeightPt = Math.round(targetWidthPt * aspectRatio);

    // Determine alignment based on leftX position
    let alignment: any = AlignmentType.CENTER;
    if (img.leftX !== undefined) {
      if (img.leftX < 70) {
        alignment = AlignmentType.LEFT;
      } else if (img.leftX > pageWidthPt * 0.4) {
        alignment = AlignmentType.RIGHT;
      }
    }

    const imgRun = new ImageRun({
      data: img.buffer,
      type: 'png',
      transformation: {
        width: Math.max(20, targetWidthPt),
        height: Math.max(20, targetHeightPt),
      },
    });

    const resultParagraphs: Paragraph[] = [];

    const hasCaption = !!img.caption && img.caption.trim().length > 0;

    resultParagraphs.push(
      new Paragraph({
        children: [imgRun],
        alignment,
        keepNext: hasCaption,
        spacing: { before: 160, after: hasCaption ? 60 : 160 },
      })
    );

    // Part 7: Caption attachment
    if (hasCaption) {
      const normalizedCaption = TypographyEngine.normalizeText(img.caption!);
      resultParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: normalizedCaption,
              size: 18, // 9pt
              italics: true,
              color: '4B5563', // Grey caption text
              font: 'Calibri',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 160 },
        })
      );
    }

    return resultParagraphs;
  }
}
