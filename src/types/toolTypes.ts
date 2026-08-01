export type ToolCategory = 'all' | 'organize' | 'convert' | 'edit' | 'security';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  path: string;
  badge?: string;
  popular?: boolean;
  color: string;
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  thumbnailUrl?: string;
  rotation?: number; // 0, 90, 180, 270
}
