import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { PDFService } from '../../services/pdfService';
import { PDFFileItem } from '../../types/toolTypes';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Layers, ArrowUp, ArrowDown, Trash2, Download, RefreshCw, FileText } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const MergePDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['merge-pdf-online'];
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
    toast.info(`Added ${files.length} file(s) to merge queue`);
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
      startProcessing('Merging PDF files locally in browser RAM...');
      const rawFiles = fileItems.map((item) => item.file);

      const merged = await PDFService.mergePDFs(rawFiles, (percent) => {
        updateProgress(percent, `Merging file batch (${percent}%)...`);
      });

      setResultBlob(merged);
      setSuccess('PDF files merged successfully into a single document!');
      toast.success('Merge complete!');

      saveRecentFile({
        name: 'merged_document.pdf',
        size: merged.size,
        toolId: 'merge-pdf-online',
        toolName: 'Merge PDF Online',
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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  return (
    <SEOLandingTemplate data={data}>
      <div className="space-y-6">
        {fileItems.length === 0 ? (
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            multiple={true}
            title="Choose or Drop PDF Files to Merge"
            description="Select 2 or more PDF documents to combine into a single file"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-400" />
                <span>Selected PDF Queue ({fileItems.length} files)</span>
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {fileItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(item.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === fileItems.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(item.id, item.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleMerge}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Merge {fileItems.length} PDF Files Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName="merged_document.pdf"
          onReset={handleReset}
          title="Merging PDF Documents"
        />
      </div>
    </SEOLandingTemplate>
  );
};
