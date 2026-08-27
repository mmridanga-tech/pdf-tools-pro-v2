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
  TableAnchorType,
  RelativeHorizontalPosition,
  RelativeVerticalPosition,
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

    // 1. Detect Column X Boundaries across all rows
    const xPositions: number[] = [];
    tableLines.forEach((line) => {
      line.items.forEach((it) => {
        xPositions.push(it.leftX);
      });
    });

    xPositions.sort((a, b) => a - b);

    // Cluster xPositions to find unique column left boundaries (within 12pt tolerance)
    const colBoundaries: number[] = [];
    for (const x of xPositions) {
      if (
        colBoundaries.length === 0 ||
        x - colBoundaries[colBoundaries.length - 1] > 12
      ) {
        colBoundaries.push(x);
      }
    }

    const colCount = Math.max(1, colBoundaries.length);

    // Determine if table is a formatted data table or a borderless 2-column key-value form
    const isDataTable =
      colCount >= 3 ||
      tableLines.some((l) => {
        const t = l.cleanText.toLowerCase();
        return /earnings|deductions|attendance|amount|gross|salary|net amount|total|present|days|basic|rate|qty|price|tax|invoice|item|description|date|status|hours|balance|hra|pf|esi|lop/i.test(
          t
        );
      });

    // Compute column widths in twips/dxa (1 pt = 20 twips)
    const tableLeftX = Math.min(...tableLines.map((l) => l.leftX));
    const tableRightX = Math.max(...tableLines.map((l) => l.rightX || l.leftX + l.width));
    const totalTableWidthPt = Math.max(100, tableRightX - tableLeftX);

    const colWidthsTwips: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const cLeft = colBoundaries[c];
      const cRight = c < colCount - 1 ? colBoundaries[c + 1] : tableRightX;
      const wPt = Math.max(20, cRight - cLeft);
      colWidthsTwips.push(Math.round(wPt * 20));
    }

    // 2. Build Rows and Cells
    const tableRows: TableRow[] = tableLines.map((line, rIdx) => {
      const isHeaderRow =
        (rIdx === 0 && isDataTable) ||
        /^(earnings|deductions|attendance|particulars|description|sr\.?\s*no|item|date|rate)/i.test(
          line.cleanText.trim()
        );

      // Group line items into column buckets
      const cellBuckets: PositionedTextItem[][] = Array.from(
        { length: colCount },
        () => []
      );

      line.items.forEach((item) => {
        // Robust Column Assignment: find the best column index for this item
        let bestColIdx = colCount - 1;
        for (let c = 0; c < colCount; c++) {
          const nextBoundary = c < colCount - 1 ? colBoundaries[c + 1] : Infinity;
          if (item.leftX < nextBoundary - 4) {
            bestColIdx = c;
            break;
          }
        }
        cellBuckets[bestColIdx].push(item);
      });

      const rowCells: TableCell[] = cellBuckets.map((items, cIdx) => {
        const cellText = items
          .map((it) => TypographyEngine.normalizeText(it.str))
          .join(' ')
          .trim();

        // Detect cell alignment
        let cellAlign: any = AlignmentType.LEFT;
        if (/^[\$\€\£\¥\₹]?\s*[\d,]+(\.\d+)?%?$/.test(cellText)) {
          cellAlign = AlignmentType.RIGHT;
        } else if (isHeaderRow && cellText.length < 15) {
          cellAlign = AlignmentType.LEFT;
        }

        const paragraphs: Paragraph[] = [];

        if (items.length > 0) {
          const runs: TextRun[] = items.map((it, idx) => {
            let str = TypographyEngine.normalizeText(it.str);
            if (idx < items.length - 1) {
              const nextIt = items[idx + 1];
              const gap = nextIt.leftX - (it.leftX + it.width);
              if (gap >= 0.8 || it.str.endsWith(' ') || nextIt.str.startsWith(' ')) {
                str += ' ';
              }
            }
            return new TextRun({
              text: str,
              bold: it.isBold || (isHeaderRow && isDataTable),
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
              spacing: { before: isDataTable ? 30 : 15, after: isDataTable ? 30 : 15 },
            })
          );
        } else {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: '' })],
              spacing: { before: isDataTable ? 30 : 15, after: isDataTable ? 30 : 15 },
            })
          );
        }

        // Background Shading
        let fillColor: string | undefined = undefined;
        if (isDataTable) {
          if (isHeaderRow) {
            fillColor = 'F3F4F6'; // Header light grey
          }
        }

        const borderStyle = isDataTable ? BorderStyle.SINGLE : BorderStyle.NONE;
        const borderColor = isDataTable ? (isHeaderRow ? '9CA3AF' : 'E5E7EB') : 'FFFFFF';
        const borderSize = isDataTable ? 1 : 0;

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
            top: isDataTable ? 60 : 20, // padding
            bottom: isDataTable ? 60 : 20,
            left: isDataTable ? 100 : 40,
            right: isDataTable ? 100 : 40,
          },
          borders: {
            top: {
              style: borderStyle,
              size: borderSize,
              color: borderColor,
            },
            bottom: {
              style: borderStyle,
              size: borderSize,
              color: borderColor,
            },
            left: { style: borderStyle, size: borderSize, color: borderColor },
            right: { style: borderStyle, size: borderSize, color: borderColor },
          },
        });
      });

      const rowHeightPt = line.height || 16;

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

