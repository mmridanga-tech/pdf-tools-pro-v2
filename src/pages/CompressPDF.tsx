import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Minimize2, FileText, Check } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

export const CompressPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'recommended' | 'extreme' | 'less'>('recommended');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setOriginalSize(file.size);
    toast.info(`Selected ${file.name}`);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Compressing PDF stream structures...');
      const res = await PDFService.compressPDF(selectedFile, compressionLevel);

      setResultBlob(res.blob);
      setOriginalSize(res.originalSize);
      setNewSize(res.newSize);
      setSuccess('PDF compressed successfully!');
      toast.success('Compression completed!');

      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
        size: res.newSize,
        toolId: 'compress-pdf',
        toolName: 'Compress PDF',
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
        toolName="Compress PDF"
        description="Reduce PDF file size online while maintaining document quality with zero server uploads."
        path="/compress"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Minimize2}
          title="Compress PDF"
          description="Reduce file size while maintaining maximum PDF document visual quality."
          badge="Popular"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to compress"
            description="or drag and drop your PDF here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* File Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">Original Size: {formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Change File
              </button>
            </div>

            {/* Compression Preset Selector */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Select Compression Level:</h3>

              <div
                role="radiogroup"
                aria-label="Compression level options"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Extreme */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={compressionLevel === 'extreme'}
                  onClick={() => setCompressionLevel('extreme')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                    compressionLevel === 'extreme'
                      ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Extreme Compression</span>
                    {compressionLevel === 'extreme' && <Check className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Maximum file size reduction. Ideal for low-bandwidth sharing.
                  </p>
                </button>

                {/* Recommended */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={compressionLevel === 'recommended'}
                  onClick={() => setCompressionLevel('recommended')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                    compressionLevel === 'recommended'
                      ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Recommended</span>
                    {compressionLevel === 'recommended' && <Check className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Optimal balance between high quality and smaller file size.
                  </p>
                </button>

                {/* Less */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={compressionLevel === 'less'}
                  onClick={() => setCompressionLevel('less')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                    compressionLevel === 'less'
                      ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Less Compression</span>
                    {compressionLevel === 'less' && <Check className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    High quality output with light file size optimization.
                  </p>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompress}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <Minimize2 className="w-5 h-5" />
                <span>Compress PDF Now</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_compressed.pdf`}
          originalSize={originalSize}
          newSize={newSize}
          onReset={handleReset}
          title="Compressing PDF"
        />
      </div>
    </motion.div>
  );
};

