import { Paragraph, PageBreak } from 'docx';

export class DocxPageBreakEngine {
  /**
   * Build a standard DOCX Page Break paragraph
   */
  static buildPageBreak(): Paragraph {
    return new Paragraph({
      children: [new PageBreak()],
    });
  }

  /**
   * Helper: Check if paragraph list ends with a page break
   */
  static endsWithPageBreak(children: any[]): boolean {
    if (!children || children.length === 0) return false;
    const last = children[children.length - 1];
    return last && last.children && last.children.some((c: any) => c instanceof PageBreak);
  }

  /**
   * Conditionally append a page break if previous content does not already end with one
   */
  static appendPageBreakIfNeeded(children: any[]): void {
    if (children.length > 0 && !this.endsWithPageBreak(children)) {
      children.push(this.buildPageBreak());
    }
  }
}
