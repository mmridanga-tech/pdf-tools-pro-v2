import { Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { SemanticParagraph, PositionedTextItem } from '../LayoutAnalyzer';
import { TypographyEngine } from '../TypographyEngine';

export class DocxHeadingBuilder {
  /**
   * Build DOCX Heading paragraph (H1, H2, H3, H4) with proper Word styles
   */
  static buildHeading(para: SemanticParagraph, bodyFontSize = 11): Paragraph {
    const textRuns: TextRun[] = [];

    const headingLevel = para.headingLevel || 'h1';

    let wordHeadingLevel: any;
    let headingFontSizePts = 16;
    let spaceBefore = 240;
    let spaceAfter = 120;

    switch (headingLevel) {
      case 'h1':
        wordHeadingLevel = HeadingLevel.HEADING_1;
        headingFontSizePts = Math.max(28, Math.round(bodyFontSize * 2.8));
        spaceBefore = 280;
        spaceAfter = 140;
        break;
      case 'h2':
        wordHeadingLevel = HeadingLevel.HEADING_2;
        headingFontSizePts = Math.max(24, Math.round(bodyFontSize * 2.4));
        spaceBefore = 220;
        spaceAfter = 100;
        break;
      case 'h3':
        wordHeadingLevel = HeadingLevel.HEADING_3;
        headingFontSizePts = Math.max(20, Math.round(bodyFontSize * 2.0));
        spaceBefore = 180;
        spaceAfter = 80;
        break;
      case 'h4':
      default:
        wordHeadingLevel = HeadingLevel.HEADING_4;
        headingFontSizePts = Math.max(18, Math.round(bodyFontSize * 1.8));
        spaceBefore = 140;
        spaceAfter = 60;
        break;
    }

    let docxAlignment: any = AlignmentType.LEFT;
    if (para.alignment === 'center') docxAlignment = AlignmentType.CENTER;
    else if (para.alignment === 'right') docxAlignment = AlignmentType.RIGHT;
    else if (para.alignment === 'justify') docxAlignment = AlignmentType.JUSTIFIED;

    for (let lIdx = 0; lIdx < para.lines.length; lIdx++) {
      const line = para.lines[lIdx];
      for (let k = 0; k < line.items.length; k++) {
        const item: PositionedTextItem = line.items[k];
        const isLastInLine = k === line.items.length - 1;

        let itemStr = TypographyEngine.normalizeText(item.str);
        if (!itemStr) continue;

        if (!isLastInLine) {
          const nextItem = line.items[k + 1];
          if (nextItem.leftX - (item.leftX + item.width) > 2) {
            itemStr += ' ';
          }
        } else if (lIdx < para.lines.length - 1) {
          itemStr += ' ';
        }

        const fontName = TypographyEngine.mapFontFamily(item.fontName, item.fontFamily);
        const itemFontSizeInPts = Math.max(headingFontSizePts, Math.round(item.fontSize * 2));

        textRuns.push(
          new TextRun({
            text: itemStr,
            bold: true,
            italics: item.isItalic,
            underline: item.isUnderline ? {} : undefined,
            strike: item.isStrike,
            superScript: item.isSuperScript,
            subScript: item.isSubScript,
            size: itemFontSizeInPts,
            font: fontName,
          })
        );
      }
    }

    return new Paragraph({
      children: textRuns,
      heading: wordHeadingLevel,
      alignment: docxAlignment,
      keepNext: true,
      spacing: {
        before: para.spaceBefore ?? spaceBefore,
        after: para.spaceAfter ?? spaceAfter,
        line: 240,
      },
    });
  }
}
