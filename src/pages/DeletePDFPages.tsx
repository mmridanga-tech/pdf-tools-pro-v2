import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolHeader } from '../components/ToolHeader';
import { PagePreviewGrid } from '../components/PagePreviewGrid';
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
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumSuccessCard,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const toast = useToast();

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

    if (lastState.length > 0) {
      const pageNums = lastState.map((i) => i + 1).sort((a, b) => a - b);
      setRangeInput(pageNums.join(', '));
    } else {
      setRangeInput('');
    }
    toast.info('Undid last selection change');
  }, [history, toast]);

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
    setResultBlob(null);

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

    executeDelete();
  };

  const executeDelete = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setProgressPercent(10);
      const blob = await PDFService.deletePages(
        selectedFile,
        deleteIndices,
        (percent, statusMsg) => setProgressPercent(percent)
      );

      setResultBlob(blob);
      setIsProcessing(false);
      toast.success('PDF pages deleted successfully!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_edited.pdf`,
        size: blob.size,
        toolId: 'delete-pages',
        toolName: 'Delete PDF Pages',
        status: 'completed',
      });
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err.message || 'Failed to delete PDF pages.';
      toast.error(msg);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !selectedFile) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    const editedName = `${selectedFile.name.replace(/\.pdf$/i, '')}_edited.pdf`;
    link.download = editedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${editedName}`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setDeleteIndices([]);
    setRangeInput('');
    setHistory([]);
    setResultBlob(null);
    setIsProcessing(false);
  };

  const currentStep = resultBlob ? 3 : isProcessing ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="Delete PDF Pages"
        description="Remove unwanted pages from your PDF document easily online while preserving bookmarks, metadata, and full visual quality."
        path="/delete-pages"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={Trash2}
          title="Delete PDF Pages"
          description="Remove selected pages from your PDF document. Re-order, preview remaining pages, and download the updated PDF file."
          badge="Essential"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {!selectedFile ? (
              <PremiumUploadZone
                accept=".pdf,application/pdf"
                multiple={false}
                onFilesSelected={handleFileSelected}
                title="Select PDF file to remove pages from"
                description="Supports all PDF types • Drag and drop or browse"
                buttonText="Choose PDF File"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                <PremiumFileCard
                  name={selectedFile.name}
                  size={selectedFile.size}
                  pageCount={pageCount}
                  onReplace={(newFile) => handleFileSelected([newFile])}
                  onRemove={handleReset}
                />

                {isProcessing && (
                  <PremiumProgress
                    progress={progressPercent}
                    statusMessage="Rebuilding PDF structure without deleted pages..."
                    stepName="PDF Page Deletion Pipeline"
                  />
                )}

                {resultBlob && (
                  <PremiumSuccessCard
                    title="Pages Deleted Successfully!"
                    message={`Removed ${deleteIndices.length} page(s). Document updated with ${remainingCount} remaining page(s).`}
                    outputFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}_edited.pdf`}
                    outputFileSize={resultBlob.size}
                    pageCount={remainingCount}
                    onDownload={handleDownload}
                    onReset={handleReset}
                    downloadButtonText="Download Updated PDF"
                  />
                )}

                {!resultBlob && !isProcessing && (
                  <div className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div>
                        <p className="text-sm font-bold text-white">
                          Pages Marked to Delete: <span className="text-red-400 font-mono">{deleteIndices.length}</span> / {pageCount}
                        </p>
                        <p className="text-xs text-slate-400">
                          {remainingCount} page(s) will remain in the output document.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={history.length === 0}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-300 border border-white/10 disabled:opacity-30 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Undo2 className="w-3.5 h-3.5" /> Undo
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectAllForDelete}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Range Input Box */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Specify Page Range to Delete (e.g. 1, 3-5, 8)
                      </label>
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={handleRangeInputChange}
                        placeholder="e.g. 1, 3-5, 8"
                        className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>

                    {/* Interactive Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Click pages to mark or unmark for deletion:
                        </h4>
                      </div>

                      <PagePreviewGrid
                        pageCount={pageCount}
                        selectedPages={deleteIndices}
                        onTogglePageSelect={handleTogglePageDelete}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConfirmDeleteClick}
                        disabled={deleteIndices.length === 0 || deleteIndices.length >= pageCount}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete {deleteIndices.length} Selected Page(s)</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="Delete PDF Pages"
              supportedFormats={['PDF (.pdf)']}
              tips={[
                'Click individual page thumbnails to mark them for deletion.',
                'Use page range expressions (e.g. "2-5, 8") for quick bulk selection.',
                'Supports unlimited Undo (Ctrl+Z) to safely revert accidental selections.',
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
