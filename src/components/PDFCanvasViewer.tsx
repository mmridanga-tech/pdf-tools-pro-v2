import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AIChatService } from '../services/aiChatService';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  FileText,
} from 'lucide-react';

interface PDFCanvasViewerProps {
  file: File;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  file,
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1.1);
  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const renderPage = useCallback(async () => {
    if (!canvasRef.current || !file) return;
    setLoading(true);
    try {
      await AIChatService.renderPageToCanvas(file, currentPage, canvasRef.current, scale);
    } catch (err) {
      console.error('Failed to render PDF page onto canvas:', err);
    } finally {
      setLoading(false);
    }
  }, [file, currentPage, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(String(currentPage));
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => setScale(1.1);

  return (
    <div className={`flex flex-col h-full bg-[#121215] border border-slate-800 rounded-3xl overflow-hidden shadow-xl ${className}`}>
      {/* Top Toolbar */}
      <div className="bg-[#18181D] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold text-xs">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-[220px]">
            {file.name}
          </span>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1.5 bg-[#121215] px-2 py-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={inputPage}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              className="w-10 text-center py-0.5 bg-slate-900 border border-slate-700/80 rounded-md text-xs text-white font-mono focus:outline-none focus:border-red-500"
            />
            <span className="text-xs text-slate-500 font-mono">/ {totalPages}</span>
          </form>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.6}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg text-[11px] font-mono text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0d0d10] relative min-h-[350px]">
        {loading && (
          <div className="absolute inset-0 bg-[#0d0d10]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-red-500" />
            <span className="text-xs font-semibold">Rendering Page {currentPage}...</span>
          </div>
        )}

        <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white">
          <canvas ref={canvasRef} className="max-w-full h-auto block" />
        </div>
      </div>
    </div>
  );
};
