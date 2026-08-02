import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  ImageRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  AlignmentType,
} from 'docx';

export type PDFToWordEngineMode = 'client' | 'server' | 'auto';

export interface PDFToWordOptions {
  engine?: PDFToWordEngineMode;
  serverEndpoint?: string;
  enableOCR?: boolean;
  onProgress?: (percent: number, statusMsg?: string) => void;
}

export interface PDFQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  statusMsg?: string;
  docxBlob?: Blob;
  error?: string;
  conversionTimeMs?: number;
  pageCount?: number;
}

export class PDFToWordService {
  /**
   * Main entry point to convert PDF to DOCX
   */
  static async convertToWord(
    file: File,
    options: PDFToWordOptions = {}
  ): Promise<Blob> {
    const engine = options.engine || 'client';
    const serverEndpoint = options.serverEndpoint || '/api/convert/pdf-to-word';

    if (engine === 'server') {
      return this.convertOnServer(file, serverEndpoint, options.onProgress);
    }

    if (engine === 'auto') {
      try {
        return await this.convertOnServer(file, serverEndpoint, options.onProgress);
      } catch (err) {
        console.warn(
          'Server-side PDF to Word service unavailable. Falling back to client-side engine:',
          err
        );
        return this.convertOnClient(file, options);
      }
    }

    return this.convertOnClient(file, options);
  }

