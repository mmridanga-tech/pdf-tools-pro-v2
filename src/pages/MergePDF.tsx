import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { PDFFileItem } from '../types/toolTypes';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Layers, Plus, FileText, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';
import { MergePDFSEOContent } from '../components/seo/MergePDFSEOContent';
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

export const MergePDF: React.FC = () => {
  const [fileItems, setFileItems] = useState<PDFFileItem[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFilesSelected = (files: File[]) => {
    const newItems: PDFFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
    }));

    setFileItems((prev) => [...prev, ...newItems]);
    toast.info(`Added ${files.length} file(s) to merge list`);
  };

  const removeFile = (id: string, fileName: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
    toast.info(`Removed ${fileName}`);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fileItems.length) return;

    const updated = [...fileItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFileItems(updated);
  };

  const handleMerge = async () => {
    if (fileItems.length < 2) {
      toast.warning('Please select at least 2 PDF files to merge.');
      return;
    }

    try {
      startProcessing('Merging PDF files together...');
      const rawFiles = fileItems.map((item) => item.file);

      const merged = await PDFService.mergePDFs(rawFiles, (percent) => {
        updateProgress(percent, `Merging file batch (${percent}%)...`);
      });

      setResultBlob(merged);
      setSuccess('PDF files merged successfully into one document!');
      toast.success('Merge complete!');

      saveRecentFile({
        name: 'merged_document.pdf',
        size: merged.size,
        toolId: 'merge-pdf',
        toolName: 'Merge PDF',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to merge PDF files.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setResultBlob(null);
    reset();
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded merged PDF document!');
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
        toolName="Merge PDF"
        description="Combine multiple PDF documents into one single unified PDF file quickly and securely inside your browser."
        path="/merge"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={Layers}
          title="Merge PDF Files"
          description="Combine multiple PDF files into one single organized PDF document in your browser."
          badge="Essential Suite"
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
                statusMessage={state.message || 'Merging PDF files...'}
                stepName="Merging Engine"
              />
            )}

            {state.status === 'error' && (
              <PremiumErrorCard
                errorMsg={state.message || 'Failed to merge PDFs.'}
                onRetry={handleMerge}
                onReset={handleReset}
              />
            )}

            {state.status === 'success' && resultBlob && (
              <PremiumSuccessCard
                title="PDFs Merged Successfully!"
                message="All selected documents have been merged into a single high-quality PDF file."
                outputFileName="merged_document.pdf"
                outputFileSize={resultBlob.size}
                pageCount={fileItems.length}
                onDownload={handleDownload}
                onReset={handleReset}
                downloadButtonText="Download Merged PDF"
              />
            )}

            {state.status === 'idle' && (
              <>
                {fileItems.length === 0 ? (
                  <PremiumUploadZone
                    accept=".pdf,application/pdf"
                    multiple={true}
                    onFilesSelected={handleFilesSelected}
                    title="Select PDF files to merge"
                    description="Drag & drop multiple PDF files or select from device"
                    buttonText="Choose PDF Files"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Selected PDFs ({fileItems.length})</span>
                      </h2>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white text-xs font-bold border border-white/10 transition-all shadow-sm">
                        <Plus className="w-4 h-4 text-red-400" aria-hidden="true" />
                        <span>Add More Files</span>
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                          }}
                        />
                      </label>
                    </div>

                    {/* List of files with reorder buttons */}
                    <div className="space-y-3" role="list" aria-label="PDF files to merge">
                      {fileItems.map((item, index) => (
                        <PremiumFileCard
                          key={item.id}
                          name={item.name}
                          size={item.size}
                          index={index}
                          totalFiles={fileItems.length}
                          onMoveUp={() => moveFile(index, 'up')}
                          onMoveDown={() => moveFile(index, 'down')}
                          onRemove={() => removeFile(item.id, item.name)}
                        />
                      ))}
                    </div>

                    {/* Merge Action Button */}
                    <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFileItems([]);
                          toast.info('Cleared file list');
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Clear all files
                      </button>

                      <button
                        type="button"
                        onClick={handleMerge}
                        disabled={fileItems.length < 2}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Layers className="w-5 h-5" />
                        <span>Merge {fileItems.length} PDF Files</span>
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
              toolName="Merge PDF"
              supportedFormats={['PDF (.pdf)']}
              tips={[
                'Reorder PDF files using up and down arrows before merging.',
                'Supports merging large multi-page PDF files lightning fast.',
                'Combines bookmarks, vector graphics, and text layers cleanly.',
              ]}
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <MergePDFSEOContent />
      </div>
    </motion.div>
  );
};
