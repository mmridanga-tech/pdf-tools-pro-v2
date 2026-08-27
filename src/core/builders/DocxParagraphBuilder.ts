import { Paragraph, TextRun, AlignmentType } from 'docx';
import { SemanticParagraph, PositionedTextItem } from '../LayoutAnalyzer';
import { TypographyEngine } from '../TypographyEngine';
import { DocxHyperlinkBuilder } from './DocxHyperlinkBuilder';
import { DocxHeadingBuilder } from './DocxHeadingBuilder';
import { DocxListBuilder } from './DocxListBuilder';

export class DocxParagraphBuilder {
  /**
   * Build DOCX Paragraph from SemanticParagraph with full paragraph spacing, alignment, first-line indent, captions & footnotes
   */
  static buildParagraph(para: SemanticParagraph, bodyFontSize = 11): Paragraph {
    // Route headings to HeadingBuilder
    if (para.type === 'heading' || para.headingLevel) {
      return DocxHeadingBuilder.buildHeading(para, bodyFontSize);
    }

    // Route lists to ListBuilder
    if (para.type === 'list' || para.isBulletList || para.isNumberedList) {
      return DocxListBuilder.buildListParagraph(para, bodyFontSize);
    }

    const isCaption = para.type === 'caption' || para.isCaption;
    const isFootnote = para.type === 'footnote' || para.isFootnote;

    const textRuns: any[] = [];

    let docxAlignment: any = AlignmentType.LEFT;
    if (para.alignment === 'center' || isCaption) docxAlignment = AlignmentType.CENTER;
    else if (para.alignment === 'right') docxAlignment = AlignmentType.RIGHT;
    else if (para.alignment === 'justify') docxAlignment = AlignmentType.JUSTIFIED;

    for (let lIdx = 0; lIdx < para.lines.length; lIdx++) {
      const line = para.lines[lIdx];
      const lineItems = line.items;

      for (let k = 0; k < lineItems.length; k++) {
        const item: PositionedTextItem = lineItems[k];
        const isLastInLine = k === lineItems.length - 1;

        let itemStr = TypographyEngine.normalizeText(item.str);
        if (!itemStr) continue;

        if (!isLastInLine) {
          const nextItem = lineItems[k + 1];
          const gap = nextItem.leftX - (item.leftX + item.width);
          if (gap >= 1.0 || item.str.endsWith(' ') || nextItem.str.startsWith(' ')) {
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
        let fontSizeInPts = Math.max(16, Math.round(item.fontSize * 2));
        if (isFootnote) {
          fontSizeInPts = Math.min(18, Math.round(item.fontSize * 1.8));
        }

        if (item.linkUrl || DocxHyperlinkBuilder.isUrlString(itemStr)) {
          textRuns.push(
            DocxHyperlinkBuilder.buildHyperlink({
              text: itemStr,
              url: item.linkUrl || itemStr,
              fontSizePts: fontSizeInPts,
              fontName,
              isBold: item.isBold,
              isItalic: item.isItalic || isCaption,
            })
          );
        } else {
          textRuns.push(
            new TextRun({
              text: itemStr,
              bold: item.isBold,
              italics: item.isItalic || isCaption,
              underline: item.isUnderline ? {} : undefined,
              strike: item.isStrike,
              superScript: item.isSuperScript,
              subScript: item.isSubScript,
              color: isCaption ? '4B5563' : isFootnote ? '374151' : undefined,
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
        before: isCaption ? 40 : isFootnote ? 100 : (para.spaceBefore ?? 40),
        after: isCaption ? 140 : isFootnote ? 60 : (para.spaceAfter ?? 120),
        line: para.lineSpacing ?? 240,
      },
    };

    if (isFootnote) {
      paragraphOptions.indent = { left: 240 };
    } else if (para.firstLineIndent && para.firstLineIndent > 0) {
      paragraphOptions.indent = { firstLine: para.firstLineIndent };
    }

    return new Paragraph(paragraphOptions);
  }
}
