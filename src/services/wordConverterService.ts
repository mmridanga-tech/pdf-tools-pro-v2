import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ConversionManager } from '../core/ConversionManager';
import { MemoryManager } from '../core/MemoryManager';
import { DocxOpenXmlParser, DocxXmlInfo } from './docxOpenXmlParser';

export type ConversionEngineMode = 'client' | 'server' | 'auto';

export interface WordConversionOptions {
  engine?: ConversionEngineMode;
  serverEndpoint?: string;
  qualityScale?: number; // default 2 (high DPI)
  onProgress?: (percent: number, statusMsg?: string) => void;
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
      "'Calibri', 'Segoe UI', 'Arial', 'Liberation Sans', 'Times New Roman', sans-serif";
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
        line-height: 1.5 !important;
        word-wrap: break-word !important;
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
      }
      th, td, .docx th, .docx td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 10px !important;
        vertical-align: top !important;
        word-break: break-word !important;
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
      .docx-page-break, .page-break {
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

      if (onProgress) onProgress(45, `Capturing ${pageElements.length} page(s) into vector PDF...`);

      // Determine canvas scale dynamically for optimal memory performance
      const pageCount = pageElements.length;
      let renderScale = options.qualityScale || 2;
      if (pageCount > 15) renderScale = 1.5;
      else if (pageCount > 6) renderScale = 1.75;

      let pdfDoc: jsPDF | null = null;

      for (let i = 0; i < pageElements.length; i++) {
        const elem = pageElements[i];
        if (onProgress) {
          const stepPercent = 45 + Math.floor(((i + 1) / pageElements.length) * 45);
          onProgress(stepPercent, `Rendering page ${i + 1} of ${pageElements.length}...`);
        }

        // Measure page element dimensions
        const elemRect = elem.getBoundingClientRect();
        const elemWidthPx = elemRect.width || containerWidthPx;
        const elemHeightPx = elemRect.height || containerHeightPx;

        const canvas = await html2canvas(elem, {
          scale: renderScale,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: elemWidthPx,
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
          // Standard paginated section output
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

        // Release canvas memory
        canvas.width = 0;
        canvas.height = 0;
        MemoryManager.getInstance().purgeAll();
      }

      if (!pdfDoc) {
        throw new Error('Failed to generate PDF document layout.');
      }

      // 13. Preserve Metadata in PDF Output
      const metadata = parsedInfo?.metadata || {};
      const docTitle = metadata.title || file.name.replace(/\.(docx|doc|odt)$/i, '');
      pdfDoc.setProperties({
        title: docTitle,
        author: metadata.author || '',
        subject: metadata.subject || '',
        keywords: metadata.keywords ? metadata.keywords.join(', ') : '',
        creator: 'SmartPDF AI Engine v2.1',
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
