import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { PDFService } from '../../services/pdfService';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Scissors, FileText, RefreshCw, Layers } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const SplitPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['split-pdf-online'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeStr, setRangeStr] = useState<string>('1-2');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    try {
      const pageCount = await PDFService.getPageCount(file);
      setTotalPages(pageCount);
      setRangeStr(`1-${Math.min(2, pageCount)}`);
      toast.info(`Loaded "${file.name}" (${pageCount} pages)`);
    } catch {
      toast.error('Could not read PDF page count.');
    }
  };

  const handleSplit = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Extracting specified pages from PDF...');
      const splitBlob = await PDFService.splitPDF(selectedFile, rangeStr);
      setResultBlob(splitBlob);
      setSuccess('PDF split successfully!');
      toast.success('PDF split complete!');

      saveRecentFile({
        name: `split_${selectedFile.name}`,
        size: splitBlob.size,
        toolId: 'split-pdf-online',
        toolName: 'Split PDF Online',
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
    setTotalPages(0);
    setResultBlob(null);
    reset();
  };

  return (
    <SEOLandingTemplate data={data}>
      <div className="space-y-6">
        {!selectedFile ? (
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept=".pdf"
            multiple={false}
            title="Choose or Drop a PDF File to Split"
            description="Select a multi-page PDF document to extract pages or custom ranges"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • {totalPages} Pages total
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Enter Page Ranges or Page Numbers (e.g., "1-3, 5, 7-10"):
              </label>
              <input
                type="text"
                value={rangeStr}
                onChange={(e) => setRangeStr(e.target.value)}
                placeholder="1-2, 4, 6-8"
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
              <p className="text-xs text-slate-400">
                Tip: Enter <span className="text-red-400 font-bold">1-{totalPages}</span> to extract all pages, or specify custom ranges.
              </p>
            </div>

            <button
              onClick={handleSplit}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>Split & Extract Specified Pages</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`split_${selectedFile?.name || 'document.pdf'}`}
          onReset={handleReset}
          title="Splitting PDF Document"
        />
      </div>
    </SEOLandingTemplate>
  );
};
