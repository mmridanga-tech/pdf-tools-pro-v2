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
import { RotateCw, FileText, RefreshCw } from 'lucide-react';
import { SEO } from '../components/SEO';

export const RotatePDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<{ [pageIndex: number]: number }>({});
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
      setPageRotations({});
      toast.info(`Loaded ${file.name} (${count} pages)`);
    } catch (err: any) {
      toast.error('Could not parse PDF page count.');
    }
  };

  const handleRotatePage = (index: number) => {
    setPageRotations((prev) => {
      const newAngle = ((prev[index] || 0) + 90) % 360;
      toast.info(`Page ${index + 1} rotated to ${newAngle}°`);
      return { ...prev, [index]: newAngle };
    });
  };

  const rotateAllPages = (angle: number) => {
    const updated: { [index: number]: number } = {};
    for (let i = 0; i < pageCount; i++) {
      updated[i] = ((pageRotations[i] || 0) + angle) % 360;
    }
    setPageRotations(updated);
    toast.info(`Rotated all pages by ${angle}°`);
  };

  const handleSaveRotatedPDF = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Applying rotations to PDF pages...');
      const rotatedBlob = await PDFService.rotatePDF(selectedFile, pageRotations);
      setResultBlob(rotatedBlob);
      setSuccess('PDF pages rotated successfully!');
      toast.success('Rotation completed!');
    } catch (err: any) {
      const msg = err.message || 'Failed to rotate PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setPageRotations({});
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
        toolName="Rotate PDF"
        description="Rotate PDF pages online clockwise or counterclockwise. Permanently save rotated PDF documents easily."
        path="/rotate"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={RotateCw}
          title="Rotate PDF Pages"
          description="Rotate individual pages or all pages of your PDF document clockwise or counterclockwise."
          badge="Interactive"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to rotate"
            description="or drag and drop single PDF file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* File Info & Global Rotate Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
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

              {/* Bulk Rotate Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => rotateAllPages(90)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate All 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => rotateAllPages(180)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rotate All 180°</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Visual Page Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">
                Click Individual Page Icon to Rotate:
              </h3>
              <PagePreviewGrid
                pageCount={pageCount}
                rotations={pageRotations}
                onRotatePage={handleRotatePage}
              />
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveRotatedPDF}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <RotateCw className="w-5 h-5" />
                <span>Save & Download Rotated PDF</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_rotated.pdf`}
          onReset={handleReset}
          title="Rotating PDF Pages"
        />
      </div>
    </motion.div>
  );
};
