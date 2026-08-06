import { Paragraph, TextRun, AlignmentType } from 'docx';
import { SemanticParagraph, PositionedTextItem } from '../LayoutAnalyzer';
import { TypographyEngine } from '../TypographyEngine';
import { DocxHyperlinkBuilder } from './DocxHyperlinkBuilder';

export class DocxListBuilder {
  /**
   * Build DOCX List paragraph with bullets or numbered list indentation
   */
  static buildListParagraph(para: SemanticParagraph, bodyFontSize = 11): Paragraph {
    const textRuns: any[] = [];

    const level = Math.min(3, Math.max(0, para.bulletLevel || 0));

    let docxAlignment: any = AlignmentType.LEFT;
    if (para.alignment === 'center') docxAlignment = AlignmentType.CENTER;
    else if (para.alignment === 'right') docxAlignment = AlignmentType.RIGHT;
    else if (para.alignment === 'justify') docxAlignment = AlignmentType.JUSTIFIED;

    for (let lIdx = 0; lIdx < para.lines.length; lIdx++) {
      const line = para.lines[lIdx];
      let lineItems = line.items;

      // Strip bullet/number marker on first line to avoid double markers in Word
      if (para.listMarker && lIdx === 0 && lineItems.length > 0) {
        const firstStr = lineItems[0].str.replace(para.listMarker, '').trim();
        if (firstStr) {
          lineItems = [{ ...lineItems[0], str: firstStr }, ...lineItems.slice(1)];
        } else if (lineItems.length > 1) {
          lineItems = lineItems.slice(1);
        }
      }

      for (let k = 0; k < lineItems.length; k++) {
        const item: PositionedTextItem = lineItems[k];
        const isLastInLine = k === lineItems.length - 1;

        let itemStr = TypographyEngine.normalizeText(item.str);
        if (!itemStr) continue;

        if (!isLastInLine) {
          const nextItem = lineItems[k + 1];
          if (nextItem.leftX - (item.leftX + item.width) > 2) {
            itemStr += ' ';
          }
        } else if (lIdx < para.lines.length - 1) {
          if (/[a-zA-Z]-$/.test(itemStr)) {
            itemStr = itemStr.slice(0, -1);
          } else {
            itemStr += ' ';
          }
        }

        const fontName = TypographyEngine.mapFontFamily(item.fontName, item.fontFamily);
        const fontSizeInPts = Math.max(16, Math.round(item.fontSize * 2));

        if (item.linkUrl || DocxHyperlinkBuilder.isUrlString(itemStr)) {
          textRuns.push(
            DocxHyperlinkBuilder.buildHyperlink({
              text: itemStr,
              url: item.linkUrl || itemStr,
              fontSizePts: fontSizeInPts,
              fontName,
              isBold: item.isBold,
              isItalic: item.isItalic,
            })
          );
        } else {
          textRuns.push(
            new TextRun({
              text: itemStr,
              bold: item.isBold,
              italics: item.isItalic,
              underline: item.isUnderline ? {} : undefined,
              strike: item.isStrike,
              superScript: item.isSuperScript,
              subScript: item.isSubScript,
              size: fontSizeInPts,
              font: fontName,
            })
          );
        }
      }
    }

    const paragraphOptions: any = {
      children: textRuns,
      alignment: docxAlignment,
      spacing: {
        before: para.spaceBefore ?? 40,
        after: para.spaceAfter ?? 60,
        line: para.lineSpacing ?? 240,
      },
    };

    if (para.isBulletList) {
      paragraphOptions.bullet = { level };
    } else if (para.isNumberedList) {
      paragraphOptions.indent = { left: 360 * (level + 1) };
    }

    return new Paragraph(paragraphOptions);
  }
}
