import { TypographyEngine } from './TypographyEngine';

export interface BoundingBox {
  leftX: number;
  topY: number;
  width: number;
  height: number;
}

export interface PositionedTextItem extends BoundingBox {
  str: string;
  fontSize: number;
  fontName: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  isSuperScript?: boolean;
  isSubScript?: boolean;
  linkUrl?: string;
}

export interface StructuredLine extends BoundingBox {
  items: PositionedTextItem[];
  maxFontSize: number;
  rightX?: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
  heading?: any;
  isBulletList: boolean;
  isNumberedList: boolean;
  listMarker?: string;
  cleanText: string;
  isCaption?: boolean;
  isFootnote?: boolean;
}

export interface SemanticParagraph extends BoundingBox {
  type: 'paragraph' | 'heading' | 'list' | 'caption' | 'footnote';
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
  alignment: 'left' | 'center' | 'right' | 'justify';
  isBulletList: boolean;
  isNumberedList: boolean;
  bulletLevel: number;
  listMarker?: string;
  lines: StructuredLine[];
  items: PositionedTextItem[];
  fullText: string;
  firstLineIndent?: number;
  lineSpacing?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  isCaption?: boolean;
  isFootnote?: boolean;
}

export class LayoutAnalyzer {
  /**
   * Sort items by reading flow with header/footer region awareness
   */
  static sortItemsByReadingOrder(
    items: PositionedTextItem[],
    pageWidth: number,
    pageHeight = 792
  ): PositionedTextItem[] {
    if (!items || items.length === 0) return [];

    const nonEmpties = items.filter((it) => it.str && it.str.trim().length > 0);
    if (nonEmpties.length === 0) return [];

    // Sort top-to-bottom by Y, and left-to-right by X
    const sorted = [...nonEmpties].sort((a, b) => {
      if (Math.abs(a.topY - b.topY) > 3) return a.topY - b.topY;
      return a.leftX - b.leftX;
    });

    return sorted;
  }

  /**
   * Group text items into structured lines and infer line typography/layout metadata
   */
  static groupItemsIntoLines(
    rawItems: PositionedTextItem[],
    pageWidth: number,
    bodyFontSize = 11,
    pageHeight = 792
  ): StructuredLine[] {
    if (!rawItems || rawItems.length === 0) return [];

    const items = rawItems.filter((it) => it.str && it.str.trim().length > 0);
    if (items.length === 0) return [];

    // 1. Initial sort by topY, then leftX
    const sorted = [...items].sort((a, b) => {
      if (Math.abs(a.topY - b.topY) > 2.5) return a.topY - b.topY;
      return a.leftX - b.leftX;
    });

    // 2. Cluster into lines with adaptive tolerance
    const lineClusters: PositionedTextItem[][] = [];
    for (const item of sorted) {
      let matchedCluster: PositionedTextItem[] | null = null;
      let minDiff = Infinity;

      for (const cluster of lineClusters) {
        const clusterY = cluster.reduce((sum, it) => sum + it.topY, 0) / cluster.length;
        const avgFontSize = cluster.reduce((sum, it) => sum + it.fontSize, 0) / cluster.length;
        const yTolerance = Math.max(3.5, avgFontSize * 0.4);
        const diff = Math.abs(item.topY - clusterY);

        if (diff <= yTolerance && diff < minDiff) {
          minDiff = diff;
          matchedCluster = cluster;
        }
      }

      if (matchedCluster) {
        matchedCluster.push(item);
      } else {
        lineClusters.push([item]);
      }
    }

    // 3. Sort line clusters by their average topY
    lineClusters.sort((a, b) => {
      const avgYA = a.reduce((sum, it) => sum + it.topY, 0) / a.length;
      const avgYB = b.reduce((sum, it) => sum + it.topY, 0) / b.length;
      return avgYA - avgYB;
    });

    const lines: StructuredLine[] = [];
    for (const cluster of lineClusters) {
      cluster.sort((a, b) => a.leftX - b.leftX);
      lines.push(this.buildStructuredLine(cluster, pageWidth, bodyFontSize, pageHeight));
    }

    return lines;
  }

  /**
   * Detect Figure / Table Captions
   */
  static detectCaption(cleanText: string): boolean {
    if (!cleanText) return false;
    const lower = cleanText.trim().toLowerCase();
    return (
      /^(figure|fig\.|table|tab\.|chart|graph|illustration|photo|plate)\s*\d+[:\.]/i.test(lower) ||
      /^(source|note):/i.test(lower)
    );
  }

