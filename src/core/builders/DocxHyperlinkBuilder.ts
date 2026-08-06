import { ExternalHyperlink, TextRun } from 'docx';
import { TypographyEngine } from '../TypographyEngine';

export interface HyperlinkOptions {
  text: string;
  url: string;
  fontSizePts: number;
  fontName: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export class DocxHyperlinkBuilder {
  /**
   * Check if a text string is a valid HTTP/HTTPS/Mailto/WWW URL
   */
  static isUrlString(str: string): boolean {
    if (!str) return false;
    const trimmed = str.trim();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('www.') ||
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)
    );
  }

  /**
   * Normalize raw URL string into standard clickable URI format
   */
  static normalizeUrl(urlStr: string): string {
    const trimmed = urlStr.trim();
    if (trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    }
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      return `mailto:${trimmed}`;
    }
    return trimmed;
  }

  /**
   * Build a DOCX ExternalHyperlink component
   */
  static buildHyperlink(options: HyperlinkOptions): ExternalHyperlink {
    const targetUrl = this.normalizeUrl(options.url);
    const textStr = TypographyEngine.normalizeText(options.text);

    return new ExternalHyperlink({
      children: [
        new TextRun({
          text: textStr,
          style: 'Hyperlink',
          color: '0563C1',
          underline: {},
          bold: options.isBold,
          italics: options.isItalic,
          size: options.fontSizePts,
          font: options.fontName,
        }),
      ],
      link: targetUrl,
    });
  }
}
