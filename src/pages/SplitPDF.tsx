import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PagePreviewGrid } from '../components/PagePreviewGrid';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Scissors, FileText, Check, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';
import { SplitPDFSEOContent } from '../components/seo/SplitPDFSEOContent';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumSuccessCard,
  PremiumErrorCard,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';

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

  const handleDownload = () => {
    if (!resultBlob || !selectedFile) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFile.name.replace(/\.pdf$/i, '')}_split.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded split PDF document!');
  };

  const currentStep = state.status === 'success' ? 3 : state.status === 'processing' ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="Split PDF"
        description="Extract specific pages or custom page ranges from your PDF document easily online."
        path="/split"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={Scissors}
          title="Split PDF File"
          description="Extract specific pages or page ranges from your PDF into a new separate PDF file."
          badge="Precision Extractor"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {state.status === 'processing' && (
              <PremiumProgress
                progress={state.progress}
                statusMessage={state.message || 'Splitting PDF document...'}
                stepName="Extracting Pages"
              />
            )}

            {state.status === 'error' && (
              <PremiumErrorCard
                errorMsg={state.message || 'Failed to split PDF.'}
                onRetry={handleSplit}
                onReset={handleReset}
              />
            )}

            {state.status === 'success' && resultBlob && selectedFile && (
              <PremiumSuccessCard
                title="PDF Extracted Successfully!"
                message="Your custom page selection has been saved into a new standalone PDF file."
                outputFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}_split.pdf`}
                outputFileSize={resultBlob.size}
                pageCount={selectedPageIndices.length}
                onDownload={handleDownload}
                onReset={handleReset}
                downloadButtonText="Download Split PDF"
              />
            )}

            {state.status === 'idle' && (
              <>
                {!selectedFile ? (
                  <PremiumUploadZone
                    accept=".pdf,application/pdf"
                    multiple={false}
                    onFilesSelected={handleFileSelected}
                    title="Select PDF file to split"
                    description="Drag & drop a PDF document or choose from device"
                    buttonText="Choose PDF File"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-8"
                  >
                    {/* File Card */}
                    <PremiumFileCard
                      name={selectedFile.name}
                      size={selectedFile.size}
                      pageCount={pageCount}
                      onReplace={(newFile) => handleFileSelected([newFile])}
                      onRemove={handleReset}
                    />

                    {/* Range Controls */}
                    <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center justify-between">
                        <label htmlFor="range-input" className="block text-sm font-bold text-white">
                          Split Range / Page Numbers
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setRangeInput(`1-${pageCount}`);
                            setSelectedPageIndices(Array.from({ length: pageCount }, (_, i) => i));
                            toast.info('Selected all pages');
                          }}
                          className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition-colors shadow-sm cursor-pointer"
                        >
                          Select All ({pageCount} Pages)
                        </button>
                      </div>

                      <input
                        id="range-input"
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="e.g. 1-3, 5, 7-10"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-mono text-sm shadow-inner"
                      />
                      <p className="text-xs text-slate-400">
                        Enter comma-separated page numbers or ranges (e.g. "1-3, 5") or click thumbnails below.
                      </p>
                    </div>

                    {/* Visual Page Grid */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white">Interactive Page Visualizer:</h3>
                      <PagePreviewGrid
                        pageCount={pageCount}
                        selectedPages={selectedPageIndices}
                        onTogglePageSelect={handleTogglePageSelect}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSplit}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
                      >
                        <Scissors className="w-5 h-5" />
                        <span>Extract & Download Selected Pages</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="Split PDF"
              supportedFormats={['PDF (.pdf)']}
              tips={[
                'Click individual page thumbnails to toggle selection on or off.',
                'Specify custom ranges such as 1-5, 8, 11-15.',
                'Preserves vector fidelity and embedded text searchability.',
              ]}
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <SplitPDFSEOContent />
      </div>
    </motion.div>
  );
};
