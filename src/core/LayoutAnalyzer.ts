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
  linkUrl?: string;
}

export interface StructuredLine extends BoundingBox {
  items: PositionedTextItem[];
  maxFontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  isBulletList: boolean;
  isNumberedList: boolean;
  listMarker?: string;
  cleanText: string;
}

export class LayoutAnalyzer {
  /**
   * Sort items by reading flow, taking into account multi-column layouts (1, 2, or 3 columns)
   */
  static sortItemsByReadingOrder(
    items: PositionedTextItem[],
    pageWidth: number
  ): PositionedTextItem[] {
    if (!items || items.length === 0) return [];

    const nonEmpties = items.filter((it) => it.str.trim().length > 0);
    if (nonEmpties.length === 0) return [];

    const midX = pageWidth / 2;
    const leftCol = nonEmpties.filter((it) => it.leftX + it.width < midX + 20);
    const rightCol = nonEmpties.filter((it) => it.leftX > midX - 20);

    const isTwoColumn =
      leftCol.length > 5 &&
      rightCol.length > 5 &&
      leftCol.length + rightCol.length >= nonEmpties.length * 0.75;

    if (isTwoColumn) {
      const sortYThenX = (a: PositionedTextItem, b: PositionedTextItem) => {
        if (Math.abs(a.topY - b.topY) > 6) return a.topY - b.topY;
        return a.leftX - b.leftX;
      };

      leftCol.sort(sortYThenX);
      rightCol.sort(sortYThenX);

      return [...leftCol, ...rightCol];
    }

    // Default single column reading order
    return [...nonEmpties].sort((a, b) => {
      if (Math.abs(a.topY - b.topY) > 5) return a.topY - b.topY;
      return a.leftX - b.leftX;
    });
  }

  /**
   * Group sorted text items into structured lines and infer line properties
   */
  static groupItemsIntoLines(
    sortedItems: PositionedTextItem[],
    pageWidth: number
  ): StructuredLine[] {
    const lines: StructuredLine[] = [];
    if (!sortedItems || sortedItems.length === 0) return lines;

    let currentLineItems: PositionedTextItem[] = [sortedItems[0]];

    for (let i = 1; i < sortedItems.length; i++) {
      const prev = currentLineItems[currentLineItems.length - 1];
      const curr = sortedItems[i];

      const isSameLine = Math.abs(curr.topY - prev.topY) <= Math.max(4, curr.fontSize * 0.35);

      if (isSameLine) {
        currentLineItems.push(curr);
      } else {
        lines.push(this.buildStructuredLine(currentLineItems, pageWidth));
        currentLineItems = [curr];
      }
    }

    if (currentLineItems.length > 0) {
      lines.push(this.buildStructuredLine(currentLineItems, pageWidth));
    }

    return lines;
  }

  /**
   * Build structured line metrics and detect lists/alignment
   */
  private static buildStructuredLine(
    items: PositionedTextItem[],
    pageWidth: number
  ): StructuredLine {
    items.sort((a, b) => a.leftX - b.leftX);

    const rawText = items.map((it) => it.str).join(' ');
    const cleanText = rawText.replace(/\s+/g, ' ').trim();

    const topY = items[0].topY;
    const leftX = items[0].leftX;
    const lastItem = items[items.length - 1];
    const rightX = lastItem.leftX + lastItem.width;
    const width = rightX - leftX;
    const height = Math.max(...items.map((it) => it.height));
    const maxFontSize = Math.max(...items.map((it) => it.fontSize));

    // Detect alignment
    const lineCenter = leftX + width / 2;
    const pageCenter = pageWidth / 2;

    let alignment: 'left' | 'center' | 'right' | 'justify' = 'left';
    if (Math.abs(lineCenter - pageCenter) < 35 && width < pageWidth * 0.7) {
      alignment = 'center';
    } else if (rightX > pageWidth - 60 && leftX > pageWidth * 0.35) {
      alignment = 'right';
    }

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

    return {
      items,
      leftX,
      topY,
      width,
      height,
      maxFontSize,
      alignment,
      isBulletList,
      isNumberedList,
      listMarker,
      cleanText,
    };
  }
}
