import { ConversionManager, ConversionHandlerOptions } from '../core/ConversionManager';
import * as XLSX from 'xlsx';

export interface ExcelConversionOptions extends ConversionHandlerOptions {
  onProgress?: (percent: number, statusMsg?: string) => void;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export class ExcelConverterService {
  /**
   * Convert Excel (.xlsx, .xls, .csv) to PDF using ConversionManager
   */
  static async excelToPDF(
    file: File,
    options: ExcelConversionOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker, logger) => {
        tracker.update('loading', 15, 'Reading spreadsheet data structure...');

        const arrayBuffer = await inputFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

        tracker.update('analyzing', 35, 'Parsing worksheets and cell grids...');

        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const sheetNames = workbook.SheetNames || ['Sheet1'];
        const totalSheets = sheetNames.length;

        for (let sIdx = 0; sIdx < totalSheets; sIdx++) {
          const sheetName = sheetNames[sIdx];
          const worksheet = workbook.Sheets[sheetName];

          const progressPct = Math.round(35 + ((sIdx + 1) / totalSheets) * 50);
          tracker.update(
            'processing',
            progressPct,
            `Formatting sheet "${sheetName}" (${sIdx + 1}/${totalSheets})...`
          );

          // Convert sheet to 2D array
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (!rawData || rawData.length === 0) continue;

          let page = pdfDoc.addPage([595.28, 841.89]); // A4
          const { width, height } = page.getSize();
          let y = height - 40;

          // Sheet Title Header
          page.drawText(`Sheet: ${sheetName} — ${inputFile.name}`, {
            x: 40,
            y,
            size: 13,
            font: boldFont,
            color: rgb(0.1, 0.1, 0.1),
          });
          y -= 25;

          const rowLimit = Math.min(rawData.length, 250);
          for (let r = 0; r < rowLimit; r++) {
            if (y < 40) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = height - 40;
            }

            const row = rawData[r] || [];
            const rowText = row
              .map((cell) => (cell !== undefined && cell !== null ? String(cell).trim() : ''))
              .filter((val) => val.length > 0)
              .slice(0, 8)
              .join('   |   ');

            if (rowText.length > 0) {
              page.drawText(rowText.substring(0, 95), {
                x: 40,
                y,
                size: 8.5,
                font: r === 0 ? boldFont : font,
                color: r === 0 ? rgb(0.8, 0.1, 0.1) : rgb(0.2, 0.2, 0.2),
              });
              y -= 16;
            }
          }
        }

        tracker.update('rendering', 88, 'Rendering PDF pages and object streams...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      options
    );
  }

  /**
   * Convert PDF document to Excel (.xlsx) workbook using ConversionManager
   */
  static async pdfToExcel(
    file: File,
    options: ExcelConversionOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'xlsx',
      async (inputFile, tracker, logger) => {
        tracker.update('loading', 15, 'Loading PDF document renderer...');

        const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
        ensurePdfWorkerConfigured();

        const arrayBuffer = await inputFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        const workbook = XLSX.utils.book_new();

        for (let pNum = 1; pNum <= totalPages; pNum++) {
          const progressPct = Math.round(20 + (pNum / totalPages) * 60);
          tracker.update(
            'processing',
            progressPct,
            `Extracting table rows from PDF page ${pNum} of ${totalPages}...`
          );

          const page = await pdfDoc.getPage(pNum);
          const textContent = await page.getTextContent();
          const items = textContent.items || [];

          // Group items by Y position into rows
          const rowsMap = new Map<number, { x: number; text: string }[]>();

          for (const item of items) {
            if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
              const transform = item.transform || [1, 0, 0, 1, 0, 0];
              const x = transform[4] || 0;
              const y = transform[5] || 0;
              const roundedY = Math.round(y / 5) * 5;

              if (!rowsMap.has(roundedY)) {
                rowsMap.set(roundedY, []);
              }
              rowsMap.get(roundedY)!.push({ x, text: item.str });
            }
          }

          // Sort rows top-to-bottom (PDF Y=0 is bottom)
          const sortedYKeys = Array.from(rowsMap.keys()).sort((a, b) => b - a);
          const pageData: string[][] = [];

          for (const yKey of sortedYKeys) {
            const lineItems = rowsMap.get(yKey)!;
            lineItems.sort((a, b) => a.x - b.x);
            const rowValues = lineItems.map((i) => i.text.trim()).filter(Boolean);
            if (rowValues.length > 0) {
              pageData.push(rowValues);
            }
          }

          const worksheet = XLSX.utils.aoa_to_sheet(
            pageData.length > 0 ? pageData : [['Page Content', `Page ${pNum}`], ['No text detected.']]
          );
          XLSX.utils.book_append_sheet(workbook, worksheet, `Page_${pNum}`);
        }

        tracker.update('assembling', 90, 'Generating XLSX binary spreadsheet output...');
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      },
      options
    );
  }
}
