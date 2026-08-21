import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { PDFService } from '../../services/pdfService';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { FileText, RefreshCw, Zap } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const PDFToWordOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['pdf-to-word-online'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected "${file.name}" for conversion to DOCX`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Parsing PDF structures, typography, and tables...');
      const wordBlob = await PDFService.pdfToWord(selectedFile, (percent, msg) => {
        updateProgress(percent, msg || `Building editable DOCX...`);
      });

      setResultBlob(wordBlob);
      setSuccess('PDF successfully converted to editable Word document (.docx)!');
      toast.success('Conversion complete!');

      saveRecentFile({
        name: selectedFile.name.replace(/\.pdf$/i, '.docx'),
        size: wordBlob.size,
        toolId: 'pdf-to-word-online',
        toolName: 'PDF to Word Online',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to convert PDF to Word.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
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
            title="Choose or Drop a PDF File to Convert to Word"
            description="Turn read-only PDF files into editable Microsoft Word (.docx) documents"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">Size: {formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Convert PDF to Editable DOCX Now</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile?.name.replace(/\.pdf$/i, '.docx') || 'document.docx'}
          onReset={handleReset}
          title="Converting PDF to Word"
        />
      </div>
    </SEOLandingTemplate>
  );
};
