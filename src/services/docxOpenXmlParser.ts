import JSZip from 'jszip';

export interface DocxXmlInfo {
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
  sectionConfig: {
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
  };
  relationships: Record<string, string>;
}

export class DocxOpenXmlParser {
  /**
   * Parse OpenXML properties from DOCX ZIP archive
   */
  static async parseDocx(arrayBuffer: ArrayBuffer): Promise<DocxXmlInfo> {
    const result: DocxXmlInfo = {
      metadata: {},
      sectionConfig: {
        pageSize: 'Letter',
        widthPt: 612,
        heightPt: 792,
        orientation: 'portrait',
        marginsPt: { top: 72, right: 72, bottom: 72, left: 72 },
      },
      relationships: {},
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
          if (id && target && (targetMode === 'External' || target.startsWith('http'))) {
            result.relationships[id] = target;
          }
        }
      }

      // 3. Parse section properties from word/document.xml
      const docXmlFile = zip.file('word/document.xml');
      if (docXmlFile) {
        const docXmlText = await docXmlFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');

        const sectPrs = xmlDoc.getElementsByTagName('w:sectPr');
        const sectPr = sectPrs.length > 0 ? sectPrs[sectPrs.length - 1] : null;

        if (sectPr) {
          const pgSz = sectPr.getElementsByTagName('w:pgSz')[0];
          if (pgSz) {
            const wDxa = parseInt(pgSz.getAttribute('w:w') || '12240', 10);
            const hDxa = parseInt(pgSz.getAttribute('w:h') || '15840', 10);
            const orient = pgSz.getAttribute('w:orient') || '';

            const wPt = Math.round((wDxa / 20) * 10) / 10;
            const hPt = Math.round((hDxa / 20) * 10) / 10;

            const isLandscape = orient === 'landscape' || wPt > hPt;
            result.sectionConfig.orientation = isLandscape ? 'landscape' : 'portrait';

            const minDim = Math.min(wPt, hPt);
            const maxDim = Math.max(wPt, hPt);

            // A4: 595.3 pt x 841.9 pt
            if (Math.abs(minDim - 595.3) < 20 && Math.abs(maxDim - 841.9) < 20) {
              result.sectionConfig.pageSize = 'A4';
            } else if (Math.abs(minDim - 612) < 20 && Math.abs(maxDim - 792) < 20) {
              result.sectionConfig.pageSize = 'Letter';
            } else if (Math.abs(minDim - 612) < 20 && Math.abs(maxDim - 1008) < 20) {
              result.sectionConfig.pageSize = 'Legal';
            } else {
              result.sectionConfig.pageSize = 'Auto';
            }

            result.sectionConfig.widthPt = isLandscape ? maxDim : minDim;
            result.sectionConfig.heightPt = isLandscape ? minDim : maxDim;
          }

          const pgMar = sectPr.getElementsByTagName('w:pgMar')[0];
          if (pgMar) {
            const topDxa = parseInt(pgMar.getAttribute('w:top') || '1440', 10);
            const rightDxa = parseInt(pgMar.getAttribute('w:right') || '1440', 10);
            const bottomDxa = parseInt(pgMar.getAttribute('w:bottom') || '1440', 10);
            const leftDxa = parseInt(pgMar.getAttribute('w:left') || '1440', 10);

            result.sectionConfig.marginsPt = {
              top: Math.round((topDxa / 20) * 10) / 10,
              right: Math.round((rightDxa / 20) * 10) / 10,
              bottom: Math.round((bottomDxa / 20) * 10) / 10,
              left: Math.round((leftDxa / 20) * 10) / 10,
            };
          }
        }
      }
    } catch (err) {
      console.warn('DocxOpenXmlParser notice: could not parse raw OpenXML structure:', err);
    }

    return result;
  }
}
