import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { FileType, ArrowRight } from 'lucide-react';

export const WordToPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected ${file.name}`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Reading Word document and rendering PDF pages...');
      const pdfBlob = await PDFService.wordToPDF(selectedFile);
      setResultBlob(pdfBlob);
      setSuccess('Word document converted to PDF successfully!');
      toast.success('Conversion to PDF complete!');
    } catch (err: any) {
      const msg = err.message || 'Failed to convert Word file to PDF.';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={FileType}
          title="Word to PDF Converter"
          description="Convert Microsoft Word DOC and DOCX files into high-quality PDF documents."
          badge="Conversion"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select Word document (.docx or .doc)"
            description="or drag and drop Word file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Conversion Visual Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold shrink-0">
                  DOCX
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <span>Converts to</span>
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedFile.name.replace(/\.(docx|doc)$/i, '')}.pdf
                  </p>
                  <p className="text-xs text-slate-400">Standard PDF Document</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Choose another file
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <FileType className="w-5 h-5" />
                <span>Convert to PDF</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.(docx|doc)$/i, '')}.pdf`}
          onReset={handleReset}
          title="Converting Word to PDF"
        />
      </div>
    </motion.div>
  );
};
