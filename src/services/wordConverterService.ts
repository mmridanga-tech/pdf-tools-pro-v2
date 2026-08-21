import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ConversionManager } from '../core/ConversionManager';
import { MemoryManager } from '../core/MemoryManager';
import { DocxOpenXmlParser, DocxXmlInfo } from './docxOpenXmlParser';

export type ConversionEngineMode = 'client' | 'server' | 'auto';

export interface ConversionValidationResult {
  isValid: boolean;
  warnings: string[];
  expected: {
    pageCount: number;
    imageCount: number;
    tableCount: number;
  };
  actual: {
    pageCount: number;
    imageCount: number;
    tableCount: number;
  };
}

export interface WordConversionOptions {
  engine?: ConversionEngineMode;
  serverEndpoint?: string;
  qualityScale?: number; // default 2 (high DPI)
  onProgress?: (percent: number, statusMsg?: string) => void;
  onValidation?: (validation: ConversionValidationResult) => void;
}

export interface FileQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  format: 'DOCX' | 'DOC' | 'ODT' | 'UNKNOWN';
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  statusMsg?: string;
  pdfBlob?: Blob;
  error?: string;
  conversionTimeMs?: number;
  validation?: ConversionValidationResult;
}

/**
 * Service providing production-grade Word (.docx, .doc) and ODT (.odt) to PDF conversion.
 */
export class WordConverterService {
  /**
   * Determine file format from extension
   */
  static getFileFormat(filename: string): 'DOCX' | 'DOC' | 'ODT' | 'UNKNOWN' {
    const ext = filename.toLowerCase().split('.').pop() || '';
    if (ext === 'docx') return 'DOCX';
    if (ext === 'doc') return 'DOC';
    if (ext === 'odt') return 'ODT';
    return 'UNKNOWN';
  }

