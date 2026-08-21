import { Document, Header, Footer, Paragraph, Packer, PageOrientation } from 'docx';

export interface PageMarginConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface PageSizeConfig {
  width?: number; // twips (1 pt = 20 twips)
  height?: number; // twips
  orientation?: (typeof PageOrientation)[keyof typeof PageOrientation];
}

export interface SectionOptions {
  children: any[];
  header?: Header;
  footer?: Footer;
  margins?: PageMarginConfig;
  size?: PageSizeConfig;
}

export interface DocumentBuildOptions {
  sectionChildren?: any[];
  sections?: SectionOptions[];
  header?: Header;
  footer?: Footer;
  margins?: PageMarginConfig;
  size?: PageSizeConfig;
}

export class DocxDocumentBuilder {
  /**
   * Assemble a fully compliant DOCX Document instance supporting multi-section page dimensions and margins
   */
  static buildDocument(options: DocumentBuildOptions): Document {
    const defaultMargins = {
      top: 1440, // 1 inch = 1440 twips
      bottom: 1440,
      left: 1440,
      right: 1440,
    };

    if (options.sections && options.sections.length > 0) {
      const docSections = options.sections.map((sec) => {
        const secMargins = { ...defaultMargins, ...sec.margins };
        const pageProperties: any = {
          margin: secMargins,
        };

        if (sec.size && sec.size.width && sec.size.height) {
          pageProperties.size = {
            width: sec.size.width,
            height: sec.size.height,
            orientation: sec.size.orientation || (sec.size.width > sec.size.height ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT),
          };
        }

        return {
          properties: { page: pageProperties },
          headers: sec.header ? { default: sec.header } : undefined,
          footers: sec.footer ? { default: sec.footer } : undefined,
          children: sec.children,
        };
      });

      return new Document({ sections: docSections });
    }

    // Single section document fallback
    const secMargins = { ...defaultMargins, ...options.margins };
    const pageProperties: any = { margin: secMargins };

    if (options.size && options.size.width && options.size.height) {
      pageProperties.size = {
        width: options.size.width,
        height: options.size.height,
        orientation: options.size.orientation || (options.size.width > options.size.height ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT),
      };
    }

    return new Document({
      sections: [
        {
          properties: { page: pageProperties },
          headers: options.header ? { default: options.header } : undefined,
          footers: options.footer ? { default: options.footer } : undefined,
          children: options.sectionChildren || [],
        },
      ],
    });
  }

  /**
   * Pack document into downloadable DOCX Blob
   */
  static async exportToBlob(doc: Document): Promise<Blob> {
    return await Packer.toBlob(doc);
  }
}
