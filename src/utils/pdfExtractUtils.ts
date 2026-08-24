import { pdfjsLib, ensurePdfWorkerConfigured } from './pdfWorker';

export async function extractTextFromPdfFile(file: File, maxPages = 30): Promise<string> {
  ensurePdfWorkerConfigured();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;

  const totalPages = Math.min(pdfDoc.numPages, maxPages);
  let extractedText = '';

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    extractedText += `\n--- [Page ${i}] ---\n` + pageText;
  }

  return extractedText.trim();
}
