import {
  OCROptions,
  OCRPageResult,
  OCRResultData,
  OCRLine,
  OCRWord,
  ProcessedResult,
} from '../types/pdfTypes';
import { ConversionManager } from '../core/ConversionManager';

export class OCRService {
  /**
   * Main entry point to perform OCR Pro on a PDF or Image file.
   */
  static async processOCR(
    file: File,
    options: OCROptions,
    onProgress?: (percent: number, statusMessage?: string, activePage?: number, totalPages?: number) => void
  ): Promise<ProcessedResult> {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const targetFormat = options.outputFormat || (isPDF ? 'pdf' : 'txt');
    const conversionManager = ConversionManager.getInstance();

    let resultContainer: ProcessedResult | null = null;

    await conversionManager.executeConversion(
      file,
      targetFormat,
      async (inputFile, tracker) => {
        const progressBridge = (
          percent: number,
          statusMessage?: string,
          activePage?: number,
          totalPages?: number
        ) => {
          if (onProgress) onProgress(percent, statusMessage, activePage, totalPages);
          tracker.update('processing', percent, statusMessage || 'Performing OCR...');
        };

        if (isPDF) {
          resultContainer = await this.processPDFFile(inputFile, options, progressBridge);
        } else {
          resultContainer = await this.processImageFile(inputFile, options, progressBridge);
        }

        return resultContainer.blob;
      },
      { onProgress }
    );

    if (!resultContainer) {
      throw new Error('OCR process did not return a valid result.');
    }

    return resultContainer;
  }

  /**
   * Process a PDF document page by page.
   */
  private static async processPDFFile(
    file: File,
    options: OCROptions,
    onProgress?: (percent: number, statusMessage?: string, activePage?: number, totalPages?: number) => void
  ): Promise<ProcessedResult> {
    const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
    const { createWorker } = await import('tesseract.js');

    ensurePdfWorkerConfigured();

    const arrayBuffer = await file.arrayBuffer();

    if (onProgress) onProgress(5, 'Loading PDF document...', 0, 0);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    const langLabel = this.getLanguageLabel(options.language);
    if (onProgress) onProgress(10, `Initializing OCR engine for ${langLabel}...`, 0, totalPages);

    const worker = await createWorker(options.language || 'eng');

    const pageResults: OCRPageResult[] = [];
    let totalConfidenceSum = 0;
    let totalTablesCount = 0;

    for (let i = 1; i <= totalPages; i++) {
      const pageStartPercent = 10 + Math.round(((i - 1) / totalPages) * 75);
      if (onProgress) {
        onProgress(
          pageStartPercent,
          `Rendering page ${i} of ${totalPages}...`,
          i,
          totalPages
        );
      }

      // Yield execution to event loop to keep UI smooth and snappy
      await new Promise((resolve) => setTimeout(resolve, 10));

      const page = await pdfDoc.getPage(i);
      const scale = options.enhanceResolution ? 2.5 : 2.0;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        await page.render({ canvasContext: context, viewport, canvas }).promise;
      }

      if (onProgress) {
        onProgress(
          pageStartPercent + Math.round(75 / totalPages / 2),
          `Analyzing text and layout on page ${i} of ${totalPages}...`,
          i,
          totalPages
        );
      }

      const canvasDataUrl = canvas.toDataURL('image/png');
      const { data } = await worker.recognize(canvasDataUrl);

      const pageConfidence = Math.max(0, Math.min(100, Math.round(data.confidence || 85)));
      totalConfidenceSum += pageConfidence;

      // Extract structured lines & words
      const lines: OCRLine[] = ((data as any).lines || []).map((l: any) => ({
        text: l.text || '',
        confidence: Math.round(l.confidence || pageConfidence),
        bbox: l.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
        words: (l.words || []).map((w: any) => ({
          text: w.text || '',
          confidence: Math.round(w.confidence || pageConfidence),
          bbox: w.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
        })),
      }));

      // Extract structured paragraphs
      const paragraphs: string[] = ((data as any).paragraphs || [])
        .map((p: any) => p.text?.trim())
        .filter((t: string | undefined) => t && t.length > 0);

      if (paragraphs.length === 0 && data.text) {
        paragraphs.push(...data.text.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean));
      }

      // Detect tables if option enabled
      const detectedTables = options.detectTables !== false ? this.detectTablesFromLines(lines) : [];
      totalTablesCount += detectedTables.length;

