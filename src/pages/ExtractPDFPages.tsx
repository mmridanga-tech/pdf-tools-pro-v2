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
  FileOutput,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  Eye,
  Check,
  RefreshCw,
  Layers,
  Info,
  ShieldAlert,
  ArrowRight,
  Download,
} from 'lucide-react';

export const ExtractPDFPages: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Set of 0-based page indices marked for EXTRACTION
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'all' | 'export'>('all');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setSelectedIndices([]);
    setRangeInput('');
    setLoadError(null);
    setRangeError(null);

    try {
      const count = await PDFService.getPageCount(file);
      setPageCount(count);
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

  const handleTogglePageSelect = (index: number) => {
    let updated: number[];
    if (selectedIndices.includes(index)) {
      updated = selectedIndices.filter((i) => i !== index);
    } else {
      updated = [...selectedIndices, index].sort((a, b) => a - b);
    }

    setSelectedIndices(updated);
    setRangeError(null);

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
    setRangeError(null);

    if (!val.trim()) {
      setSelectedIndices([]);
      return;
    }

    // Validate characters first (only numbers, commas, dashes, spaces)
    if (!/^[0-9,\s\-]+$/.test(val)) {
      setRangeError('Invalid format. Use numbers, commas, and hyphens (e.g. 1, 3-5, 8).');
      return;
    }

    const parsed = parsePageRange(val, pageCount);
    if (parsed.length === 0) {
      setRangeError(`No valid pages in range 1-${pageCount}.`);
    } else {
      setRangeError(null);
    }

    setSelectedIndices(parsed);
  };

  const handleSelectAll = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i);
    setSelectedIndices(all);
    setRangeInput(pageCount === 1 ? '1' : `1-${pageCount}`);
    setRangeError(null);
    toast.info('Selected all pages for extraction');
  };

  const handleClearSelection = () => {
    setSelectedIndices([]);
    setRangeInput('');
    setRangeError(null);
    toast.info('Cleared page selection');
  };

  const handleInvertSelection = () => {
    const inverted = Array.from({ length: pageCount }, (_, i) => i).filter(
      (i) => !selectedIndices.includes(i)
    );
    setSelectedIndices(inverted);
    setRangeError(null);
    if (inverted.length > 0) {
      setRangeInput(inverted.map((i) => i + 1).join(', '));
    } else {
      setRangeInput('');
    }
    toast.info('Inverted page selection');
  };

  const handleSelectOdds = () => {
    const odds = Array.from({ length: pageCount }, (_, i) => i).filter((i) => i % 2 === 0);
    setSelectedIndices(odds);
    setRangeError(null);
    setRangeInput(odds.map((i) => i + 1).join(', '));
    toast.info('Selected all odd pages');
  };

  const handleSelectEvens = () => {
    const evens = Array.from({ length: pageCount }, (_, i) => i).filter((i) => i % 2 !== 0);
    setSelectedIndices(evens);
    setRangeError(null);
    setRangeInput(evens.map((i) => i + 1).join(', '));
    toast.info('Selected all even pages');
  };

  const handleExtractPages = async () => {
    if (!selectedFile) return;

    if (selectedIndices.length === 0) {
      toast.warning('Please select at least one page to extract.');
      setRangeError('Empty selection. Please select at least one page.');
      return;
    }

    try {
      startProcessing(`Extracting ${selectedIndices.length} page(s)...`);
      const blob = await PDFService.extractPages(
        selectedFile,
        selectedIndices,
        (percent, statusMsg) => updateProgress(percent, statusMsg)
      );

      setResultBlob(blob);
      setSuccess(`Successfully extracted ${selectedIndices.length} page(s)!`);
      toast.success('PDF pages extracted successfully!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_extracted.pdf`,
        size: blob.size,
        toolId: 'extract-pages',
        toolName: 'Extract PDF Pages',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to extract PDF pages.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setSelectedIndices([]);
    setRangeInput('');
    setRangeError(null);
    setLoadError(null);
    setResultBlob(null);
    reset();
  };

  const pagesToExportList = useMemo(() => {
    return selectedIndices.map((idx) => ({ origIdx: idx, num: idx + 1 }));
  }, [selectedIndices]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Extract PDF Pages"
        description="Extract single pages or ranges from any PDF into a new document online. Preserves original page size, quality, rotation, and metadata."
        path="/extract-pages"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={FileOutput}
          title="Extract PDF Pages"
          description="Extract single pages, ranges (e.g. 1, 3-5, 8), or custom page groups into a new PDF while maintaining pristine vector quality and metadata."
          badge="Essential"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to extract pages from"
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
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-sm">
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
                  Total Document Pages: <strong className="text-white">{pageCount}</strong>
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl border transition-colors ${
                    selectedIndices.length > 0
                      ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                      : 'bg-slate-800/90 text-slate-400 border-slate-700'
                  }`}
                >
                  Selected to Extract: <strong className="text-violet-400">{selectedIndices.length}</strong>
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Pages in Output PDF: <strong className="text-emerald-400">{selectedIndices.length}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Selection Controls Bar */}
            <div className="space-y-4 bg-[#111114] p-5 rounded-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label htmlFor="extract-range-input" className="block text-sm font-bold text-white flex items-center gap-2">
                  <FileOutput className="w-4 h-4 text-violet-400" />
                  <span>Enter Page Numbers / Ranges to Extract:</span>
                </label>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
                    <span>Select All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectOdds}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <span>Odds</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectEvens}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <span>Evens</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInvertSelection}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Invert</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Range text input */}
              <div>
                <input
                  id="extract-range-input"
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInputChange}
                  placeholder="e.g. 5 or 1,3,8 or 5-10 or 1,3,7-12"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 text-sm font-mono transition-all ${
                    rangeError
                      ? 'border-rose-500/80 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:ring-violet-500/40 focus:border-violet-500/80'
                  }`}
                />
                {rangeError && (
                  <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{rangeError}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
                <p>Click page thumbnails below or type page ranges to pick pages for export.</p>

                {/* View Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Pages ({pageCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('export')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'export'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Output Preview ({selectedIndices.length})</span>
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
                      ? 'Select Pages to Extract:'
                      : `Live Preview of Pages in Extracted PDF (${selectedIndices.length} page(s)):`}
                  </span>
                </h3>
                {selectedIndices.length > 0 && (
                  <span className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {selectedIndices.length} page(s) queued for extraction
                  </span>
                )}
              </div>

              {viewMode === 'all' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const isSelected = selectedIndices.includes(idx);

                    return (
                      <motion.div
                        key={`extract-page-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.4) }}
                        onClick={() => handleTogglePageSelect(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTogglePageSelect(idx);
                          }
                        }}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`Page ${idx + 1}, ${
                          isSelected ? 'selected for extraction' : 'not selected'
                        }`}
                        className={`group relative bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/60 select-none ${
                          isSelected
                            ? 'border-violet-500/90 bg-violet-950/20 shadow-lg shadow-violet-950/40 ring-2 ring-violet-500/40'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Status Checkbox / Indicator */}
                        <div
                          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all z-10 ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                              : 'border border-slate-700 bg-slate-900/90 text-slate-500 group-hover:border-slate-500'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        </div>

                        {/* Visual Page Thumbnail Box */}
                        <div
                          className={`w-full h-32 my-2 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                            isSelected
                              ? 'bg-violet-950/30 border-violet-500/40 text-violet-300'
                              : 'bg-slate-900/90 border-slate-800 text-slate-500 group-hover:bg-slate-850'
                          }`}
                        >
                          <FileText
                            className={`w-10 h-10 transition-transform group-hover:scale-105 ${
                              isSelected ? 'text-violet-400' : 'text-slate-600'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${
                              isSelected ? 'text-violet-300' : 'text-slate-500'
                            }`}
                          >
                            Page {idx + 1}
                          </span>

                          {/* Selected Overlay Label */}
                          {isSelected && (
                            <div className="absolute inset-x-0 bottom-0 bg-violet-600 text-white text-[10px] font-extrabold py-0.5 text-center uppercase tracking-wider">
                              Extracting
                            </div>
                          )}
                        </div>

                        {/* Page Footer */}
                        <div className="w-full flex items-center justify-between mt-1 text-xs font-medium">
                          <span
                            className={
                              isSelected ? 'text-violet-300 font-bold' : 'text-slate-400'
                            }
                          >
                            Page {idx + 1}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-violet-500/20 text-violet-300 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {isSelected ? 'Extract' : 'Skip'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Export Preview Mode */
                <div className="space-y-4">
                  {selectedIndices.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                      <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-300">No pages selected for extraction!</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Select page thumbnails or enter range in the box above to preview output.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {pagesToExportList.map((item, newSeqIdx) => (
                        <div
                          key={`exp-page-${item.origIdx}`}
                          className="bg-[#141417] rounded-2xl border border-violet-500/40 p-3 flex flex-col items-center justify-between shadow-md"
                        >
                          <div className="w-full h-32 my-2 bg-violet-950/20 rounded-xl border border-violet-500/30 flex flex-col items-center justify-center">
                            <FileText className="w-10 h-10 text-violet-400" />
                            <span className="text-[10px] font-bold text-violet-300 uppercase mt-1 tracking-wider">
                              Output Page {newSeqIdx + 1}
                            </span>
                          </div>
                          <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span>Out #{newSeqIdx + 1}</span>
                            <span className="text-[10px] text-slate-500">Source #{item.num}</span>
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
                {selectedIndices.length === 0 ? (
                  <span className="text-amber-400 font-semibold">
                    Select at least one page to enable extraction.
                  </span>
                ) : (
                  <span>
                    Ready to extract <strong className="text-violet-400">{selectedIndices.length}</strong> page(s) into a new PDF document.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  disabled={selectedIndices.length === 0}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExtractPages}
                  disabled={selectedIndices.length === 0}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-violet-600/20 transition-all cursor-pointer"
                >
                  <FileOutput className="w-5 h-5" />
                  <span>
                    Extract {selectedIndices.length > 0 ? `${selectedIndices.length} Page(s)` : 'Pages'}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing Modal for status & downloading */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_extracted.pdf`}
          onReset={handleReset}
          title="Extracting PDF Pages"
        />
      </div>
    </motion.div>
  );
};
