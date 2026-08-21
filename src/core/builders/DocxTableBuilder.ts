import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeightRule,
  VerticalAlign,
} from 'docx';
import { StructuredLine, PositionedTextItem } from '../LayoutAnalyzer';
import { TypographyEngine } from '../TypographyEngine';

export interface TableCellData {
  text: string;
  items: PositionedTextItem[];
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
  alignment?: any;
}

export interface TableRowData {
  cells: TableCellData[];
  height?: number;
  isHeaderRow?: boolean;
}

export class DocxTableBuilder {
  /**
   * Build high-fidelity REAL Microsoft Word Table with column widths, borders, shading, and cell alignment
   */
  static buildRealTable(tableLines: StructuredLine[], pageWidth: number): Table {
    if (!tableLines || tableLines.length === 0) {
      return new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: '' })],
              }),
            ],
          }),
        ],
      });
    }

    // 1. Detect Column X Boundaries
    const xPositions: number[] = [];
    tableLines.forEach((line) => {
      line.items.forEach((it) => {
        xPositions.push(it.leftX);
      });
    });

    xPositions.sort((a, b) => a - b);

    // Cluster xPositions to find unique column left boundaries (within 18pt tolerance)
    const colBoundaries: number[] = [];
    for (const x of xPositions) {
      if (
        colBoundaries.length === 0 ||
        x - colBoundaries[colBoundaries.length - 1] > 20
      ) {
        colBoundaries.push(x);
      }
    }

    const colCount = Math.max(1, colBoundaries.length);

    // Compute column widths in twips/dxa (1 pt = 20 twips)
    const tableLeftX = colBoundaries[0] || 36;
    const tableRightX = Math.max(
      ...tableLines.map((l) => l.rightX || l.leftX + l.width)
    );

    const colWidthsTwips: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const cLeft = colBoundaries[c];
      const cRight =
        c < colCount - 1 ? colBoundaries[c + 1] : tableRightX;
      const wPt = Math.max(20, cRight - cLeft);
      colWidthsTwips.push(Math.round(wPt * 20));
    }

    // 2. Build Rows and Cells
    const tableRows: TableRow[] = tableLines.map((line, rIdx) => {
      const isHeaderRow = rIdx === 0;

      // Group line items into column buckets
      const cellBuckets: PositionedTextItem[][] = Array.from(
        { length: colCount },
        () => []
      );

      line.items.forEach((item) => {
        // Find closest column boundary
        let bestColIdx = 0;
        let minDiff = Infinity;
        colBoundaries.forEach((cb, idx) => {
          const diff = Math.abs(item.leftX - cb);
          if (diff < minDiff) {
            minDiff = diff;
            bestColIdx = idx;
          }
        });
        cellBuckets[bestColIdx].push(item);
      });

      const rowCells: TableCell[] = cellBuckets.map((items, cIdx) => {
        const cellText = items
          .map((it) => TypographyEngine.normalizeText(it.str))
          .join(' ')
          .trim();

        // Detect cell alignment
        let cellAlign: any = AlignmentType.LEFT;
        if (/^[\$\€\£\¥]?\s*[\d,]+(\.\d+)?%?$/.test(cellText)) {
          cellAlign = AlignmentType.RIGHT;
        } else if (isHeaderRow || cellText.length < 5) {
          cellAlign = AlignmentType.LEFT;
        }

        const paragraphs: Paragraph[] = [];

        if (items.length > 0) {
          const runs: TextRun[] = items.map((it) => {
            return new TextRun({
              text: TypographyEngine.normalizeText(it.str) + ' ',
              bold: it.isBold || isHeaderRow,
              italics: it.isItalic,
              underline: it.isUnderline ? {} : undefined,
              strike: it.isStrike,
              size: Math.max(16, Math.round(it.fontSize * 2)),
              font: TypographyEngine.mapFontFamily(it.fontName, it.fontFamily),
            });
          });

          paragraphs.push(
            new Paragraph({
              children: runs,
              alignment: cellAlign,
              spacing: { before: 40, after: 40 },
            })
          );
        } else {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: '' })],
              spacing: { before: 40, after: 40 },
            })
          );
        }

        // Background Shading
        let fillColor: string | undefined = undefined;
        if (isHeaderRow) {
          fillColor = 'E5E7EB'; // Header grey
        } else if (rIdx % 2 === 1) {
          fillColor = 'F9FAFB'; // Alternate row subtle shading
        }

        const colWidthPct = Math.floor(100 / colCount);

        return new TableCell({
          children: paragraphs,
          width: {
            size: colWidthsTwips[cIdx] || colWidthPct,
            type: WidthType.DXA,
          },
          shading: fillColor ? { fill: fillColor } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          margins: {
            top: 100, // 5pt padding
            bottom: 100,
            left: 140, // 7pt padding
            right: 140,
          },
          borders: {
            top: {
              style: BorderStyle.SINGLE,
              size: isHeaderRow ? 2 : 1,
              color: isHeaderRow ? '9CA3AF' : 'E5E7EB',
            },
            bottom: {
              style: BorderStyle.SINGLE,
              size: isHeaderRow ? 2 : 1,
              color: isHeaderRow ? '9CA3AF' : 'E5E7EB',
            },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          },
        });
      });

      const rowHeightPt = line.height || 18;

      return new TableRow({
        children: rowCells,
        cantSplit: true,
        tableHeader: isHeaderRow,
        height: {
          value: Math.round(rowHeightPt * 20),
          rule: HeightRule.ATLEAST,
        },
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: colWidthsTwips,
      rows: tableRows,
    });
  }
}
