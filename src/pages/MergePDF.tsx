import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { PDFFileItem } from '../types/toolTypes';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Layers, ArrowUp, ArrowDown, Trash2, Plus, FileText } from 'lucide-react';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Layers}
          title="Merge PDF Files"
          description="Combine multiple PDF files into one single organized PDF document in your browser."
          badge="Essential"
        />

        {/* Upload Zone or File List */}
        {fileItems.length === 0 ? (
          <FileUploader
            accept=".pdf"
            multiple={true}
            onFilesSelected={handleFilesSelected}
            title="Select PDF files to merge"
            description="or drag & drop multiple PDF files here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Selected PDFs ({fileItems.length})</span>
              </h2>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shadow-sm focus-within:ring-2 focus-within:ring-red-500/50">
                <Plus className="w-4 h-4" aria-hidden="true" />
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
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  role="listitem"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatBytes(item.size)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label={`Move ${item.name} up`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === fileItems.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label={`Move ${item.name} down`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(item.id, item.name)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label={`Remove ${item.name}`}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Merge Action Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setFileItems([]);
                  toast.info('Cleared file list');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Clear all files
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMerge}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <Layers className="w-5 h-5" />
                <span>Merge PDF Files</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Processing Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName="merged_document.pdf"
          onReset={handleReset}
          title="Merging PDFs"
        />
      </div>
    </motion.div>
  );
};
