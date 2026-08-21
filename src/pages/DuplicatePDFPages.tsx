import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  Copy,
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
  Sparkles,
  ListPlus,
} from 'lucide-react';

export const DuplicatePDFPages: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Set of 0-based page indices marked for DUPLICATION
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Insertion placement strategy: 'after' or 'end'
  const [placement, setPlacement] = useState<'after' | 'end'>('after');
  const [viewMode, setViewMode] = useState<'all' | 'preview'>('all');
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
    toast.info('Selected all pages for duplication');
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

  const handleDuplicatePages = async () => {
    if (!selectedFile) return;

    if (selectedIndices.length === 0) {
      toast.warning('Please select at least one page to duplicate.');
      setRangeError('Empty selection. Please select at least one page.');
      return;
    }

    try {
      startProcessing(`Duplicating ${selectedIndices.length} page(s)...`);
      const blob = await PDFService.duplicatePages(
        selectedFile,
        selectedIndices,
        placement,
        (percent, statusMsg) => updateProgress(percent, statusMsg)
      );

      setResultBlob(blob);
      setSuccess(`Successfully duplicated ${selectedIndices.length} page(s)!`);
      toast.success('PDF pages duplicated successfully!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_duplicated.pdf`,
        size: blob.size,
        toolId: 'duplicate-pages',
        toolName: 'Duplicate PDF Pages',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to duplicate PDF pages.';
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

  // Build simulated output sequence for live preview
  const outputPreviewSequence = useMemo(() => {
    if (!selectedFile || pageCount === 0) return [];

    const seq: { origIdx: number; isCopy: boolean }[] = [];
    if (placement === 'after') {
      for (let i = 0; i < pageCount; i++) {
        seq.push({ origIdx: i, isCopy: false });
        if (selectedIndices.includes(i)) {
          seq.push({ origIdx: i, isCopy: true });
        }
      }
    } else {
      for (let i = 0; i < pageCount; i++) {
        seq.push({ origIdx: i, isCopy: false });
      }
      for (const idx of selectedIndices) {
        seq.push({ origIdx: idx, isCopy: true });
      }
    }
    return seq;
  }, [selectedFile, pageCount, selectedIndices, placement]);

  const outputTotalCount = pageCount + selectedIndices.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Duplicate PDF Pages"
        description="Clone and duplicate selected pages in your PDF file online. Choose to insert copies after each page or at the end of the document."
        path="/duplicate-pages"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Copy}
          title="Duplicate PDF Pages"
          description="Clone selected pages inside your PDF. Place duplicates immediately after their source pages or append them at the end of the file."
          badge="Essential"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to duplicate pages in"
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
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
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
                  Original Pages: <strong className="text-white">{pageCount}</strong>
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl border transition-colors ${
                    selectedIndices.length > 0
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800/90 text-slate-400 border-slate-700'
                  }`}
                >
                  Selected to Duplicate: <strong className="text-indigo-400">{selectedIndices.length}</strong>
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Final Page Count: <strong className="text-emerald-400">{outputTotalCount}</strong>
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

            {/* Selection Controls & Placement Settings */}
            <div className="space-y-4 bg-[#111114] p-5 rounded-2xl border border-slate-800/80">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Placement Options */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Insertion Position for Duplicates:
                  </label>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPlacement('after')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        placement === 'after'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>After Original Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlacement('end')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        placement === 'end'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>At End of Document</span>
                    </button>
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
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
                <label htmlFor="duplicate-range-input" className="block text-xs font-bold text-slate-300 mb-1">
                  Pages to Duplicate (1-indexed numbers or ranges):
                </label>
                <input
                  id="duplicate-range-input"
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInputChange}
                  placeholder="e.g. 1, 3-5, 8"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 text-sm font-mono transition-all ${
                    rangeError
                      ? 'border-rose-500/80 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:ring-indigo-500/40 focus:border-indigo-500/80'
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
                <p>Click page thumbnails below or type page ranges to mark pages for duplication.</p>

                {/* View Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Pages ({pageCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'preview'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Output Preview ({outputTotalCount})</span>
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
                      ? 'Select Pages to Duplicate:'
                      : `Live Output Preview (${outputTotalCount} total pages):`}
                  </span>
                </h3>
                {selectedIndices.length > 0 && (
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {selectedIndices.length} page(s) marked to clone ({placement === 'after' ? 'inserted after each' : 'appended at end'})
                  </span>
                )}
              </div>

              {viewMode === 'all' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const isSelected = selectedIndices.includes(idx);

                    return (
                      <motion.div
                        key={`duplicate-page-${idx}`}
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
                          isSelected ? 'selected for duplication' : 'not selected'
                        }`}
                        className={`group relative bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60 select-none ${
                          isSelected
                            ? 'border-indigo-500/90 bg-indigo-950/20 shadow-lg shadow-indigo-950/40 ring-2 ring-indigo-500/40'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Status Checkbox / Indicator */}
                        <div
                          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all z-10 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'border border-slate-700 bg-slate-900/90 text-slate-500 group-hover:border-slate-500'
                          }`}
                        >
                          {isSelected ? <Copy className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                        </div>

                        {/* Visual Page Thumbnail Box */}
                        <div
                          className={`w-full h-32 my-2 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                            isSelected
                              ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
                              : 'bg-slate-900/90 border-slate-800 text-slate-500 group-hover:bg-slate-850'
                          }`}
                        >
                          <FileText
                            className={`w-10 h-10 transition-transform group-hover:scale-105 ${
                              isSelected ? 'text-indigo-400' : 'text-slate-600'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${
                              isSelected ? 'text-indigo-300' : 'text-slate-500'
                            }`}
                          >
                            Page {idx + 1}
                          </span>

                          {/* Selected Overlay Label */}
                          {isSelected && (
                            <div className="absolute inset-x-0 bottom-0 bg-indigo-600 text-white text-[10px] font-extrabold py-0.5 text-center uppercase tracking-wider">
                              Duplicate
                            </div>
                          )}
                        </div>

                        {/* Page Footer */}
                        <div className="w-full flex items-center justify-between mt-1 text-xs font-medium">
                          <span
                            className={
                              isSelected ? 'text-indigo-300 font-bold' : 'text-slate-400'
                            }
                          >
                            Page {idx + 1}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {isSelected ? 'Clone 1x' : '1x'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Live Output Preview Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {outputPreviewSequence.map((item, seqIdx) => (
                      <div
                        key={`dup-preview-${seqIdx}-${item.origIdx}`}
                        className={`bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between shadow-md ${
                          item.isCopy
                            ? 'border-indigo-500/60 bg-indigo-950/20'
                            : 'border-slate-800'
                        }`}
                      >
                        <div
                          className={`w-full h-32 my-2 rounded-xl border flex flex-col items-center justify-center relative ${
                            item.isCopy
                              ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
                              : 'bg-slate-900/90 border-slate-800 text-slate-400'
                          }`}
                        >
                          <FileText className={`w-10 h-10 ${item.isCopy ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">
                            Page {seqIdx + 1}
                          </span>
                          {item.isCopy && (
                            <div className="absolute inset-x-0 top-0 bg-indigo-600 text-white text-[9px] font-black py-0.5 text-center uppercase tracking-wider">
                              Copy
                            </div>
                          )}
                        </div>
                        <div className="w-full flex items-center justify-between text-xs font-semibold">
                          <span className={item.isCopy ? 'text-indigo-300' : 'text-slate-300'}>
                            #{seqIdx + 1}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.isCopy ? `Clone of #${item.origIdx + 1}` : `Orig #${item.origIdx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {selectedIndices.length === 0 ? (
                  <span className="text-amber-400 font-semibold">
                    Select at least one page to enable duplication.
                  </span>
                ) : (
                  <span>
                    Ready to duplicate <strong className="text-indigo-400">{selectedIndices.length}</strong> page(s). Total output will be <strong className="text-emerald-400">{outputTotalCount}</strong> pages.
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
                  onClick={handleDuplicatePages}
                  disabled={selectedIndices.length === 0}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Copy className="w-5 h-5" />
                  <span>
                    Duplicate {selectedIndices.length > 0 ? `${selectedIndices.length} Page(s)` : 'Pages'}
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
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_duplicated.pdf`}
          onReset={handleReset}
          title="Duplicating PDF Pages"
        />
      </div>
    </motion.div>
  );
};
