import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Stamp, FileText, Eye } from 'lucide-react';

export const WatermarkPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ff0000');
  const [rotation, setRotation] = useState(45);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected ${file.name}`);
  };

  const handleAddWatermark = async () => {
    if (!selectedFile) return;
    if (!watermarkText.trim()) {
      toast.warning('Please enter watermark text.');
      return;
    }

    try {
      startProcessing('Drawing watermark onto PDF pages...');
      const watermarkedBlob = await PDFService.addWatermark(selectedFile, {
        text: watermarkText,
        opacity,
        fontSize,
        color,
        rotation,
      });

      setResultBlob(watermarkedBlob);
      setSuccess('Watermark applied to PDF successfully!');
      toast.success('Watermark added!');
    } catch (err: any) {
      const msg = err.message || 'Failed to apply watermark.';
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
          icon={Stamp}
          title="Watermark PDF"
          description="Stamp custom text watermarks diagonally across your PDF pages for privacy and copyright protection."
          badge="Security"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to watermark"
            description="or drag and drop PDF file here"
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
                  <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Change File
              </button>
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="watermark-text" className="block text-sm font-bold text-white mb-2">
                  Watermark Text
                </label>
                <input
                  id="watermark-text"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="CONFIDENTIAL, DRAFT, DO NOT COPY"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="watermark-color" className="block text-sm font-bold text-white mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="watermark-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-11 rounded-xl cursor-pointer border border-slate-800 p-1 bg-slate-900"
                  />
                  <span className="text-sm font-mono uppercase text-slate-300">{color}</span>
                </div>
              </div>

              <div>
                <label htmlFor="watermark-opacity" className="block text-sm font-bold text-white mb-2">
                  Opacity: {Math.round(opacity * 100)}%
                </label>
                <input
                  id="watermark-opacity"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="watermark-size" className="block text-sm font-bold text-white mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  id="watermark-size"
                  type="range"
                  min="16"
                  max="96"
                  step="4"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Watermark Preview */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span>Watermark Preview</span>
              </div>

              <div className="h-32 rounded-xl bg-slate-950 border border-slate-800/50 flex items-center justify-center overflow-hidden relative">
                <p
                  style={{
                    color: color,
                    opacity: opacity,
                    fontSize: `${Math.min(fontSize, 36)}px`,
                    transform: `rotate(-${rotation}deg)`,
                  }}
                  className="font-black uppercase tracking-widest pointer-events-none select-none transition-all"
                >
                  {watermarkText || 'SAMPLE WATERMARK'}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddWatermark}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
              >
                <Stamp className="w-5 h-5" />
                <span>Apply Watermark</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_watermarked.pdf`}
          onReset={handleReset}
          title="Applying Watermark"
        />
      </div>
    </motion.div>
  );
};
