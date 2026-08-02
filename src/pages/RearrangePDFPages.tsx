import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';
import {
  ArrowUpDown,
  FileText,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ShieldAlert,
  Save,
  Info,
  Layers,
  Check,
  AlertCircle,
  Undo,
} from 'lucide-react';

export const RearrangePDFPages: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Array of original 0-based page indices representing current order
  // e.g., [0, 1, 2, 3] initially, becomes [2, 0, 1, 3] after drag & drop
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setLoadError(null);

    try {
      const count = await PDFService.getPageCount(file);
      setPageCount(count);
      const initialOrder = Array.from({ length: count }, (_, i) => i);
      setPageOrder(initialOrder);
      toast.info(`Loaded ${file.name} (${count} ${count === 1 ? 'page' : 'pages'})`);
    } catch (err: any) {
      const errorMsg = err?.message || '';
      if (errorMsg.toLowerCase().includes('encrypted') || errorMsg.toLowerCase().includes('password')) {
        setLoadError('This PDF file is password protected. Please unlock it first using Protect/Unlock PDF tool.');
        toast.error('PDF is password protected.');
      } else {
        setLoadError('The selected PDF file appears to be corrupted or unreadable. Please try a different PDF.');
        toast.error('Corrupted or unreadable PDF file.');
      }
    }
  };

  const hasOrderChanged = useMemo(() => {
    if (pageOrder.length !== pageCount) return false;
    return pageOrder.some((origIdx, currentIdx) => origIdx !== currentIdx);
  }, [pageOrder, pageCount]);

  // Re-ordering logic
  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= pageOrder.length || toIndex < 0 || toIndex >= pageOrder.length) return;
    if (fromIndex === toIndex) return;

    setPageOrder((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }, [pageOrder.length]);

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      movePage(index, index - 1);
      toast.info(`Moved Page ${index + 1} left`);
    }
  };

  const handleMoveRight = (index: number) => {
    if (index < pageOrder.length - 1) {
      movePage(index, index + 1);
      toast.info(`Moved Page ${index + 1} right`);
    }
  };

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      movePage(draggedIndex, targetIndex);
      toast.info(`Re-ordered page from position ${draggedIndex + 1} to ${targetIndex + 1}`);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleResetOrder = () => {
    const initialOrder = Array.from({ length: pageCount }, (_, i) => i);
    setPageOrder(initialOrder);
    toast.info('Reset page order to original');
  };

  const handleSaveOrder = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Saving rearranged PDF pages...');
      const blob = await PDFService.rearrangePages(
        selectedFile,
        pageOrder,
        (percent, statusMsg) => updateProgress(percent, statusMsg)
      );

      setResultBlob(blob);
      setSuccess('Successfully rearranged PDF pages!');
      toast.success('Rearranged PDF saved successfully!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_rearranged.pdf`,
        size: blob.size,
        toolId: 'rearrange-pages',
        toolName: 'Rearrange PDF Pages',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to rearrange PDF pages.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setPageOrder([]);
    setLoadError(null);
    setResultBlob(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Rearrange PDF Pages"
        description="Reorder, move, and drag-and-drop pages of your PDF document easily online. Preserves original page size, quality, rotation, and metadata."
        path="/rearrange-pages"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={ArrowUpDown}
          title="Rearrange PDF Pages"
          description="Drag and drop or click arrow buttons to reorder pages in your PDF document. Instantly preview your updated page layout."
          badge="Essential"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to rearrange pages"
            description="or drag and drop single PDF file here"
          />
        ) : loadError ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-rose-500/30 p-8 text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Unable to Open PDF</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{loadError}</p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                Choose Another PDF
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Header File Details & Page Counts */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>

              {/* Status & Unsaved Banner */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700">
                  Total Pages: <strong className="text-white">{pageCount}</strong>
                </span>

                {hasOrderChanged ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unsaved Page Order Changes</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Original Order</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Instruction Bar & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111114] p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Drag thumbnails or use <strong>Move Left/Right</strong> buttons to reorder pages.</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={!hasOrderChanged}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Order</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Thumbnail Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Interactive Page Layout ({pageCount} pages):</span>
                </h3>
                {hasOrderChanged && (
                  <span className="text-xs font-semibold text-amber-400">
                    Live Preview Updated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pageOrder.map((origIndex, currentPosition) => {
                  const isDragging = draggedIndex === currentPosition;
                  const isDragOver = dragOverIndex === currentPosition;
                  const isModified = origIndex !== currentPosition;

                  return (
                    <div
                      key={`rearrange-slot-${currentPosition}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, currentPosition)}
                      onDragOver={(e) => handleDragOver(e, currentPosition)}
                      onDrop={(e) => handleDrop(e, currentPosition)}
                      onDragEnd={handleDragEnd}
                      className={`group relative bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all select-none ${
                        isDragging
                          ? 'opacity-40 border-dashed border-blue-500 bg-blue-950/20'
                          : isDragOver
                          ? 'border-blue-400 bg-blue-950/30 ring-2 ring-blue-500/50 scale-102'
                          : isModified
                          ? 'border-amber-500/50 bg-amber-950/10'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Drag Grip Handle */}
                      <div className="w-full flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                            isModified
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          #{currentPosition + 1}
                        </span>

                        <div className="flex items-center gap-1 text-slate-500 group-hover:text-slate-300 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Visual Page Thumbnail Box */}
                      <div
                        className={`w-full h-32 my-1 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                          isModified
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                            : 'bg-slate-900/90 border-slate-800 text-slate-400'
                        }`}
                      >
                        <FileText className="w-10 h-10 text-blue-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 tracking-wider">
                          Page {origIndex + 1}
                        </span>

                        {isModified && (
                          <div className="absolute inset-x-0 bottom-0 bg-amber-600/90 text-white text-[9px] font-bold py-0.5 text-center uppercase tracking-wider">
                            Orig #{origIndex + 1}
                          </div>
                        )}
                      </div>

                      {/* Move Left / Right Controls */}
                      <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleMoveLeft(currentPosition)}
                          disabled={currentPosition === 0}
                          aria-label={`Move Page ${currentPosition + 1} left`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {isModified ? `Was #${origIndex + 1}` : `Pos ${currentPosition + 1}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMoveRight(currentPosition)}
                          disabled={currentPosition === pageOrder.length - 1}
                          aria-label={`Move Page ${currentPosition + 1} right`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Move Right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {hasOrderChanged ? (
                  <span className="text-amber-400 font-semibold">
                    Page order modified. Click &quot;Save Rearranged PDF&quot; to export.
                  </span>
                ) : (
                  <span>Drag pages or use directional arrows to change sequence.</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={!hasOrderChanged}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset Order
                </button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveOrder}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Rearranged PDF</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing Modal for status & downloading */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_rearranged.pdf`}
          onReset={handleReset}
          title="Rearranging PDF Pages"
        />
      </div>
    </motion.div>
  );
};
