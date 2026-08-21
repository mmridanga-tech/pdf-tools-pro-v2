import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { PDFService } from '../../services/pdfService';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Minimize2, FileText, RefreshCw, Zap } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const CompressPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['compress-pdf-online'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'recommended' | 'extreme' | 'less'>('recommended');
  const [resultData, setResultData] = useState<{ blob: Blob; originalSize: number; newSize: number } | null>(null);
  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected "${file.name}" for compression`);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Compressing PDF stream buffers and downsampling images...');
      const res = await PDFService.compressPDF(selectedFile, level);
      setResultData(res);
      setSuccess(`Compression complete! Reduced file size by ${Math.round((1 - res.newSize / res.originalSize) * 100)}%`);
      toast.success('Compression finished!');

      saveRecentFile({
        name: `compressed_${selectedFile.name}`,
        size: res.newSize,
        toolId: 'compress-pdf-online',
        toolName: 'Compress PDF Online',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to compress PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultData(null);
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
            title="Choose or Drop a PDF File to Compress"
            description="Shrink PDF file size up to 90% without losing text quality"
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
                  <p className="text-xs text-slate-400">Original Size: {formatBytes(selectedFile.size)}</p>
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
                Select Compression Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLevel('recommended')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    level === 'recommended'
                      ? 'bg-red-500/10 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Recommended</p>
                  <p className="text-[10px] text-slate-400 mt-1">Best quality & compression balance</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLevel('extreme')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    level === 'extreme'
                      ? 'bg-red-500/10 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Extreme</p>
                  <p className="text-[10px] text-slate-400 mt-1">Maximum reduction for strict caps</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLevel('less')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    level === 'less'
                      ? 'bg-red-500/10 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Minimal</p>
                  <p className="text-[10px] text-slate-400 mt-1">Light compression, maximum clarity</p>
                </button>
              </div>
            </div>

            <button
              onClick={handleCompress}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Compress PDF File Now</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultData?.blob || null}
          resultFileName={`compressed_${selectedFile?.name || 'document.pdf'}`}
          originalSize={resultData?.originalSize}
          newSize={resultData?.newSize}
          onReset={handleReset}
          title="Compressing PDF Document"
        />
      </div>
    </SEOLandingTemplate>
  );
};
