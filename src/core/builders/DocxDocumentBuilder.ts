import { Document, Header, Footer, Paragraph, Packer } from 'docx';
import { DocxImageBuilder } from './DocxImageBuilder';

export interface PageMarginConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface DocumentBuildOptions {
  sectionChildren: any[];
  header?: Header;
  footer?: Footer;
  margins?: PageMarginConfig;
}

export class DocxDocumentBuilder {
  /**
   * Assemble a fully compliant DOCX Document instance
   */
  static buildDocument(options: DocumentBuildOptions): Document {
    const defaultMargins = {
      top: 1440, // 1 inch = 1440 twips
      bottom: 1440,
      left: 1440,
      right: 1440,
      ...options.margins,
    };

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: defaultMargins,
            },
          },
          headers: options.header ? { default: options.header } : undefined,
          footers: options.footer ? { default: options.footer } : undefined,
          children: options.sectionChildren,
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
