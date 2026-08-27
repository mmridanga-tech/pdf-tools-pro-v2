import { StructuredLine } from './LayoutAnalyzer';
import { PositionedTextItem } from './LayoutAnalyzer';
import { TableBlock } from './DocumentStructure';

export class TableEngine {
  /**
   * Test if text items in a line contain horizontal column gaps typical of tables and forms
   */
  static hasColumnGaps(items: PositionedTextItem[], minGapPx = 12): boolean {
    if (!items || items.length < 2) return false;
    for (let k = 1; k < items.length; k++) {
      const gap = items[k].leftX - (items[k - 1].leftX + items[k - 1].width);
      if (gap >= minGapPx) return true;
    }
    return false;
  }

  /**
   * Group consecutive lines into table structure if they exhibit matrix column traits
   */
  static buildTableFromLines(tableLines: StructuredLine[]): TableBlock {
    const colXSet = new Set<number>();
    tableLines.forEach((line) => {
      line.items.forEach((item) => colXSet.add(Math.round(item.leftX / 15) * 15));
    });

    const colXList = Array.from(colXSet).sort((a, b) => a - b);
    const colCount = Math.max(2, colXList.length);

    const rows = tableLines.map((line, rIdx) => {
      const isHeaderRow = rIdx === 0;

      const cells = line.items.map((item) => ({
        text: item.str,
        isHeader: isHeaderRow,
        bold: item.isBold || isHeaderRow,
        italic: item.isItalic,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
      }));

      // Pad missing columns
      while (cells.length < colCount) {
        cells.push({
          text: '',
          isHeader: isHeaderRow,
          bold: false,
          italic: false,
          fontSize: 11,
          fontFamily: 'Calibri',
        });
      }

      return { cells };
    });

    return {
      id: `table_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'table',
      rows,
    };
  }
}
