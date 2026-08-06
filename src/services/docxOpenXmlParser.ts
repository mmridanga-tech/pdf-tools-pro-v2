import JSZip from 'jszip';

export interface SectionConfig {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Auto';
  widthPt: number;
  heightPt: number;
  orientation: 'portrait' | 'landscape';
  marginsPt: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface HeaderFooterInfo {
  headerText?: string;
  footerText?: string;
  hasPageNumbers?: boolean;
}

export interface FloatingImageSpec {
  id?: string;
  wrapMode?: 'square' | 'tight' | 'behind' | 'infront' | 'topAndBottom' | 'inline';
  alignH?: 'left' | 'center' | 'right';
  alignV?: 'top' | 'center' | 'bottom';
  widthPx?: number;
  heightPx?: number;
}

export interface DocxXmlInfo {
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
  sectionConfig: SectionConfig;
  sections: SectionConfig[];
  relationships: Record<string, string>;
  validationInfo: {
    expectedImageCount: number;
    expectedTableCount: number;
    estimatedPageCount: number;
    fontNames: string[];
  };
  headerFooterInfo: HeaderFooterInfo;
  floatingImages: FloatingImageSpec[];
}

export class DocxOpenXmlParser {
  /**
   * Parse OpenXML properties from DOCX ZIP archive
   */
  static async parseDocx(arrayBuffer: ArrayBuffer): Promise<DocxXmlInfo> {
    const defaultSection: SectionConfig = {
      pageSize: 'Letter',
      widthPt: 612,
      heightPt: 792,
      orientation: 'portrait',
      marginsPt: { top: 72, right: 72, bottom: 72, left: 72 },
    };

    const result: DocxXmlInfo = {
      metadata: {},
      sectionConfig: defaultSection,
      sections: [],
      relationships: {},
      validationInfo: {
        expectedImageCount: 0,
        expectedTableCount: 0,
        estimatedPageCount: 1,
        fontNames: [],
      },
      headerFooterInfo: {},
      floatingImages: [],
    };

    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 1. Parse core metadata from docProps/core.xml
      const coreXmlFile = zip.file('docProps/core.xml');
      if (coreXmlFile) {
        const coreXmlText = await coreXmlFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(coreXmlText, 'application/xml');

        const titleNode = xmlDoc.querySelector('title') || xmlDoc.getElementsByTagName('dc:title')[0];
        if (titleNode?.textContent?.trim()) {
          result.metadata.title = titleNode.textContent.trim();
        }

        const creatorNode = xmlDoc.querySelector('creator') || xmlDoc.getElementsByTagName('dc:creator')[0];
        if (creatorNode?.textContent?.trim()) {
          result.metadata.author = creatorNode.textContent.trim();
        }

        const subjectNode = xmlDoc.querySelector('subject') || xmlDoc.getElementsByTagName('dc:subject')[0];
        if (subjectNode?.textContent?.trim()) {
          result.metadata.subject = subjectNode.textContent.trim();
        }

        const keywordsNode =
          xmlDoc.querySelector('keywords') ||
          xmlDoc.getElementsByTagName('cp:keywords')[0] ||
          xmlDoc.getElementsByTagName('dc:description')[0];
        if (keywordsNode?.textContent?.trim()) {
          result.metadata.keywords = keywordsNode.textContent
            .split(/[,;]/)
            .map((k) => k.trim())
            .filter(Boolean);
        }
      }

      // 2. Parse external relationships from word/_rels/document.xml.rels
      const relsFile = zip.file('word/_rels/document.xml.rels');
      if (relsFile) {
        const relsText = await relsFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(relsText, 'application/xml');
        const rels = xmlDoc.getElementsByTagName('Relationship');
        for (let i = 0; i < rels.length; i++) {
          const rel = rels[i];
          const id = rel.getAttribute('Id');
          const target = rel.getAttribute('Target');
          const targetMode = rel.getAttribute('TargetMode');
          if (id && target) {
            result.relationships[id] = target;
          }
        }
      }

      // 3. Count media files as baseline image count
      const mediaFiles = zip.folder('word/media')?.files || {};
      const mediaCount = Object.keys(mediaFiles).filter(
        (f) => !f.endsWith('/') && /\.(png|jpe?g|gif|svg|emf|wmf)$/i.test(f)
      ).length;
      result.validationInfo.expectedImageCount = mediaCount;

      // 4. Parse header / footer XML files
      let headerText = '';
      let footerText = '';
      let hasPageNumbers = false;

      for (const fileName of Object.keys(zip.files)) {
        if (/word\/header\d*\.xml$/i.test(fileName)) {
          const hText = await zip.files[fileName].async('text');
          const pDoc = new DOMParser().parseFromString(hText, 'application/xml');
          const texts = Array.from(pDoc.getElementsByTagName('w:t')).map((t) => t.textContent || '');
          if (texts.join(' ').trim()) {
            headerText += (headerText ? ' | ' : '') + texts.join(' ').trim();
          }
          if (/PAGE|NUMPAGES/i.test(hText)) hasPageNumbers = true;
        }
        if (/word\/footer\d*\.xml$/i.test(fileName)) {
          const fText = await zip.files[fileName].async('text');
          const pDoc = new DOMParser().parseFromString(fText, 'application/xml');
          const texts = Array.from(pDoc.getElementsByTagName('w:t')).map((t) => t.textContent || '');
          if (texts.join(' ').trim()) {
            footerText += (footerText ? ' | ' : '') + texts.join(' ').trim();
          }
          if (/PAGE|NUMPAGES/i.test(fText)) hasPageNumbers = true;
        }
      }

      result.headerFooterInfo = { headerText, footerText, hasPageNumbers };

      // 5. Parse fontTable.xml
      const fontTableFile = zip.file('word/fontTable.xml');
      if (fontTableFile) {
        const fontXmlText = await fontTableFile.async('text');
        const fontDoc = new DOMParser().parseFromString(fontXmlText, 'application/xml');
        const fontNodes = fontDoc.getElementsByTagName('w:font');
        const fontsSet = new Set<string>();
        for (let i = 0; i < fontNodes.length; i++) {
          const name = fontNodes[i].getAttribute('w:name');
          if (name) fontsSet.add(name);
        }
        result.validationInfo.fontNames = Array.from(fontsSet);
      }

      // 6. Parse section properties, floating images, table count, and page break estimate from word/document.xml
      const docXmlFile = zip.file('word/document.xml');
      if (docXmlFile) {
        const docXmlText = await docXmlFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');

        // Table count in XML
        const tblNodes = xmlDoc.getElementsByTagName('w:tbl');
        result.validationInfo.expectedTableCount = tblNodes.length;

        // Count drawing elements if mediaCount was 0
        const drawingNodes = xmlDoc.getElementsByTagName('w:drawing');
        const pictNodes = xmlDoc.getElementsByTagName('w:pict');
        const shapeNodes = xmlDoc.getElementsByTagName('v:shape');
        const totalDrawingCount = drawingNodes.length + pictNodes.length + shapeNodes.length;
        if (result.validationInfo.expectedImageCount === 0 && totalDrawingCount > 0) {
          result.validationInfo.expectedImageCount = totalDrawingCount;
        }

        // Parse floating image anchors
        const anchors = xmlDoc.getElementsByTagName('wp:anchor');
        for (let i = 0; i < anchors.length; i++) {
          const anchor = anchors[i];
          let wrapMode: FloatingImageSpec['wrapMode'] = 'inline';
          if (anchor.getElementsByTagName('wp:wrapSquare').length > 0) wrapMode = 'square';
          else if (anchor.getElementsByTagName('wp:wrapTight').length > 0) wrapMode = 'tight';
          else if (anchor.getElementsByTagName('wp:wrapNone').length > 0) wrapMode = 'behind';
          else if (anchor.getElementsByTagName('wp:wrapTopAndBottom').length > 0) wrapMode = 'topAndBottom';

          let alignH: FloatingImageSpec['alignH'] = 'left';
          const alignHNode = anchor.getElementsByTagName('wp:align')[0];
          if (alignHNode?.textContent) {
            const val = alignHNode.textContent.toLowerCase();
            if (val === 'center') alignH = 'center';
            if (val === 'right') alignH = 'right';
          }

          let widthPx = 200;
          let heightPx = 200;
          const extent = anchor.getElementsByTagName('wp:extent')[0];
          if (extent) {
            const cx = parseInt(extent.getAttribute('cx') || '0', 10);
            const cy = parseInt(extent.getAttribute('cy') || '0', 10);
            if (cx > 0) widthPx = Math.round(cx / 9525); // EMU to px at 96 DPI
            if (cy > 0) heightPx = Math.round(cy / 9525);
          }

          result.floatingImages.push({ wrapMode, alignH, widthPx, heightPx });
        }

        // Estimate page count based on explicit breaks and paragraph/table count
        const pageBreakNodes = xmlDoc.querySelectorAll('w\\:br[w\\:type="page"], br[type="page"]');
        const sectPrNodes = xmlDoc.getElementsByTagName('w:sectPr');
        const pNodes = xmlDoc.getElementsByTagName('w:p');

        const explicitBreaks = pageBreakNodes.length + (sectPrNodes.length > 0 ? sectPrNodes.length - 1 : 0);
        const estimatedFromContent = Math.max(1, Math.ceil((pNodes.length + tblNodes.length * 5) / 25));
        result.validationInfo.estimatedPageCount = Math.max(1, explicitBreaks + 1, estimatedFromContent);

        // Extract all section configurations
        const parsedSections: SectionConfig[] = [];
        for (let i = 0; i < sectPrNodes.length; i++) {
          const sectPr = sectPrNodes[i];
          const secConf: SectionConfig = { ...defaultSection, marginsPt: { ...defaultSection.marginsPt } };

          const pgSz = sectPr.getElementsByTagName('w:pgSz')[0];
          if (pgSz) {
            const wDxa = parseInt(pgSz.getAttribute('w:w') || '12240', 10);
            const hDxa = parseInt(pgSz.getAttribute('w:h') || '15840', 10);
            const orient = pgSz.getAttribute('w:orient') || '';

            const wPt = Math.round((wDxa / 20) * 10) / 10;
            const hPt = Math.round((hDxa / 20) * 10) / 10;

            const isLandscape = orient === 'landscape' || wPt > hPt;
            secConf.orientation = isLandscape ? 'landscape' : 'portrait';

            const minDim = Math.min(wPt, hPt);
            const maxDim = Math.max(wPt, hPt);

            if (Math.abs(minDim - 595.3) < 20 && Math.abs(maxDim - 841.9) < 20) {
              secConf.pageSize = 'A4';
            } else if (Math.abs(minDim - 612) < 20 && Math.abs(maxDim - 792) < 20) {
              secConf.pageSize = 'Letter';
            } else if (Math.abs(minDim - 612) < 20 && Math.abs(maxDim - 1008) < 20) {
              secConf.pageSize = 'Legal';
            } else {
              secConf.pageSize = 'Auto';
            }

            secConf.widthPt = isLandscape ? maxDim : minDim;
            secConf.heightPt = isLandscape ? minDim : maxDim;
          }

          const pgMar = sectPr.getElementsByTagName('w:pgMar')[0];
          if (pgMar) {
            const topDxa = parseInt(pgMar.getAttribute('w:top') || '1440', 10);
            const rightDxa = parseInt(pgMar.getAttribute('w:right') || '1440', 10);
            const bottomDxa = parseInt(pgMar.getAttribute('w:bottom') || '1440', 10);
            const leftDxa = parseInt(pgMar.getAttribute('w:left') || '1440', 10);

            secConf.marginsPt = {
              top: Math.round((topDxa / 20) * 10) / 10,
              right: Math.round((rightDxa / 20) * 10) / 10,
              bottom: Math.round((bottomDxa / 20) * 10) / 10,
              left: Math.round((leftDxa / 20) * 10) / 10,
            };
          }

          parsedSections.push(secConf);
        }

        if (parsedSections.length > 0) {
          result.sections = parsedSections;
          result.sectionConfig = parsedSections[parsedSections.length - 1];
        } else {
          result.sections = [defaultSection];
        }
      }
    } catch (err) {
      console.warn('DocxOpenXmlParser notice: could not parse raw OpenXML structure:', err);
    }

    return result;
  }
}
