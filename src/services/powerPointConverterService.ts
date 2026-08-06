import { ConversionManager, ConversionHandlerOptions } from '../core/ConversionManager';
import JSZip from 'jszip';

export interface PowerPointConversionOptions extends ConversionHandlerOptions {
  onProgress?: (percent: number, statusMsg?: string) => void;
  slideWidth?: number;
  slideHeight?: number;
}

export class PowerPointConverterService {
  /**
   * Convert PowerPoint (.pptx) presentation to PDF using ConversionManager
   */
  static async powerPointToPDF(
    file: File,
    options: PowerPointConversionOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pdf',
      async (inputFile, tracker, logger) => {
        tracker.update('loading', 15, 'Unpacking PowerPoint PPTX container...');

        const zip = new JSZip();
        const zipData = await zip.loadAsync(inputFile);

        tracker.update('analyzing', 35, 'Parsing slide structure and vector text elements...');

        // Find slide XML files
        const slideFiles = Object.keys(zipData.files).filter(
          (name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        );

        // Sort slides numerically (slide1.xml, slide2.xml, ...)
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, '') || '0', 10);
          const numB = parseInt(b.replace(/[^0-9]/g, '') || '0', 10);
          return numA - numB;
        });

        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const totalSlides = slideFiles.length > 0 ? slideFiles.length : 1;

        if (slideFiles.length === 0) {
          // Fallback if raw text or not standard PPTX
          const page = pdfDoc.addPage([841.89, 595.28]); // Landscape A4
          page.drawText(`Presentation: ${inputFile.name}`, {
            x: 50,
            y: 500,
            size: 20,
            font: boldFont,
          });
          page.drawText('Converted Slide View', {
            x: 50,
            y: 450,
            size: 14,
            font,
          });
        } else {
          for (let i = 0; i < slideFiles.length; i++) {
            const slidePath = slideFiles[i];
            const progressPct = Math.round(35 + ((i + 1) / totalSlides) * 50);
            tracker.update(
              'processing',
              progressPct,
              `Rendering slide ${i + 1} of ${totalSlides}...`
            );

            const slideXmlStr = await zipData.files[slidePath].async('string');

            // Extract slide text using XML regex
            const textMatches = Array.from(slideXmlStr.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)).map(
              (m) => m[1]
            );

            const page = pdfDoc.addPage([841.89, 595.28]); // Widescreen Landscape
            const { width, height } = page.getSize();

            // Slide Header Banner
            page.drawRectangle({
              x: 0,
              y: height - 60,
              width,
              height: 60,
              color: rgb(0.92, 0.2, 0.2),
            });

            page.drawText(`Slide ${i + 1}`, {
              x: 40,
              y: height - 40,
              size: 18,
              font: boldFont,
              color: rgb(1, 1, 1),
            });

            let y = height - 100;
            const lineLimit = Math.min(textMatches.length, 25);

            for (let tIdx = 0; tIdx < lineLimit; tIdx++) {
              const textLine = textMatches[tIdx].trim();
              if (textLine.length > 0 && y > 40) {
                page.drawText(`•  ${textLine.substring(0, 100)}`, {
                  x: 50,
                  y,
                  size: 11,
                  font,
                  color: rgb(0.15, 0.15, 0.15),
                });
                y -= 22;
              }
            }
          }
        }

        tracker.update('rendering', 90, 'Serializing presentation PDF stream...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        return new Blob([pdfBytes], { type: 'application/pdf' });
      },
      options
    );
  }

  /**
   * Convert PDF document to PowerPoint (.pptx) presentation using ConversionManager
   */
  static async pdfToPowerPoint(
    file: File,
    options: PowerPointConversionOptions = {}
  ): Promise<Blob> {
    const conversionManager = ConversionManager.getInstance();

    return conversionManager.executeConversion(
      file,
      'pptx',
      async (inputFile, tracker, logger) => {
        tracker.update('loading', 15, 'Loading PDF document renderer...');

        const { pdfjsLib, ensurePdfWorkerConfigured } = await import('../utils/pdfWorker');
        ensurePdfWorkerConfigured();

        const arrayBuffer = await inputFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        tracker.update('analyzing', 30, 'Extracting slide text and layout blocks...');

        const zip = new JSZip();

        // Build OpenXML PPTX Structure
        zip.file(
          '[Content_Types].xml',
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${Array.from(
    { length: totalPages },
    (_, i) =>
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  ).join('\n')}
</Types>`
        );

        zip.file(
          '_rels/.rels',
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
        );

        zip.file(
          'ppt/presentation.xml',
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    ${Array.from(
      { length: totalPages },
      (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
    ).join('\n')}
  </p:sldIdLst>
</p:presentation>`
        );

        const slideRels = Array.from(
          { length: totalPages },
          (_, i) =>
            `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
        ).join('\n');

        zip.file(
          'ppt/_rels/presentation.xml.rels',
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRels}
</Relationships>`
        );

        for (let pNum = 1; pNum <= totalPages; pNum++) {
          const progressPct = Math.round(30 + (pNum / totalPages) * 55);
          tracker.update(
            'processing',
            progressPct,
            `Building slide ${pNum} of ${totalPages}...`
          );

          const page = await pdfDoc.getPage(pNum);
          const textContent = await page.getTextContent();
          const items = textContent.items || [];

          const slideLines: string[] = [];
          for (const item of items) {
            if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
              slideLines.push(item.str.trim());
            }
          }

          const slideTextXml = slideLines
            .slice(0, 20)
            .map(
              (line) =>
                `<a:p><a:r><a:t>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a:t></a:r></a:p>`
            )
            .join('\n');

          const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${slideTextXml.length > 0 ? slideTextXml : `<a:p><a:r><a:t>Slide ${pNum}</a:t></a:r></a:p>`}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

          zip.file(`ppt/slides/slide${pNum}.xml`, slideXml);
        }

        tracker.update('assembling', 90, 'Packing OpenXML PPTX presentation output...');
        const pptxBlob = await zip.generateAsync({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });

        return pptxBlob;
      },
      options
    );
  }
}
