import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { PagePreviewGrid } from '../components/PagePreviewGrid';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Scissors, FileText } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

export const SplitPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [selectedPageIndices, setSelectedPageIndices] = useState<number[]>([0]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);

    try {
      const count = await PDFService.getPageCount(file);
      setPageCount(count);
      setRangeInput(`1-${Math.min(count, 3)}`);
      setSelectedPageIndices(Array.from({ length: Math.min(count, 3) }, (_, i) => i));
      toast.info(`Loaded ${file.name} (${count} pages)`);
    } catch (err: any) {
      toast.error('Could not parse PDF page count.');
    }
  };

  const handleTogglePageSelect = (index: number) => {
    let updated: number[];
    if (selectedPageIndices.includes(index)) {
      updated = selectedPageIndices.filter((i) => i !== index);
    } else {
      updated = [...selectedPageIndices, index].sort((a, b) => a - b);
    }
    setSelectedPageIndices(updated);

    // Update text range display
    if (updated.length > 0) {
      setRangeInput(updated.map((i) => i + 1).join(', '));
    } else {
      setRangeInput('');
    }
  };

  const handleSplit = async () => {
    if (!selectedFile) return;

    if (!rangeInput.trim()) {
      toast.warning('Please enter or select at least one page to split.');
      return;
    }

    try {
      startProcessing('Extracting selected pages...');
      const splitBlob = await PDFService.splitPDF(selectedFile, rangeInput);
      setResultBlob(splitBlob);
      setSuccess('PDF pages extracted successfully!');
      toast.success('PDF split complete!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_split.pdf`,
        size: splitBlob.size,
        toolId: 'split-pdf',
        toolName: 'Split PDF',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to split PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setResultBlob(null);
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
        toolName="Split PDF"
        description="Extract specific pages or custom page ranges from your PDF document easily online."
        path="/split"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Scissors}
          title="Split PDF File"
          description="Extract specific pages or page ranges from your PDF into a new separate PDF file."
          badge="Fast"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to split"
            description="or drag and drop single PDF file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* File Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • Total Pages: {pageCount}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Change PDF
              </button>
            </div>

            {/* Range Controls */}
            <div className="space-y-4">
              <label htmlFor="range-input" className="block text-sm font-bold text-white">
                Split Range / Page Numbers
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="range-input"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7-10"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/80 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRangeInput(`1-${pageCount}`);
                    setSelectedPageIndices(Array.from({ length: pageCount }, (_, i) => i));
                    toast.info('Selected all pages');
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Select All
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Type range (e.g. "1-3, 5") or click pages below to select.
              </p>
            </div>

            {/* Visual Page Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Click Pages to Include:</h3>
              <PagePreviewGrid
                pageCount={pageCount}
                selectedPages={selectedPageIndices}
                onTogglePageSelect={handleTogglePageSelect}
              />
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSplit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <Scissors className="w-5 h-5" />
                <span>Split & Download Pages</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_split.pdf`}
          onReset={handleReset}
          title="Splitting PDF"
        />
      </div>
    </motion.div>
  );
};