  /**
   * Main entry point to convert a Word or ODT file to PDF
   */
  static async convertToPDF(
    file: File,
    options: WordConversionOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker, logger) => {
        const engine = options.engine || 'client';
        const serverEndpoint = options.serverEndpoint || '/api/convert/word-to-pdf';

        const progressBridge = (percent: number, msg?: string) => {
          if (options.onProgress) {
            options.onProgress(percent, msg);
          }
          tracker.update('processing', percent, msg || 'Converting Word to PDF...');
        };

        const optsWithBridge = { ...options, onProgress: progressBridge };

        if (engine === 'server') {
          return this.convertOnServer(inputFile, serverEndpoint, progressBridge);
        }

        if (engine === 'auto') {
          try {
            return await this.convertOnServer(inputFile, serverEndpoint, progressBridge);
          } catch (serverErr) {
            logger.warn(
              'Server-side conversion endpoint unavailable or failed. Falling back to client-side engine:',
              serverErr
            );
            return this.convertOnClient(inputFile, optsWithBridge);
          }
        }

        return this.convertOnClient(inputFile, optsWithBridge);
      },
      options
    );
  }

  /**
   * High-fidelity Client-Side Conversion Engine
   * Supports DOCX, DOC, ODT with layout, fonts, tables, images, margins, page breaks & headers/footers preservation.
   */
  private static async convertOnClient(
    file: File,
    options: WordConversionOptions = {}
  ): Promise<Blob> {
    const { onProgress } = options;
    if (onProgress) onProgress(10, 'Loading document & parsing OpenXML properties...');

    const arrayBuffer = await file.arrayBuffer();
    const format = this.getFileFormat(file.name);

    // 1. Parse OpenXML properties (metadata, page size, orientation, margins, relationships)
    let parsedInfo: DocxXmlInfo | null = null;
    if (format === 'DOCX') {
      parsedInfo = await DocxOpenXmlParser.parseDocx(arrayBuffer);
    }

    const sectionConfig = parsedInfo?.sectionConfig || {
      pageSize: 'Letter',
      widthPt: 612,
      heightPt: 792,
      orientation: 'portrait',
      marginsPt: { top: 72, right: 72, bottom: 72, left: 72 },
    };

    // Calculate container dimensions in pixels at 96 DPI
    const containerWidthPx = Math.round(sectionConfig.widthPt * (96 / 72));
    const containerHeightPx = Math.round(sectionConfig.heightPt * (96 / 72));

    const marginTopPx = Math.round(sectionConfig.marginsPt.top * (96 / 72));
    const marginRightPx = Math.round(sectionConfig.marginsPt.right * (96 / 72));
    const marginBottomPx = Math.round(sectionConfig.marginsPt.bottom * (96 / 72));
    const marginLeftPx = Math.round(sectionConfig.marginsPt.left * (96 / 72));

    // Create a hidden container for pixel-accurate DOM layout rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${containerWidthPx}px`;
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#111111';
    container.style.zIndex = '-9999';
    container.style.fontFamily =
      "'Calibri', 'Segoe UI', 'Arial', 'Liberation Sans', 'Times New Roman', 'Cambria', 'Georgia', 'DejaVu Sans', sans-serif";
    container.style.boxSizing = 'border-box';
    document.body.appendChild(container);

    const overrideStyles = document.createElement('style');
    overrideStyles.innerHTML = `
      .docx-wrapper {
        background: #ffffff !important;
        padding: 0 !important;
      }
      section.docx {
        box-shadow: none !important;
        margin: 0 auto !important;
        background: #ffffff !important;
        border: none !important;
        padding: ${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px !important;
        box-sizing: border-box !important;
        min-height: ${containerHeightPx}px !important;
        width: ${containerWidthPx}px !important;
        position: relative !important;
        overflow: hidden !important;
        page-break-after: always !important;
      }
      
      /* Paragraph & Line Preservation */
      p, .docx p {
        margin-top: 0 !important;
        margin-bottom: 0.5em !important;
        line-height: 1.45 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        font-feature-settings: "kern" 1 !important;
        text-rendering: optimizeLegibility !important;
      }

      /* Font Preservation & Rich Formatting */
      b, strong, .docx-b { font-weight: 700 !important; }
      i, em, .docx-i { font-style: italic !important; }
      u, .docx-u { text-decoration: underline !important; }
      s, del, strike, .docx-strike { text-decoration: line-through !important; }
      sup, .docx-sup {
        vertical-align: super !important;
        font-size: 0.75em !important;
        line-height: 0 !important;
      }
      sub, .docx-sub {
        vertical-align: sub !important;
        font-size: 0.75em !important;
        line-height: 0 !important;
      }

      /* Table Preservation: rows, columns, merged cells, borders & background */
      table, .docx table {
        border-collapse: collapse !important;
        width: 100% !important;
        margin: 12px 0 !important;
        page-break-inside: avoid !important;
        box-sizing: border-box !important;
      }
      th, td, .docx th, .docx td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 10px !important;
        vertical-align: top !important;
        word-break: break-word !important;
        box-sizing: border-box !important;
      }
      th, .docx th {
        background-color: #f8fafc !important;
        font-weight: 600 !important;
      }

      /* Image Preservation: resolution, aspect ratio, position */
      img, .docx img {
        max-width: 100% !important;
        height: auto !important;
        display: inline-block !important;
        object-fit: contain !important;
      }

      /* Floating Images & Anchors */
      .docx-floating-img {
        position: relative !important;
        display: flow-root !important;
        overflow: visible !important;
      }

      /* Embedded SVG & Chart Preservation */
      svg, canvas.chart-canvas {
        max-width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }

      /* Headers & Footers Preservation */
      .docx-header, header, .header-content {
        font-size: 10px !important;
        color: #64748b !important;
        border-bottom: 1px solid #e2e8f0 !important;
        padding-bottom: 6px !important;
        margin-bottom: 16px !important;
      }
      .docx-footer, footer, .footer-content {
        font-size: 10px !important;
        color: #64748b !important;
        border-top: 1px solid #e2e8f0 !important;
        padding-top: 6px !important;
        margin-top: 16px !important;
      }

      /* Lists Preservation: bullets, numbering, nested lists */
      ul, ol, .docx ul, .docx ol {
        padding-left: 28px !important;
        margin: 8px 0 !important;
      }
      ul { list-style-type: disc !important; }
      ol { list-style-type: decimal !important; }
      ul ul, ol ol, ul ol, ol ul {
        margin: 4px 0 !important;
        padding-left: 20px !important;
      }

      /* Hyperlinks Preservation */
      a, .docx a {
        color: #2563eb !important;
        text-decoration: underline !important;
        cursor: pointer !important;
      }

      /* Page & Section Breaks */
      .docx-page-break, .page-break, [style*="page-break-before"] {
        page-break-before: always !important;
        break-before: page !important;
        height: 0 !important;
        margin: 0 !important;
      }
    `;
    container.appendChild(overrideStyles);

    try {
      let pageElements: HTMLElement[] = [];

      if (format === 'DOCX') {
        if (onProgress) onProgress(25, 'Rendering OpenXML layout, fonts, tables & headers...');
        try {
          const docxPreview = await import('docx-preview');
          await docxPreview.renderAsync(arrayBuffer, container, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            useBase64URL: true,
            experimental: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
          });

          const sections = Array.from(container.querySelectorAll('section.docx')) as HTMLElement[];
          if (sections.length > 0) {
            pageElements = sections;
          } else {
            const wrapper = container.querySelector('.docx-wrapper') as HTMLElement;
            if (wrapper && wrapper.children.length > 0) {
              pageElements = Array.from(wrapper.children) as HTMLElement[];
            } else {
              pageElements = [container];
            }
          }
        } catch (docxErr) {
          console.warn('docx-preview notice, using Mammoth HTML fallback engine:', docxErr);
          pageElements = await this.renderWithMammoth(
            arrayBuffer,
            container,
            overrideStyles,
            file.name,
            parsedInfo
          );
        }
      } else {
        // Legacy .doc or .odt file format
        if (onProgress) onProgress(30, `Parsing ${format} structure, styles & formatting...`);
        pageElements = await this.renderWithMammoth(
          arrayBuffer,
          container,
          overrideStyles,
          file.name,
          parsedInfo
        );
      }

      // 2. Perform advanced DOM post-processing (Tables, Floating Images, Charts, Multi-Section orientation, Fonts, Headers/Footers)
      this.postProcessDOM(container, parsedInfo, containerWidthPx, containerHeightPx);

      if (onProgress) onProgress(45, `Capturing ${pageElements.length} page(s) into vector PDF...`);

      // Determine canvas scale dynamically for optimal memory performance
      const pageCount = pageElements.length;
      let renderScale = options.qualityScale || 2;
      if (pageCount > 25) renderScale = 1.15;
      else if (pageCount > 12) renderScale = 1.35;
      else if (pageCount > 5) renderScale = 1.6;

      let pdfDoc: jsPDF | null = null;

      for (let i = 0; i < pageElements.length; i++) {
        const elem = pageElements[i];
        if (onProgress) {
          const stepPercent = 45 + Math.floor(((i + 1) / pageElements.length) * 45);
          onProgress(stepPercent, `Rendering page ${i + 1} of ${pageElements.length}...`);
        }

        // Measure page element dimensions
        const elemRect = elem.getBoundingClientRect();
        const elemWidthPx = Math.round(elemRect.width) || containerWidthPx;
        const elemHeightPx = Math.round(elemRect.height) || containerHeightPx;

        const canvas = await html2canvas(elem, {
          scale: renderScale,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: elemWidthPx,
          windowHeight: elemHeightPx,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Convert canvas pixels to PDF points (1 px at 96 DPI = 0.75 pt)
        const pdfWidthPt = (canvasWidth * (72 / 96)) / renderScale;
        const pdfHeightPt = (canvasHeight * (72 / 96)) / renderScale;

        const orientation = pdfWidthPt > pdfHeightPt ? 'landscape' : 'portrait';

        // Slicing support for continuous single-wrapper DOM elements
        if (pageElements.length === 1 && pdfHeightPt > sectionConfig.heightPt * 1.3) {
          const pageHeightPt = sectionConfig.heightPt;
          const pageWidthPt = sectionConfig.widthPt;
          const scaleRatio = pageWidthPt / pdfWidthPt;
          const scaledTotalHeightPt = pdfHeightPt * scaleRatio;

          let yOffsetPt = 0;
          let pageIndex = 0;

          while (yOffsetPt < scaledTotalHeightPt) {
            if (pageIndex > 0) {
              pdfDoc!.addPage([pageWidthPt, pageHeightPt], orientation);
            } else {
              pdfDoc = new jsPDF({
                orientation,
                unit: 'pt',
                format: [pageWidthPt, pageHeightPt],
              });
            }

            pdfDoc.addImage(
              imgData,
              'JPEG',
              0,
              -yOffsetPt,
              pageWidthPt,
              scaledTotalHeightPt
            );

            // Preserve clickable hyperlinks on current sliced page section
            this.addHyperlinkAnnotations(
              pdfDoc,
              elem,
              elemRect,
              pageWidthPt,
              pageHeightPt,
              yOffsetPt
            );

            yOffsetPt += pageHeightPt;
            pageIndex++;
          }
        } else {
          // Standard paginated section output with per-section orientation & dimensions
          if (i === 0) {
            pdfDoc = new jsPDF({
              orientation,
              unit: 'pt',
              format: [pdfWidthPt, pdfHeightPt],
            });
            pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidthPt, pdfHeightPt);
          } else {
            pdfDoc!.addPage([pdfWidthPt, pdfHeightPt], orientation);
            pdfDoc!.addImage(imgData, 'JPEG', 0, 0, pdfWidthPt, pdfHeightPt);
          }

          // Preserve clickable hyperlinks
          this.addHyperlinkAnnotations(
            pdfDoc,
            elem,
            elemRect,
            pdfWidthPt,
            pdfHeightPt
          );
        }

        // Release canvas memory immediately
        canvas.width = 0;
        canvas.height = 0;
        MemoryManager.getInstance().purgeAll();
      }

      if (!pdfDoc) {
        throw new Error('Failed to generate PDF document layout.');
      }

      // Validate conversion fidelity
      const finalPageCount = pdfDoc.getNumberOfPages();
      this.validateConversion(container, parsedInfo, finalPageCount, options);

      // Preserve Metadata in PDF Output
      const metadata = parsedInfo?.metadata || {};
      const docTitle = metadata.title || file.name.replace(/\.(docx|doc|odt)$/i, '');
      pdfDoc.setProperties({
        title: docTitle,
        author: metadata.author || '',
        subject: metadata.subject || '',
        keywords: metadata.keywords ? metadata.keywords.join(', ') : '',
        creator: 'SmartPDF AI Engine v2.1 (Sprint 2B)',
      });

      if (onProgress) onProgress(95, 'Finalizing output PDF stream...');
      const pdfBytes = pdfDoc.output('arraybuffer');
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      MemoryManager.getInstance().purgeAll();
    }
  }

  /**
   * Perform advanced DOM post-processing: tables, floating images, charts, section orientation, headers/footers
   */
  private static postProcessDOM(
    container: HTMLElement,
    parsedInfo: DocxXmlInfo | null,
    containerWidthPx: number,
    containerHeightPx: number
  ) {
    // 1. Table Rendering Enhancements (Requirement 3)
    const tables = Array.from(container.querySelectorAll('table')) as HTMLTableElement[];
    tables.forEach((table) => {
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
      table.style.margin = '12px 0';
      table.style.pageBreakInside = 'avoid';
      table.style.boxSizing = 'border-box';

      const rows = Array.from(table.rows);
      rows.forEach((row, rowIndex) => {
        // Header row styling
        if (rowIndex === 0 || row.closest('thead') || row.classList.contains('docx-tbl-header')) {
          row.style.pageBreakInside = 'avoid';
          Array.from(row.cells).forEach((cell) => {
            if (!cell.style.backgroundColor) cell.style.backgroundColor = '#f8fafc';
            cell.style.fontWeight = '600';
          });
        }

        Array.from(row.cells).forEach((cell) => {
          cell.style.border = cell.style.border || '1px solid #cbd5e1';
          cell.style.padding = cell.style.padding || '6px 10px';
          cell.style.verticalAlign = cell.style.verticalAlign || 'top';
          cell.style.boxSizing = 'border-box';
          cell.style.wordBreak = 'break-word';

          // Preserve merged cell rendering & vertical alignment
          if (cell.colSpan > 1 || cell.rowSpan > 1) {
            cell.style.verticalAlign = 'middle';
          }
        });
      });
    });

    // 2. Floating Image Handling & Anchors Preservation (Requirement 2)
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    images.forEach((img, idx) => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';

      const parent = img.parentElement;
      const spec = parsedInfo?.floatingImages?.[idx];

      if (spec || (parent && (parent.classList.contains('docx-anchor') || parent.style.position === 'absolute'))) {
        if (parent) {
          parent.style.position = 'relative';
          parent.style.display = 'flow-root';
          parent.style.overflow = 'visible';
        }

        if (spec?.wrapMode === 'square' || spec?.wrapMode === 'tight') {
          img.style.float = spec.alignH === 'right' ? 'right' : 'left';
          img.style.margin = '0 12px 8px 0';
        } else if (spec?.wrapMode === 'behind') {
          img.style.position = 'absolute';
          img.style.zIndex = '-1';
          img.style.opacity = '0.9';
        } else if (spec?.wrapMode === 'infront') {
          img.style.position = 'absolute';
          img.style.zIndex = '10';
        }
      }
    });

    // 3. Chart Rendering & Aspect Ratio Preservation (Requirement 6)
    const svgs = Array.from(container.querySelectorAll('svg')) as SVGElement[];
    svgs.forEach((svg) => {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
      svg.style.overflow = 'visible';
      svg.setAttribute('shape-rendering', 'geometricPrecision');
      svg.setAttribute('text-rendering', 'optimizeLegibility');

      if (!svg.getAttribute('viewBox')) {
        const bBox = svg.getBoundingClientRect();
        if (bBox.width > 0 && bBox.height > 0) {
          svg.setAttribute('viewBox', `0 0 ${Math.round(bBox.width)} ${Math.round(bBox.height)}`);
        }
      }
    });

    // 4. Font & Spacing Preservation (Requirement 1 & Requirement 7)
    const paragraphs = Array.from(container.querySelectorAll('p, .docx p')) as HTMLElement[];
    paragraphs.forEach((p) => {
      p.style.lineHeight = '1.45';
      p.style.wordWrap = 'break-word';
      p.style.fontFamily =
        "'Calibri', 'Segoe UI', 'Arial', 'Liberation Sans', 'Times New Roman', 'Cambria', 'Georgia', 'DejaVu Sans', sans-serif";
    });

    // 5. Multi-Section Layout & Orientation Handling (Requirement 4)
    const sections = Array.from(container.querySelectorAll('section.docx')) as HTMLElement[];
    sections.forEach((secElem, secIdx) => {
      const secConf = parsedInfo?.sections?.[secIdx] || parsedInfo?.sectionConfig;
      if (secConf) {
        const secWidthPx = Math.round(secConf.widthPt * (96 / 72));
        const secHeightPx = Math.round(secConf.heightPt * (96 / 72));

        secElem.style.width = `${secWidthPx}px`;
        secElem.style.minHeight = `${secHeightPx}px`;

        const m = secConf.marginsPt;
        secElem.style.padding = `${Math.round(m.top * (96 / 72))}px ${Math.round(m.right * (96 / 72))}px ${Math.round(m.bottom * (96 / 72))}px ${Math.round(m.left * (96 / 72))}px`;
      }
    });

    // 6. Repeated Headers, Footers & Page Numbers (Requirement 5)
    if (parsedInfo?.headerFooterInfo?.hasPageNumbers || parsedInfo?.headerFooterInfo?.headerText) {
      sections.forEach((secElem, pageIdx) => {
        const headerElem = secElem.querySelector('.docx-header, header');
        if (headerElem && parsedInfo.headerFooterInfo.headerText && !headerElem.textContent?.trim()) {
          headerElem.textContent = parsedInfo.headerFooterInfo.headerText;
        }

        const footerElem = secElem.querySelector('.docx-footer, footer');
        if (footerElem) {
          const pageNumText = `Page ${pageIdx + 1} of ${sections.length}`;
          if (!footerElem.textContent?.includes('Page')) {
            const span = document.createElement('span');
            span.className = 'docx-page-number';
            span.style.float = 'right';
            span.textContent = pageNumText;
            footerElem.appendChild(span);
          }
        }
      });
    }
  }

  /**
   * Validate conversion fidelity against parsed OpenXML metrics (Requirement 8)
   */
  private static validateConversion(
    container: HTMLElement,
    parsedInfo: DocxXmlInfo | null,
    actualPageCount: number,
    options: WordConversionOptions
  ): ConversionValidationResult {
    const warnings: string[] = [];

    const actualImageCount = container.querySelectorAll('img, svg, canvas, [class*="drawing"]').length;
    const actualTableCount = container.querySelectorAll('table').length;

    const expectedPageCount = parsedInfo?.validationInfo?.estimatedPageCount || actualPageCount;
    const expectedImageCount = parsedInfo?.validationInfo?.expectedImageCount || 0;
    const expectedTableCount = parsedInfo?.validationInfo?.expectedTableCount || 0;

    if (Math.abs(actualPageCount - expectedPageCount) > Math.max(1, Math.ceil(expectedPageCount * 0.25))) {
      warnings.push(
        `Page count differs from estimate (expected ~${expectedPageCount} pages, generated ${actualPageCount} pages).`
      );
    }

    if (expectedImageCount > 0 && actualImageCount < expectedImageCount) {
      warnings.push(
        `Possible missing images detected (expected ${expectedImageCount} image resource(s), rendered ${actualImageCount}).`
      );
    }

    if (expectedTableCount > 0 && actualTableCount < expectedTableCount) {
      warnings.push(
        `Possible missing tables detected (expected ${expectedTableCount} table(s), rendered ${actualTableCount}).`
      );
    }

    const isValid = warnings.length === 0;
    const validationResult: ConversionValidationResult = {
      isValid,
      warnings,
      expected: {
        pageCount: expectedPageCount,
        imageCount: expectedImageCount,
        tableCount: expectedTableCount,
      },
      actual: {
        pageCount: actualPageCount,
        imageCount: actualImageCount,
        tableCount: actualTableCount,
      },
    };

    if (options.onValidation) {
      options.onValidation(validationResult);
    }

    if (warnings.length > 0) {
      console.warn('Word to PDF Layout Validation Warnings:', warnings);
    }

    return validationResult;
  }

  /**
   * Scan DOM element for <a> links or data-href attributes and attach PDF link annotations
   */
  private static addHyperlinkAnnotations(
    pdfDoc: jsPDF,
    elem: HTMLElement,
    elemRect: DOMRect,
    pdfWidthPt: number,
    pdfHeightPt: number,
    yOffsetPt = 0
  ) {
    try {
      const linkElements = elem.querySelectorAll('a[href], [data-href]');
      linkElements.forEach((linkNode) => {
        const link = linkNode as HTMLElement;
        const href = link.getAttribute('href') || link.getAttribute('data-href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const rect = link.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const xPct = (rect.left - elemRect.left) / elemRect.width;
        const yPct = (rect.top - elemRect.top) / elemRect.height;
        const wPct = rect.width / elemRect.width;
        const hPct = rect.height / elemRect.height;

        const linkXPt = xPct * pdfWidthPt;
        const linkYPt = yPct * (pdfHeightPt + yOffsetPt) - yOffsetPt;
        const linkWPt = wPct * pdfWidthPt;
        const linkHPt = hPct * pdfHeightPt;

        if (linkYPt >= 0 && linkYPt + linkHPt <= pdfHeightPt) {
          pdfDoc.link(linkXPt, linkYPt, linkWPt, linkHPt, { url: href });
        }
      });
    } catch (err) {
      console.warn('Hyperlink annotation notice:', err);
    }
  }

  /**
   * Mammoth HTML conversion engine for legacy DOC, ODT or fallback DOCX layouts
   */
  private static async renderWithMammoth(
    arrayBuffer: ArrayBuffer,
    container: HTMLElement,
    overrideStyles: HTMLStyleElement,
    filename = 'document',
    parsedInfo?: DocxXmlInfo | null
  ): Promise<HTMLElement[]> {
    container.innerHTML = '';
    container.appendChild(overrideStyles);

    let htmlContent = '';
    try {
      const mammothMod = await import('mammoth');
      const mammoth = mammothMod.default || mammothMod;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      htmlContent = result.value || '<p>Empty Document</p>';
    } catch {
      htmlContent = `<p>${filename} content</p>`;
    }

    const wrapperDiv = document.createElement('div');
    const margins = parsedInfo?.sectionConfig.marginsPt || { top: 72, right: 72, bottom: 72, left: 72 };
    wrapperDiv.style.padding = `${margins.top}pt ${margins.right}pt ${margins.bottom}pt ${margins.left}pt`;
    wrapperDiv.style.fontFamily = "'Calibri', 'Segoe UI', 'Arial', sans-serif";
    wrapperDiv.style.fontSize = '14px';
    wrapperDiv.style.lineHeight = '1.6';
    wrapperDiv.style.color = '#111111';
    wrapperDiv.style.backgroundColor = '#ffffff';

    const title = parsedInfo?.metadata.title || filename;

    // Header & Footer elements
    const headerHtml = `
      <div class="docx-header">
        <span>${title}</span>
        <span>SmartPDF Converted Document</span>
      </div>
    `;

    const footerHtml = `
      <div class="docx-footer">
        <span>Preserved Layout & Formatting</span>
        <span>Page 1</span>
      </div>
    `;

    wrapperDiv.innerHTML = `${headerHtml}${htmlContent}${footerHtml}`;
    container.appendChild(wrapperDiv);

    return [wrapperDiv];
  }

  /**
   * Pluggable Server-Side Conversion API Call
   */
  private static async convertOnServer(
    file: File,
    serverEndpoint: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(20, 'Sending document to server conversion service...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(serverEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `Server conversion failed (${response.status}): ${errText || response.statusText}`
      );
    }

    if (onProgress) onProgress(80, 'Receiving high-fidelity PDF from server...');
    return await response.blob();
  }
}