  /**
   * Client-side high-fidelity PDF to DOCX conversion
   */
  private static async convertOnClient(
    file: File,
    options: PDFToWordOptions = {}
  ): Promise<Blob> {
    const { onProgress, enableOCR = true } = options;
    if (onProgress) onProgress(10, 'Loading PDF document...');

    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    if (onProgress) onProgress(20, `Parsing ${pageCount} PDF page(s), fonts & layout...`);

    const sections: any[] = [];

    // Header & Footer definition
    const header = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${file.name.replace(/\.pdf$/i, '')} • Converted with SmartPDF`,
              size: 16,
              color: '888888',
              italics: true,
            }),
          ],
        }),
      ],
    });

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Page ',
              size: 18,
              color: '666666',
            }),
            new TextRun({
              text: '— Converted Document',
              size: 18,
              color: '888888',
              italics: true,
            }),
          ],
        }),
      ],
    });

    const sectionChildren: any[] = [
      new Paragraph({
        text: file.name.replace(/\.pdf$/i, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
    ];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (onProgress) {
        const percent = 20 + Math.floor((pageNum / pageCount) * 60);
        onProgress(
          percent,
          `Processing page ${pageNum} of ${pageCount} (extracting text, tables, images & links)...`
        );
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      // Page header break for page 2+
      if (pageNum > 1) {
        sectionChildren.push(
          new Paragraph({
            text: `Page ${pageNum}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 120 },
          })
        );
      }

      // Extract annotations (hyperlinks)
      const linksMap = new Map<string, string>();
      try {
        const annotations = await page.getAnnotations();
        for (const ann of annotations) {
          if (ann.subtype === 'Link' && ann.url) {
            linksMap.set(ann.url, ann.url);
          }
        }
      } catch {
        // Ignore annotation parsing error
      }

      // Extract text items with structural properties
      const textContent = await page.getTextContent();
      const rawItems = textContent.items || [];

      interface StructuredItem {
        str: string;
        x: number;
        y: number;
        fontSize: number;
        fontName: string;
        isBold: boolean;
        isItalic: boolean;
      }

      const structuredItems: StructuredItem[] = [];

      for (const item of rawItems) {
        if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
          const transform = item.transform || [1, 0, 0, 1, 0, 0];
          const fontSize = Math.abs(transform[0] || transform[3] || item.height || 12);
          const fontName = item.fontName || '';
          const isBold = fontName.toLowerCase().includes('bold') || fontSize > 16;
          const isItalic = fontName.toLowerCase().includes('italic') || fontName.toLowerCase().includes('oblique');

          structuredItems.push({
            str: item.str,
            x: transform[4] || 0,
            y: transform[5] || 0,
            fontSize,
            fontName,
            isBold,
            isItalic,
          });
        }
      }

      // If no text items found and OCR enabled, run Tesseract OCR on page image
      if (structuredItems.length === 0 && enableOCR) {
        if (onProgress) {
          onProgress(
            20 + Math.floor((pageNum / pageCount) * 60),
            `Running OCR on scanned page ${pageNum}...`
          );
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            const { data } = await worker.recognize(canvas.toDataURL('image/png'));
            await worker.terminate();

            if (data && data.text) {
              const ocrLines = data.text.split('\n').filter((l) => l.trim().length > 0);
              for (const lineText of ocrLines) {
                sectionChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: lineText,
                        size: 24, // 12pt
                      }),
                    ],
                    spacing: { after: 120 },
                  })
                );
              }
            }
          }
        } catch (ocrErr) {
          console.warn(`OCR fallback failed for page ${pageNum}:`, ocrErr);
        }
      } else {
        // Group text items by line (Y coordinate rounded)
        const linesMap = new Map<number, StructuredItem[]>();
        for (const item of structuredItems) {
          const lineKey = Math.round(item.y / 5) * 5;
          if (!linesMap.has(lineKey)) {
            linesMap.set(lineKey, []);
          }
          linesMap.get(lineKey)!.push(item);
        }

        const sortedLineKeys = Array.from(linesMap.keys()).sort((a, b) => b - a);

        for (const lineKey of sortedLineKeys) {
          const lineItems = linesMap.get(lineKey)!;
          lineItems.sort((a, b) => a.x - b.x);

          // Check if line looks like a table row (multiple spaced items across columns)
          const isTableLike = lineItems.length >= 3 && lineItems.some((it, idx) => {
            if (idx === 0) return false;
            return (it.x - (lineItems[idx - 1].x + lineItems[idx - 1].str.length * 6)) > 40;
          });

          if (isTableLike) {
            const cells = lineItems.map(
              (item) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.str,
                          bold: item.isBold,
                          italics: item.isItalic,
                          size: Math.round(item.fontSize * 1.8),
                        }),
                      ],
                    }),
                  ],
                  width: { size: Math.floor(100 / lineItems.length), type: WidthType.PERCENTAGE },
                })
            );

            const table = new Table({
              rows: [new TableRow({ children: cells })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            });

            sectionChildren.push(table);
          } else {
            const textRuns: any[] = [];

            for (const item of lineItems) {
              // Check if URL
              if (item.str.startsWith('http://') || item.str.startsWith('https://')) {
                textRuns.push(
                  new ExternalHyperlink({
                    children: [
                      new TextRun({
                        text: item.str + ' ',
                        style: 'Hyperlink',
                        color: '0563C1',
                        underline: {},
                        size: Math.round(item.fontSize * 1.8),
                      }),
                    ],
                    link: item.str,
                  })
                );
              } else {
                textRuns.push(
                  new TextRun({
                    text: item.str + ' ',
                    bold: item.isBold,
                    italics: item.isItalic,
                    size: Math.max(16, Math.round(item.fontSize * 1.8)),
                  })
                );
              }
            }

            const maxFontSize = Math.max(...lineItems.map((i) => i.fontSize));
            let heading: any = undefined;
            if (maxFontSize >= 22) heading = HeadingLevel.HEADING_1;
            else if (maxFontSize >= 18) heading = HeadingLevel.HEADING_2;
            else if (maxFontSize >= 15) heading = HeadingLevel.HEADING_3;

            sectionChildren.push(
              new Paragraph({
                children: textRuns,
                heading,
                spacing: { after: 100 },
              })
            );
          }
        }
      }

      // Capture embedded images or page snapshot as ImageRun if page contains graphics
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(800, viewport.width);
        canvas.height = Math.min(1000, viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const imageBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((blob) => resolve(blob), 'image/png')
          );

          if (imageBlob) {
            const imageBuffer = await imageBlob.arrayBuffer();
            const imgRun = new ImageRun({
              data: new Uint8Array(imageBuffer),
              type: 'png',
              transformation: {
                width: 500,
                height: Math.round(500 * (viewport.height / viewport.width)),
              },
            });

            sectionChildren.push(
              new Paragraph({
                children: [imgRun],
                spacing: { before: 120, after: 120 },
              })
            );
          }
        }
      } catch (imgErr) {
        console.warn(`Could not render image section for page ${pageNum}:`, imgErr);
      }
    }

    if (onProgress) onProgress(85, 'Packing DOCX document structure & styles...');

    const doc = new Document({
      sections: [
        {
          headers: { default: header },
          footers: { default: footer },
          children: sectionChildren,
        },
      ],
    });

    const docxBlob = await Packer.toBlob(doc);
    if (onProgress) onProgress(100, 'PDF to Word conversion complete!');

    return docxBlob;
  }

  /**
   * Server Endpoint Call
   */
  private static async convertOnServer(
    file: File,
    serverEndpoint: string,
    onProgress?: (percent: number, statusMsg?: string) => void
  ): Promise<Blob> {
    if (onProgress) onProgress(20, 'Sending PDF to server conversion API...');

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

    if (onProgress) onProgress(80, 'Receiving DOCX file from server...');
    return await response.blob();
  }
}