      pageResults.push({
        pageNumber: i,
        text: data.text || '',
        confidence: pageConfidence,
        lines,
        paragraphs,
        tables: detectedTables,
        canvasDataUrl,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
      });
    }

    await worker.terminate();

    if (onProgress) onProgress(88, 'Generating final document outputs...', totalPages, totalPages);

    const overallConfidence = totalPages > 0 ? Math.round(totalConfidenceSum / totalPages) : 0;
    const combinedText = pageResults
      .map((p) => `=== Page ${p.pageNumber} (OCR Confidence: ${p.confidence}%) ===\n\n${p.text.trim()}`)
      .join('\n\n\n');

    const ocrData: OCRResultData = {
      combinedText,
      overallConfidence,
      pageResults,
      detectedLanguages: [options.language],
      tablesCount: totalTablesCount,
    };

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let resultBlob: Blob;
    let fileName: string;

    if (options.outputFormat === 'txt') {
      resultBlob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
      fileName = `${baseName}_ocr.txt`;
    } else if (options.outputFormat === 'docx') {
      resultBlob = await this.createOcrDocx(pageResults, baseName);
      fileName = `${baseName}_ocr.docx`;
    } else {
      // Searchable PDF
      resultBlob = await this.createSearchablePDF(pageResults, baseName);
      fileName = `${baseName}_ocr_searchable.pdf`;
    }

    if (onProgress) onProgress(100, 'OCR Pro processing completed successfully!', totalPages, totalPages);

    return {
      blob: resultBlob,
      fileName,
      originalSize: file.size,
      newSize: resultBlob.size,
      extractedText: combinedText,
      ocrData,
    };
  }

  /**
   * Process a single scanned image file (PNG, JPG, WEBP, etc.).
   */
  private static async processImageFile(
    file: File,
    options: OCROptions,
    onProgress?: (percent: number, statusMessage?: string, activePage?: number, totalPages?: number) => void
  ): Promise<ProcessedResult> {
    const { createWorker } = await import('tesseract.js');

    if (onProgress) onProgress(10, 'Initializing OCR engine for image...', 1, 1);
    const worker = await createWorker(options.language || 'eng');

    if (onProgress) onProgress(30, 'Scanning image text and bounding layout...', 1, 1);
    const imageUrl = URL.createObjectURL(file);
    const { data } = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);

    await worker.terminate();

    const pageConfidence = Math.max(0, Math.min(100, Math.round(data.confidence || 85)));

    const lines: OCRLine[] = ((data as any).lines || []).map((l: any) => ({
      text: l.text || '',
      confidence: Math.round(l.confidence || pageConfidence),
      bbox: l.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
      words: (l.words || []).map((w: any) => ({
        text: w.text || '',
        confidence: Math.round(w.confidence || pageConfidence),
        bbox: w.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
      })),
    }));

    const paragraphs: string[] = ((data as any).paragraphs || [])
      .map((p: any) => p.text?.trim())
      .filter((t: string | undefined) => t && t.length > 0);

    const detectedTables = options.detectTables !== false ? this.detectTablesFromLines(lines) : [];

    const pageResult: OCRPageResult = {
      pageNumber: 1,
      text: data.text || '',
      confidence: pageConfidence,
      lines,
      paragraphs,
      tables: detectedTables,
      imageWidth: 800,
      imageHeight: 1100,
    };

    const combinedText = pageResult.text.trim();
    const ocrData: OCRResultData = {
      combinedText,
      overallConfidence: pageConfidence,
      pageResults: [pageResult],
      detectedLanguages: [options.language],
      tablesCount: detectedTables.length,
    };

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let resultBlob: Blob;
    let fileName: string;

    if (options.outputFormat === 'txt') {
      resultBlob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
      fileName = `${baseName}_ocr.txt`;
    } else if (options.outputFormat === 'docx') {
      resultBlob = await this.createOcrDocx([pageResult], baseName);
      fileName = `${baseName}_ocr.docx`;
    } else {
      resultBlob = await this.createSearchablePDF([pageResult], baseName);
      fileName = `${baseName}_ocr_searchable.pdf`;
    }

    if (onProgress) onProgress(100, 'OCR Pro completed!', 1, 1);

    return {
      blob: resultBlob,
      fileName,
      originalSize: file.size,
      newSize: resultBlob.size,
      extractedText: combinedText,
      ocrData,
    };
  }

  /**
   * Table detection heuristic based on line text formatting and horizontal alignment.
   */
  public static detectTablesFromLines(lines: OCRLine[]): string[][][] {
    const tables: string[][][] = [];
    let currentTableRows: string[][] = [];

    for (const line of lines) {
      const lineText = line.text.trim();
      if (!lineText) {
        if (currentTableRows.length >= 2) {
          tables.push([...currentTableRows]);
        }
        currentTableRows = [];
        continue;
      }

      let cells: string[] = [];
      if (lineText.includes('|')) {
        cells = lineText.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
      } else if (lineText.includes('\t')) {
        cells = lineText.split('\t').map((c) => c.trim()).filter((c) => c.length > 0);
      } else {
        const splitSpaces = lineText.split(/\s{3,}/).map((c) => c.trim()).filter((c) => c.length > 0);
        if (splitSpaces.length >= 2) {
          cells = splitSpaces;
        }
      }

      if (cells.length >= 2) {
        currentTableRows.push(cells);
      } else {
        if (currentTableRows.length >= 2) {
          tables.push([...currentTableRows]);
        }
        currentTableRows = [];
      }
    }

    if (currentTableRows.length >= 2) {
      tables.push(currentTableRows);
    }

    return tables;
  }

  /**
   * Create a true Searchable PDF with original canvas image overlaid with invisible searchable text.
   */
  private static async createSearchablePDF(
    pageResults: OCRPageResult[],
    baseName: string
  ): Promise<Blob> {
    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < pageResults.length; i++) {
      if (i > 0) doc.addPage();
      const pRes = pageResults[i];

      const imgWidth = pRes.imageWidth || 800;
      const imgHeight = pRes.imageHeight || 1100;
      const imgRatio = imgWidth / imgHeight;

      let renderW = pdfWidth;
      let renderH = pdfWidth / imgRatio;

      if (renderH > pdfHeight) {
        renderH = pdfHeight;
        renderW = pdfHeight * imgRatio;
      }

      const xOffset = (pdfWidth - renderW) / 2;
      const yOffset = (pdfHeight - renderH) / 2;

      // 1. If we have rendered canvas image, draw it as visual background
      if (pRes.canvasDataUrl) {
        doc.addImage(pRes.canvasDataUrl, 'PNG', xOffset, yOffset, renderW, renderH);
      } else {
        // Fallback clean background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pdfWidth, pdfHeight, 'F');
      }

      // 2. Set invisible text opacity for selectable & searchable OCR text
      try {
        if ((jsPDFMod as any).GState) {
          (doc as any).setGState(new (jsPDFMod as any).GState({ opacity: 0.001 }));
        } else {
          doc.setTextColor(255, 255, 255);
        }
      } catch {
        doc.setTextColor(255, 255, 255);
      }

      const scaleX = renderW / imgWidth;
      const scaleY = renderH / imgHeight;

      for (const line of pRes.lines) {
        if (!line.text || !line.bbox) continue;
        const x = xOffset + line.bbox.x0 * scaleX;
        const y = yOffset + line.bbox.y0 * scaleY + (line.bbox.y1 - line.bbox.y0) * scaleY * 0.8;
        const fontSize = Math.max(6, Math.min(24, (line.bbox.y1 - line.bbox.y0) * scaleY * 0.75));

        doc.setFontSize(fontSize);
        doc.text(line.text.trim(), x, y);
      }
    }

    return doc.output('blob');
  }

  /**
   * Create a formatted Microsoft Word (.docx) document with Paragraphs and Tables.
   */
  private static async createOcrDocx(
    pageResults: OCRPageResult[],
    baseName: string
  ): Promise<Blob> {
    const { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, WidthType, Packer, BorderStyle } =
      await import('docx');

    const children: any[] = [
      new Paragraph({
        text: `${baseName} (OCR Pro Recognized Document)`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      }),
    ];

    pageResults.forEach((pRes) => {
      children.push(
        new Paragraph({
          text: `Page ${pRes.pageNumber} (Confidence: ${pRes.confidence}%)`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 150 },
        })
      );

      // Paragraphs
      if (pRes.paragraphs && pRes.paragraphs.length > 0) {
        pRes.paragraphs.forEach((paraText) => {
          if (paraText.trim()) {
            children.push(
              new Paragraph({
                text: paraText.trim(),
                spacing: { after: 120 },
              })
            );
          }
        });
      } else {
        pRes.text.split('\n').forEach((line) => {
          if (line.trim()) {
            children.push(new Paragraph({ text: line.trim(), spacing: { after: 100 } }));
          }
        });
      }

      // Tables
      if (pRes.tables && pRes.tables.length > 0) {
        pRes.tables.forEach((tableData) => {
          if (tableData.length > 0) {
            const rows = tableData.map((rowCells, rIdx) => {
              const tableCells = rowCells.map(
                (cellText) =>
                  new TableCell({
                    children: [new Paragraph({ text: cellText.trim() })],
                    shading: rIdx === 0 ? { fill: 'E5E7EB' } : undefined,
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                      left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                      right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    },
                  })
              );
              return new TableRow({ children: tableCells });
            });

            children.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows,
              })
            );
            children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          }
        });
      }
    });

    const doc = new Document({
      sections: [{ children }],
    });

    return Packer.toBlob(doc);
  }

  private static getLanguageLabel(code: string): string {
    const map: Record<string, string> = {
      eng: 'English',
      ben: 'Bengali (বাংলা)',
      'eng+ben': 'English + Bengali (Bilingual)',
      spa: 'Spanish',
      fra: 'French',
      deu: 'German',
      ita: 'Italian',
      por: 'Portuguese',
      zho: 'Chinese Simplified',
      jpn: 'Japanese',
      hin: 'Hindi',
      ara: 'Arabic',
      rus: 'Russian',
    };
    return map[code] || code;
  }
}
