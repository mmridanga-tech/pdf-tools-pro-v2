export interface TextFormatting {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isSuperScript: boolean;
  isSubScript: boolean;
  fontFamily: string;
  mappedDocxFont: string;
  fontSizePts: number;
}

export class TypographyEngine {
  /**
   * Map PDF font names to DOCX standard web-safe font families
   */
  static mapFontFamily(pdfFontName: string, fontFamilyHint?: string): string {
    const combined = `${pdfFontName || ''} ${fontFamilyHint || ''}`.toLowerCase();

    if (combined.includes('times') || combined.includes('serif')) return 'Times New Roman';
    if (combined.includes('courier') || combined.includes('mono') || combined.includes('code')) return 'Courier New';
    if (combined.includes('arial') || combined.includes('helvetica') || combined.includes('sans')) return 'Arial';
    if (combined.includes('calibri')) return 'Calibri';
    if (combined.includes('georgia')) return 'Georgia';
    if (combined.includes('garamond')) return 'Garamond';
    if (combined.includes('verdana')) return 'Verdana';
    if (combined.includes('cambria')) return 'Cambria';
    if (combined.includes('trebuchet')) return 'Trebuchet MS';
    if (combined.includes('tahoma')) return 'Tahoma';

    return 'Calibri';
  }

  /**
   * Detect bold weight from font name or font family string
   */
  static detectBold(pdfFontName: string, fontFamilyHint?: string): boolean {
    const combined = `${pdfFontName || ''} ${fontFamilyHint || ''}`.toLowerCase();
    return (
      combined.includes('bold') ||
      combined.includes('heavy') ||
      combined.includes('black') ||
      combined.includes('semibold') ||
      combined.includes('medium') ||
      combined.includes('w700') ||
      combined.includes('w800') ||
      combined.includes('w900') ||
      combined.includes('bolder')
    );
  }

  /**
   * Detect italic style from font name or font family string
   */
  static detectItalic(pdfFontName: string, fontFamilyHint?: string): boolean {
    const combined = `${pdfFontName || ''} ${fontFamilyHint || ''}`.toLowerCase();
    return (
      combined.includes('italic') ||
      combined.includes('oblique') ||
      combined.includes('slanted')
    );
  }

  /**
   * Detect underline style from font hints or properties
   */
  static detectUnderline(pdfFontName: string, fontFamilyHint?: string, isUnderlineFlag?: boolean): boolean {
    if (isUnderlineFlag) return true;
    const combined = `${pdfFontName || ''} ${fontFamilyHint || ''}`.toLowerCase();
    return combined.includes('underline');
  }

  /**
   * Detect strike-through style
   */
  static detectStrikeThrough(pdfFontName: string, isStrikeFlag?: boolean): boolean {
    if (isStrikeFlag) return true;
    const combined = `${pdfFontName || ''}`.toLowerCase();
    return combined.includes('strike') || combined.includes('linethrough');
  }

  /**
   * Detect superscript relative to baseline
   */
  static detectSuperscript(itemFontSize: number, bodyFontSize: number, isSuperFlag?: boolean): boolean {
    if (isSuperFlag) return true;
    return itemFontSize < bodyFontSize * 0.82 && itemFontSize >= 5;
  }

  /**
   * Detect subscript relative to baseline
   */
  static detectSubscript(itemFontSize: number, bodyFontSize: number, isSubFlag?: boolean): boolean {
    if (isSubFlag) return true;
    return false;
  }

  /**
   * Infer heading level (H1, H2, H3, H4 or body) based on text size relative to body baseline
   */
  static inferHeadingLevel(
    fontSize: number,
    bodyFontSize: number,
    cleanText: string,
    isBold: boolean
  ): 'h1' | 'h2' | 'h3' | 'h4' | null {
    const isShort = cleanText.length < 130 && !cleanText.endsWith('.');
    if (!isShort) return null;

    if (fontSize >= bodyFontSize * 1.75 || fontSize >= 20) {
      return 'h1';
    }
    if (fontSize >= bodyFontSize * 1.38 || fontSize >= 15.5) {
      return 'h2';
    }
    if (fontSize >= bodyFontSize * 1.18 || (fontSize >= 13 && isBold)) {
      return 'h3';
    }
    if (fontSize >= bodyFontSize * 1.05 && isBold && cleanText.length < 80) {
      return 'h4';
    }

    return null;
  }

  /**
   * Calculate median font size across sampled page items to find document body baseline size
   */
  static calculateBodyFontSize(fontSizes: number[], fallback = 11): number {
    if (!fontSizes || fontSizes.length === 0) return fallback;
    const sorted = [...fontSizes].filter((s) => s >= 4 && s <= 72).sort((a, b) => a - b);
    if (sorted.length === 0) return fallback;

    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Normalize unicode characters, ligatures, whitespace and remove corrupt PDF glyph codes
   */
  static normalizeText(str: string): string {
    if (!str) return '';
    let text = str.normalize('NFC');

    // Expand standard unicode ligatures
    text = text
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'st')
      .replace(/\uFB06/g, 'st');

    // Normalize special quotation marks & dashes
    text = text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-');

    // Remove Private Use Area (PUA) and corrupt replacement glyphs
    text = text.replace(/[\uE000-\uF8FF\uFFFD]/g, '');

    // Normalize multiple spaces into single space
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Resolve line-end hyphenation when merging broken lines
   */
  static mergeWithHyphenResolution(prevLineText: string, nextLineText: string): string {
    if (!prevLineText) return nextLineText || '';
    if (!nextLineText) return prevLineText || '';

    // Check if prev line ends with soft hyphen or standard hyphen preceded by a word character
    if (/[a-zA-Z]-$/.test(prevLineText.trim())) {
      const stem = prevLineText.trim().slice(0, -1);
      const firstWord = nextLineText.trim().split(' ')[0];
      // If next line starts with lowercase letter, merge without space
      if (/^[a-z]/.test(firstWord)) {
        return `${stem}${nextLineText.trim()}`;
      }
    }

    return `${prevLineText.trim()} ${nextLineText.trim()}`;
  }
}
