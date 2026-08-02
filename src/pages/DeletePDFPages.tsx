import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes, parsePageRange } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';
import {
  Trash2,
  FileText,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  Eye,
  Check,
  Undo2,
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export const DeletePDFPages: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  // Set of 0-based page indices marked for DELETION
  const [deleteIndices, setDeleteIndices] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');

  // Selection history stack for Undo capability before final save
  const [history, setHistory] = useState<number[][]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'remaining'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  // Helper to update delete indices with history recording for Undo
  const updateDeleteIndicesWithHistory = useCallback((newIndices: number[]) => {
    setDeleteIndices((prev) => {
      setHistory((h) => [...h, prev]);
      return newIndices;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    setDeleteIndices(lastState);

    // Update range input text to match restored indices (1-indexed)
    if (lastState.length > 0) {
      const pageNums = lastState.map((i) => i + 1).sort((a, b) => a - b);
      setRangeInput(pageNums.join(', '));
    } else {
      setRangeInput('');
    }
    toast.info('Undid last selection change');
  }, [history, toast]);

  // Global Ctrl+Z / Cmd+Z handler for undoing page selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && selectedFile) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, selectedFile]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setHistory([]);
    setDeleteIndices([]);
    setRangeInput('');

    try {
      const count = await PDFService.getPageCount(file);
      setPageCount(count);
      toast.info(`Loaded ${file.name} (${count} ${count === 1 ? 'page' : 'pages'})`);
    } catch {
      toast.error('Could not parse PDF page count.');
    }
  };

  const handleTogglePageDelete = (index: number) => {
    let updated: number[];
    if (deleteIndices.includes(index)) {
      updated = deleteIndices.filter((i) => i !== index);
    } else {
      updated = [...deleteIndices, index].sort((a, b) => a - b);
    }

    updateDeleteIndicesWithHistory(updated);

    if (updated.length > 0) {
      const displayNums = updated.map((i) => i + 1);
      setRangeInput(displayNums.join(', '));
    } else {
      setRangeInput('');
    }
  };

  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeInput(val);
    if (!val.trim()) {
      updateDeleteIndicesWithHistory([]);
      return;
    }
    const parsed = parsePageRange(val, pageCount);
    updateDeleteIndicesWithHistory(parsed);
  };

  const handleSelectAllForDelete = () => {
    // Leave at least 1 page unselected if possible, but let user see
    const allIndices = Array.from({ length: pageCount }, (_, i) => i);
    updateDeleteIndicesWithHistory(allIndices);
    setRangeInput(`1-${pageCount}`);
    toast.info('Marked all pages for deletion');
  };

  const handleDeselectAll = () => {
    updateDeleteIndicesWithHistory([]);
    setRangeInput('');
    toast.info('Cleared all page deletion flags');
  };

  const handleInvertSelection = () => {
    const inverted = Array.from({ length: pageCount }, (_, i) => i).filter(
      (i) => !deleteIndices.includes(i)
    );
    updateDeleteIndicesWithHistory(inverted);
    if (inverted.length > 0) {
      setRangeInput(inverted.map((i) => i + 1).join(', '));
    } else {
      setRangeInput('');
    }
    toast.info('Inverted page selection');
  };

  const remainingCount = pageCount - deleteIndices.length;

  const handleConfirmDeleteClick = () => {
    if (deleteIndices.length === 0) {
      toast.warning('Please select at least one page to delete.');
      return;
    }

    if (deleteIndices.length >= pageCount) {
      toast.error('Cannot delete all pages. At least one page must remain in the PDF.');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!selectedFile) return;
    setShowConfirmModal(false);

    try {
      startProcessing('Deleting selected pages...');
      const blob = await PDFService.deletePages(
        selectedFile,
        deleteIndices,
        (percent, statusMsg) => updateProgress(percent, statusMsg)
      );

      setResultBlob(blob);
      setSuccess(`Successfully deleted ${deleteIndices.length} page(s)!`);
      toast.success('PDF pages deleted successfully!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_edited.pdf`,
        size: blob.size,
        toolId: 'delete-pages',
        toolName: 'Delete PDF Pages',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to delete PDF pages.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setDeleteIndices([]);
    setRangeInput('');
    setHistory([]);
    setResultBlob(null);
    setShowConfirmModal(false);
    reset();
  };

  const remainingPageIndices = useMemo(() => {
    return Array.from({ length: pageCount }, (_, i) => i).filter(
      (i) => !deleteIndices.includes(i)
    );
  }, [pageCount, deleteIndices]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Delete PDF Pages"
        description="Remove unwanted pages from your PDF document easily online while preserving bookmarks, metadata, and full visual quality."
        path="/delete-pages"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Trash2}
          title="Delete PDF Pages"
          description="Remove selected pages from your PDF document. Re-order, preview remaining pages, and download the updated PDF file."
          badge="Essential"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to remove pages from"
            description="or drag and drop single PDF file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Header File Details & Page Counts */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>

              {/* Status Counters */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700">
                  Total: <strong className="text-white">{pageCount}</strong>
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl border transition-colors ${
                    deleteIndices.length > 0
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-slate-800/90 text-slate-400 border-slate-700'
                  }`}
                >
                  Deleting: <strong className="text-rose-400">{deleteIndices.length}</strong>
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl border transition-colors ${
                    remainingCount > 0
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  Remaining: <strong className="text-emerald-400">{remainingCount}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  Change PDF
                </button>
              </div>
            </div>

            {/* Selection Controls Bar */}
            <div className="space-y-4 bg-[#111114] p-5 rounded-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label htmlFor="delete-range-input" className="block text-sm font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Pages to Delete (1-indexed range or comma separated):</span>
                </label>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors cursor-pointer"
                    title="Undo last selection change (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllForDelete}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
                    <span>Select All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInvertSelection}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Invert</span>
                  </button>
                </div>
              </div>

              {/* Range text input */}
              <input
                id="delete-range-input"
                type="text"
                value={rangeInput}
                onChange={handleRangeInputChange}
                placeholder="e.g. 1, 3-5, 8"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/80 text-sm font-mono"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
                <p>Click page thumbnails below or enter page numbers to mark pages for deletion.</p>

                {/* View Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Pages ({pageCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('remaining')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'remaining'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Remaining Preview ({remainingCount})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Visual Page Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>
                    {viewMode === 'all'
                      ? 'Select Pages to Remove:'
                      : `Live Preview of Final Output PDF (${remainingCount} pages remaining):`}
                  </span>
                </h3>
                {deleteIndices.length > 0 && (
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {deleteIndices.length} page(s) marked for removal
                  </span>
                )}
              </div>

              {viewMode === 'all' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const isMarkedForDelete = deleteIndices.includes(idx);

                    return (
                      <motion.div
                        key={`page-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.4) }}
                        onClick={() => handleTogglePageDelete(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTogglePageDelete(idx);
                          }
                        }}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={isMarkedForDelete}
                        aria-label={`Page ${idx + 1}, ${
                          isMarkedForDelete ? 'marked for deletion' : 'kept'
                        }`}
                        className={`group relative bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/60 select-none ${
                          isMarkedForDelete
                            ? 'border-rose-500/90 bg-rose-950/20 shadow-lg shadow-rose-950/40 ring-2 ring-rose-500/40'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Status Checkbox / Delete Indicator */}
                        <div
                          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all z-10 ${
                            isMarkedForDelete
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'border border-slate-700 bg-slate-900/90 text-slate-500 group-hover:border-slate-500'
                          }`}
                        >
                          {isMarkedForDelete ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                        </div>

                        {/* Visual Page Box */}
                        <div
                          className={`w-full h-32 my-2 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                            isMarkedForDelete
                              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                              : 'bg-slate-900/90 border-slate-800 text-slate-400 group-hover:bg-slate-850'
                          }`}
                        >
                          <FileText
                            className={`w-10 h-10 transition-transform group-hover:scale-105 ${
                              isMarkedForDelete ? 'text-rose-400' : 'text-slate-500'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${
                              isMarkedForDelete ? 'text-rose-300' : 'text-slate-400'
                            }`}
                          >
                            Page {idx + 1}
                          </span>

                          {/* Delete overlay tag */}
                          {isMarkedForDelete && (
                            <div className="absolute inset-x-0 bottom-0 bg-rose-600 text-white text-[10px] font-extrabold py-0.5 text-center uppercase tracking-wider">
                              Delete Page
                            </div>
                          )}
                        </div>

                        {/* Page Footer */}
                        <div className="w-full flex items-center justify-between mt-1 text-xs font-medium">
                          <span
                            className={
                              isMarkedForDelete ? 'text-rose-400 font-bold' : 'text-slate-300'
                            }
                          >
                            Page {idx + 1}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isMarkedForDelete
                                ? 'bg-rose-500/20 text-rose-300 font-bold'
                                : 'text-slate-500'
                            }`}
                          >
                            {isMarkedForDelete ? 'Will Remove' : 'Keep'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Remaining Preview View Mode */
                <div className="space-y-4">
                  {remainingPageIndices.length === 0 ? (
                    <div className="p-8 text-center bg-rose-950/20 border border-rose-500/30 rounded-2xl">
                      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-rose-300">All pages marked for deletion!</p>
                      <p className="text-xs text-slate-400 mt-1">
                        At least one page must remain in the final PDF document.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {remainingPageIndices.map((origIdx, newSeqIdx) => (
                        <div
                          key={`rem-page-${origIdx}`}
                          className="bg-[#141417] rounded-2xl border border-emerald-500/40 p-3 flex flex-col items-center justify-between shadow-md"
                        >
                          <div className="w-full h-32 my-2 bg-emerald-950/20 rounded-xl border border-emerald-500/30 flex flex-col items-center justify-center">
                            <FileText className="w-10 h-10 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-300 uppercase mt-1 tracking-wider">
                              New Page {newSeqIdx + 1}
                            </span>
                          </div>
                          <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span>New #{newSeqIdx + 1}</span>
                            <span className="text-[10px] text-slate-500">Orig #{origIdx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {deleteIndices.length === 0 ? (
                  <span>Select one or more pages above to delete.</span>
                ) : remainingCount === 0 ? (
                  <span className="text-rose-400 font-semibold">
                    Warning: Cannot delete all pages from the PDF.
                  </span>
                ) : (
                  <span>
                    Ready to output PDF with <strong className="text-emerald-400">{remainingCount}</strong> remaining page(s).
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  disabled={deleteIndices.length === 0}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmDeleteClick}
                  disabled={deleteIndices.length === 0 || remainingCount === 0}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>
                    Delete {deleteIndices.length > 0 ? `${deleteIndices.length} Page(s)` : 'Pages'}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#141417] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Confirm Page Deletion</h3>
                    <p className="text-xs text-slate-400">This operation will modify your PDF document.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Original Pages:</span>
                    <strong className="text-white">{pageCount}</strong>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Pages to Remove:</span>
                    <strong>
                      {deleteIndices.length} ({deleteIndices.map((i) => i + 1).join(', ')})
                    </strong>
                  </div>
                  <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-2">
                    <span>Final Remaining Pages:</span>
                    <strong>{remainingCount}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  The remaining pages will keep all original formatting, bookmarks, forms, and metadata.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={executeDelete}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Processing Modal for status & downloading */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_edited.pdf`}
          onReset={handleReset}
          title="Deleting PDF Pages"
        />
      </div>
    </motion.div>
  );
};
