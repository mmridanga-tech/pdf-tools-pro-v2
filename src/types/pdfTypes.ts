export interface MergeOptions {
  files: File[];
}

export interface SplitOptions {
  mode: 'range' | 'single' | 'all';
  ranges?: string; // e.g., "1-3, 5, 7-10"
  pagesPerFile?: number;
}

export interface CompressionOptions {
  level: 'recommended' | 'extreme' | 'less';
}

export interface RotateOptions {
  pageRotations: { [pageIndex: number]: number }; // angle: 0, 90, 180, 270
}

export interface WatermarkOptions {
  text: string;
  opacity: number;
  fontSize: number;
  color: string; // hex
  rotation: number; // degrees
}

export interface PageNumberOptions {
  position: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left';
  startFrom: number;
  format: 'page' | 'page-of-total';
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: OCRWord[];
}

export interface OCRPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  lines: OCRLine[];
  paragraphs: string[];
  tables: string[][][]; // Detected tables: list of tables, each table is rows x cells
  canvasDataUrl?: string;
  imageWidth: number;
  imageHeight: number;
}

export interface OCRResultData {
  combinedText: string;
  overallConfidence: number;
  pageResults: OCRPageResult[];
  detectedLanguages: string[];
  tablesCount: number;
}

export interface OCROptions {
  language: string; // 'eng', 'ben', 'eng+ben', etc.
  outputFormat: 'pdf' | 'txt' | 'docx';
  enhanceResolution?: boolean;
  detectTables?: boolean;
  preserveFormatting?: boolean;
}

export interface PDFProtectPermissions {
  printing: boolean;
  copying: boolean;
  editing: boolean;
  annotating: boolean;
}

export interface PDFProtectOptions {
  userPassword?: string;
  ownerPassword?: string;
  permissions: PDFProtectPermissions;
}

export interface PDFUnlockOptions {
  password?: string;
}

export interface ProcessedResult {
  blob: Blob;
  fileName: string;
  originalSize?: number;
  newSize?: number;
  extractedText?: string;
  ocrData?: OCRResultData;
}