  /**
   * Detect Footnotes at page bottom
   */
  static detectFootnote(cleanText: string, topY: number, maxFontSize: number, bodyFontSize: number, pageHeight: number): boolean {
    if (topY < pageHeight * 0.8) return false;
    if (maxFontSize >= bodyFontSize * 0.9) return false;
    const text = cleanText.trim();
    return /^[0-9\*\†\‡\§\#]{1,3}[\.\)]?\s+[A-Z]/i.test(text);
  }

  /**
   * Reconstruct broken lines into semantic logical paragraphs with full continuity logic
   */
  static reconstructParagraphs(
    lines: StructuredLine[],
    bodyFontSize = 11
  ): SemanticParagraph[] {
    const paragraphs: SemanticParagraph[] = [];
    if (!lines || lines.length === 0) return paragraphs;

    let currentLines: StructuredLine[] = [];

    const flushCurrentParagraph = () => {
      if (currentLines.length === 0) return;

      const firstLine = currentLines[0];
      const items: PositionedTextItem[] = [];
      let fullText = '';

      for (let k = 0; k < currentLines.length; k++) {
        const line = currentLines[k];
        items.push(...line.items);

        if (k === 0) {
          fullText = line.cleanText;
        } else {
          fullText = TypographyEngine.mergeWithHyphenResolution(fullText, line.cleanText);
        }
      }

      const leftX = Math.min(...currentLines.map((l) => l.leftX));
      const topY = currentLines[0].topY;
      const rightX = Math.max(...currentLines.map((l) => l.leftX + l.width));
      const width = rightX - leftX;
      const height = currentLines[currentLines.length - 1].topY + currentLines[currentLines.length - 1].height - topY;

      // Determine type
      let type: 'paragraph' | 'heading' | 'list' | 'caption' | 'footnote' = 'paragraph';
      if (firstLine.isCaption) {
        type = 'caption';
      } else if (firstLine.isFootnote) {
        type = 'footnote';
      } else if (firstLine.headingLevel) {
        type = 'heading';
      } else if (firstLine.isBulletList || firstLine.isNumberedList) {
        type = 'list';
      }

      const bulletLevel = this.detectNestedListLevel(firstLine.leftX);

      // Compute first line indent if multi-line paragraph
      let firstLineIndent = 0;
      let lineSpacing = 240; // Default 1.0 (240 twentieths of a point in DOCX)
      if (currentLines.length > 1) {
        const secondLine = currentLines[1];
        const indentPx = firstLine.leftX - secondLine.leftX;
        if (indentPx > 5) {
          firstLineIndent = Math.round(indentPx * 20); // convert pt to twips
        }

        const avgLineGap = (currentLines[currentLines.length - 1].topY - firstLine.topY) / (currentLines.length - 1);
        if (firstLine.maxFontSize > 0 && avgLineGap > 0) {
          const ratio = avgLineGap / firstLine.maxFontSize;
          lineSpacing = Math.round(Math.min(480, Math.max(200, ratio * 200)));
        }
      }

      const spaceBefore = firstLine.headingLevel ? 200 : (firstLine.isBulletList || firstLine.isNumberedList ? 40 : 60);
      const spaceAfter = firstLine.headingLevel ? 140 : (firstLine.isBulletList || firstLine.isNumberedList ? 60 : 120);

      paragraphs.push({
        type,
        headingLevel: firstLine.headingLevel,
        alignment: firstLine.alignment,
        isBulletList: firstLine.isBulletList,
        isNumberedList: firstLine.isNumberedList,
        bulletLevel,
        listMarker: firstLine.listMarker,
        lines: [...currentLines],
        items,
        fullText,
        leftX,
        topY,
        width,
        height,
        firstLineIndent,
        lineSpacing,
        spaceBefore,
        spaceAfter,
        isCaption: firstLine.isCaption,
        isFootnote: firstLine.isFootnote,
      });

      currentLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (currentLines.length === 0) {
        currentLines.push(line);
        continue;
      }

      const prevLine = currentLines[currentLines.length - 1];

      // Check paragraph boundary conditions
      const isPrevHeading = Boolean(prevLine.headingLevel);
      const isCurrHeading = Boolean(line.headingLevel);
      const isPrevList = prevLine.isBulletList || prevLine.isNumberedList;
      const isCurrList = line.isBulletList || line.isNumberedList;
      const isPrevCaption = Boolean(prevLine.isCaption);
      const isCurrCaption = Boolean(line.isCaption);
      const isPrevFootnote = Boolean(prevLine.isFootnote);
      const isCurrFootnote = Boolean(line.isFootnote);
      const alignmentChanged = prevLine.alignment !== line.alignment;
      const fontSizeShift = Math.abs(prevLine.maxFontSize - line.maxFontSize) > 2;

      // Check vertical line spacing gap
      const verticalGap = line.topY - (prevLine.topY + prevLine.height);
      const isLargeGap = verticalGap > Math.max(8, prevLine.maxFontSize * 1.5);

      // Check sentence completion on previous line
      const prevEndsWithTerminator = /[\.\!\?\:\;]\s*$/.test(prevLine.cleanText);

      // Check first line indentation (paragraph start indicator)
      const hasFirstLineIndent = line.leftX > prevLine.leftX + 15 && prevLine.alignment === 'left' && line.alignment === 'left';

      const shouldStartNewParagraph =
        isPrevHeading ||
        isCurrHeading ||
        isPrevList ||
        isCurrList ||
        isPrevCaption ||
        isCurrCaption ||
        isPrevFootnote ||
        isCurrFootnote ||
        alignmentChanged ||
        fontSizeShift ||
        isLargeGap ||
        hasFirstLineIndent ||
        (prevEndsWithTerminator && verticalGap > prevLine.maxFontSize * 1.1);

      if (shouldStartNewParagraph) {
        flushCurrentParagraph();
        currentLines.push(line);
      } else {
        currentLines.push(line);
      }
    }

    flushCurrentParagraph();
    return paragraphs;
  }

  /**
   * Helper: Calculate nested list level (0, 1, or 2) from left margin offset
   */
  static detectNestedListLevel(leftX: number, baseIndent = 54): number {
    const offset = leftX - baseIndent;
    if (offset <= 18) return 0;
    if (offset <= 38) return 1;
    return 2;
  }

  /**
   * Helper: Build structured line metrics, alignment, list markers, and headings
   */
  private static buildStructuredLine(
    items: PositionedTextItem[],
    pageWidth: number,
    bodyFontSize = 11,
    pageHeight = 792
  ): StructuredLine {
    items.sort((a, b) => a.leftX - b.leftX);

    const rawText = items.map((it) => it.str).join(' ');
    const cleanText = TypographyEngine.normalizeText(rawText);

    const topY = items[0].topY;
    const leftX = items[0].leftX;
    const lastItem = items[items.length - 1];
    const rightX = lastItem.leftX + lastItem.width;
    const width = rightX - leftX;
    const height = Math.max(...items.map((it) => it.height));
    const maxFontSize = Math.max(...items.map((it) => it.fontSize));
    const isBold = items.some((it) => it.isBold);

    // Detect alignment
    const lineCenter = leftX + width / 2;
    const pageCenter = pageWidth / 2;

    let alignment: 'left' | 'center' | 'right' | 'justify' = 'left';
    if (Math.abs(lineCenter - pageCenter) < 35 && width < pageWidth * 0.7) {
      alignment = 'center';
    } else if (rightX > pageWidth - 60 && leftX > pageWidth * 0.35) {
      alignment = 'right';
    } else if (width > pageWidth * 0.75 && items.length > 4) {
      alignment = 'justify';
    }

    // Infer Heading Level
    const headingLevel = TypographyEngine.inferHeadingLevel(
      maxFontSize,
      bodyFontSize,
      cleanText,
      isBold
    ) || undefined;

    // Detect Bullet or Numbered Lists
    const bulletRegex = /^[\u2022\u25CF\u25CB\u25AA\u25A0\u2013\u2014\-\*\•\▪\►\◦]\s*/;
    const numberedRegex = /^(\d+|[A-Za-z]|[IVXLCDMivxlcdm]+)[\.\)]\s+/;

    const isBulletList = bulletRegex.test(cleanText);
    const isNumberedList = !isBulletList && numberedRegex.test(cleanText);

    let listMarker: string | undefined = undefined;
    if (isBulletList) {
      const match = cleanText.match(bulletRegex);
      if (match) listMarker = match[0];
    } else if (isNumberedList) {
      const match = cleanText.match(numberedRegex);
      if (match) listMarker = match[0];
    }

    const isCaption = this.detectCaption(cleanText);
    const isFootnote = this.detectFootnote(cleanText, topY, maxFontSize, bodyFontSize, pageHeight);

    return {
      items,
      leftX,
      rightX,
      topY,
      width,
      height,
      maxFontSize,
      alignment,
      headingLevel,
      isBulletList,
      isNumberedList,
      listMarker,
      cleanText,
      isCaption,
      isFootnote,
    };
  }
}
