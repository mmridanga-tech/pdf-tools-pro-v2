import { BoundingBox, StructuredLine } from './LayoutAnalyzer';

export type BlockType = 'paragraph' | 'heading' | 'list' | 'table' | 'image' | 'page_break';

export interface BaseBlock {
  id: string;
  type: BlockType;
  bbox?: BoundingBox;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph' | 'heading' | 'list';
  line: StructuredLine;
  headingLevel?: 'h1' | 'h2' | 'h3';
  bulletLevel?: number;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: {
    cells: {
      text: string;
      isHeader?: boolean;
      bold?: boolean;
      italic?: boolean;
      fontSize?: number;
      fontFamily?: string;
    }[];
  }[];
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  dataUrl?: string;
  buffer?: Uint8Array;
  width: number;
  height: number;
}

export interface PageBreakBlock extends BaseBlock {
  type: 'page_break';
}

export type DocumentBlock = ParagraphBlock | TableBlock | ImageBlock | PageBreakBlock;

export interface PageModel {
  pageNumber: number;
  width: number;
  height: number;
  blocks: DocumentBlock[];
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  pageCount: number;
  creationDate?: Date;
}

export interface DocumentModel {
  metadata: DocumentMetadata;
  pages: PageModel[];
}

export class DocumentStructure {
  /**
   * Helper: Create empty DocumentModel
   */
  static createEmptyDocument(title: string): DocumentModel {
    return {
      metadata: {
        title,
        pageCount: 0,
        creationDate: new Date(),
      },
      pages: [],
    };
  }

  /**
   * Helper: Add page to DocumentModel
   */
  static addPage(
    doc: DocumentModel,
    width: number,
    height: number
  ): PageModel {
    const pageNumber = doc.pages.length + 1;
    const page: PageModel = {
      pageNumber,
      width,
      height,
      blocks: [],
    };
    doc.pages.push(page);
    doc.metadata.pageCount = doc.pages.length;
    return page;
  }
}
