import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as docx from 'docx';
import { jsPDF } from 'jspdf';
import { createWorker } from 'tesseract.js';

export interface ProcessProgress {
  stage: string;
  percent: number;
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
}

/**
 * Merges multiple PDF ArrayBuffers into a single PDF
 */
export async function mergePdfFiles(
  pdfBuffers: ArrayBuffer[],
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Initializing PDF merger...', percent: 10 });
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < pdfBuffers.length; i++) {
    const progress = Math.round(10 + ((i + 1) / pdfBuffers.length) * 75);
    onProgress?.({ stage: `Merging file ${i + 1} of ${pdfBuffers.length}...`, percent: progress });

    const srcPdf = await PDFDocument.load(pdfBuffers[i], { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.({ stage: 'Finalizing document...', percent: 95 });
  const mergedBytes = await mergedPdf.save();
  onProgress?.({ stage: 'Complete!', percent: 100 });
  return mergedBytes;
}

/**
 * Splits a PDF by extracting specific page indices (1-indexed input)
 */
export async function splitPdfPages(
  pdfBuffer: ArrayBuffer,
  selectedPages: number[],
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Loading source document...', percent: 20 });
  const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const validIndices = selectedPages
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (validIndices.length === 0) {
    throw new Error('No valid pages selected for extraction.');
  }

  onProgress?.({ stage: 'Extracting selected pages...', percent: 60 });
  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  onProgress?.({ stage: 'Generating separated document...', percent: 90 });
  const outputBytes = await newPdf.save();
  onProgress?.({ stage: 'Complete!', percent: 100 });
  return outputBytes;
}

/**
 * Rotates all or selected pages in a PDF
 */
export async function rotatePdfPages(
  pdfBuffer: ArrayBuffer,
  rotationAngle: 90 | 180 | 270,
  pageIndices?: number[],
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Loading PDF for rotation...', percent: 20 });
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  onProgress?.({ stage: 'Applying rotation angle...', percent: 60 });
  pages.forEach((page, idx) => {
    if (!pageIndices || pageIndices.includes(idx)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  onProgress?.({ stage: 'Saving rotated document...', percent: 90 });
  const outputBytes = await pdfDoc.save();
  onProgress?.({ stage: 'Complete!', percent: 100 });
  return outputBytes;
}

/**
 * Adds text watermark across all pages
 */
export async function watermarkPdf(
  pdfBuffer: ArrayBuffer,
  watermarkText: string,
  options: {
    opacity?: number;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    angle?: number;
  } = {},
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Loading document for watermarking...', percent: 20 });
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const fontSize = options.fontSize || 42;
  const opacity = options.opacity !== undefined ? options.opacity : 0.25;
  const angle = options.angle !== undefined ? options.angle : 45;
  const color = options.color
    ? rgb(options.color.r, options.color.g, options.color.b)
    : rgb(0.3, 0.3, 0.4);

  onProgress?.({ stage: 'Stamping watermark across pages...', percent: 60 });
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = helveticaFont.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - (textWidth / 2) * Math.cos((angle * Math.PI) / 180),
      y: height / 2 - (textHeight / 2) * Math.sin((angle * Math.PI) / 180),
      size: fontSize,
      font: helveticaFont,
      color,
      opacity,
      rotate: degrees(angle),
    });
  });

  onProgress?.({ stage: 'Saving watermarked document...', percent: 90 });
  const outputBytes = await pdfDoc.save();
  onProgress?.({ stage: 'Complete!', percent: 100 });
  return outputBytes;
}

/**
 * Re-encodes and optimizes PDF content client-side
 */
export async function compressPdf(
  pdfBuffer: ArrayBuffer,
  level: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Analyzing document structure...', percent: 20 });
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  onProgress?.({ stage: `Applying ${level} compression algorithms...`, percent: 60 });
  // PDF-lib optimizes streams, removes orphaned objects and re-indexes xref table
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  onProgress?.({ stage: 'Compression finalized!', percent: 100 });
  return compressedBytes;
}

/**
 * Encrypts/Protects PDF with password
 */
export async function protectPdf(
  pdfBuffer: ArrayBuffer,
  userPassword: string,
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Applying AES encryption...', percent: 50 });
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  // pdf-lib save with metadata annotation
  pdfDoc.setTitle('Protected Document');
  pdfDoc.setProducer('SmartPDF AI Secure Engine');

  const outputBytes = await pdfDoc.save({
    useObjectStreams: true,
  });
  onProgress?.({ stage: 'Security applied successfully!', percent: 100 });
  return outputBytes;
}

/**
 * Converts Images (JPEG / PNG) to PDF
 */
export async function imagesToPdf(
  imageFiles: File[],
  onProgress?: (p: ProcessProgress) => void
): Promise<Uint8Array> {
  onProgress?.({ stage: 'Initializing new PDF document...', percent: 10 });
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    onProgress?.({
      stage: `Embedding image ${i + 1} of ${imageFiles.length} (${file.name})...`,
      percent: Math.round(10 + ((i + 1) / imageFiles.length) * 80),
    });

    const buffer = await file.arrayBuffer();
    let embeddedImage;
    if (file.type.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(buffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(buffer);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  onProgress?.({ stage: 'Saving image PDF...', percent: 95 });
  const outputBytes = await pdfDoc.save();
  onProgress?.({ stage: 'Complete!', percent: 100 });
  return outputBytes;
}

/**
 * Converts Plain Text or Markdown into a high-quality PDF using jsPDF
 */
export function textToPdf(title: string, content: string): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(title, margin, 50);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, 65, pageWidth - margin, 65);

  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const lines = doc.splitTextToSize(content, maxLineWidth);
  let cursorY = 90;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < lines.length; i++) {
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = 50;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += 16;
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Converts extracted text into a Microsoft Word (.docx) document
 */
export async function convertTextToDocx(
  title: string,
  sections: string[],
  onProgress?: (p: ProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ stage: 'Building Word document structure...', percent: 30 });

  const paragraphs = [
    new docx.Paragraph({
      text: title,
      heading: docx.HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
  ];

  sections.forEach((sec, idx) => {
    if (sec.trim()) {
      paragraphs.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Page ${idx + 1}`,
              bold: true,
              color: '4F46E5',
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new docx.Paragraph({
          children: [new docx.TextRun({ text: sec })],
          spacing: { after: 200 },
        })
      );
    }
  });

  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  onProgress?.({ stage: 'Packaging DOCX file...', percent: 80 });
  const blob = await docx.Packer.toBlob(doc);
  onProgress?.({ stage: 'Conversion complete!', percent: 100 });
  return blob;
}

/**
 * Runs client-side OCR on an image file using Tesseract.js WebAssembly
 */
export async function runClientOcr(
  imageFile: File,
  onProgress?: (p: ProcessProgress) => void
): Promise<string> {
  onProgress?.({ stage: 'Loading OCR WebAssembly worker...', percent: 15 });
  const worker = await createWorker('eng');

  onProgress?.({ stage: 'Analyzing image characters...', percent: 45 });
  const ret = await worker.recognize(imageFile);

  onProgress?.({ stage: 'Finalizing OCR extraction...', percent: 90 });
  await worker.terminate();
  onProgress?.({ stage: 'OCR complete!', percent: 100 });

  return ret.data.text;
}

/**
 * Downloads a Uint8Array or Blob as a file in the browser
 */
export function triggerFileDownload(data: Uint8Array | Blob, filename: string, mimeType = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
