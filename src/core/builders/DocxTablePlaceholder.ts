import { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } from 'docx';
import { StructuredLine } from '../LayoutAnalyzer';
import { TypographyEngine } from '../TypographyEngine';

export class DocxTablePlaceholder {
  /**
   * Build DOCX Table structure compatible with Sprint 1C table engine
   */
  static buildTableFromLines(tableLines: StructuredLine[], pageWidth: number): Table {
    const colXSet = new Set<number>();
    tableLines.forEach((l) => {
      l.items.forEach((it) => colXSet.add(Math.round(it.leftX / 15) * 15));
    });

    const colXList = Array.from(colXSet).sort((a, b) => a - b);
    const colCount = Math.max(2, colXList.length);

    const rows = tableLines.map((line, rIdx) => {
      const cells = line.items.map((item) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.str,
                  bold: item.isBold || rIdx === 0,
                  italics: item.isItalic,
                  underline: item.isUnderline ? {} : undefined,
                  strike: item.isStrike,
                  size: Math.max(16, Math.round(item.fontSize * 2)),
                  font: TypographyEngine.mapFontFamily(item.fontName, item.fontFamily),
                }),
              ],
              spacing: { before: 40, after: 40 },
            }),
          ],
          shading: rIdx === 0 ? { fill: 'F3F4F6' } : undefined,
          width: {
            size: Math.floor(100 / Math.max(1, line.items.length)),
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
          },
        });
      });

      while (cells.length < colCount) {
        cells.push(
          new TableCell({
            children: [new Paragraph({ text: '' })],
            width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            },
          })
        );
      }

      return new TableRow({ children: cells });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    });
  }
}
