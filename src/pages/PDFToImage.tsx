import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService, ConvertedPdfPageImage } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { FileImage, FileText, Download, Check, RefreshCw } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

export const PDFToImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState<number>(2.0); // 2.0 = High DPI (approx 150-200 dpi)
  const [convertedPages, setConvertedPages] = useState<ConvertedPdfPageImage[]>([]);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setConvertedPages([]);
    toast.info(`Selected ${file.name}`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Extracting PDF pages into image elements...');
      const results = await ImageService.pdfToImage(
        selectedFile,
        { format, quality: 0.92, scale },
        (percent, msg) => {
          // Progress updates can be handled here if needed
        }
      );

      setConvertedPages(results);
      setSuccess(`Rendered ${results.length} page${results.length > 1 ? 's' : ''} to image files!`);
      toast.success(`Converted ${results.length} pages!`);

      const totalSize = results.reduce((acc, c) => acc + c.blob.size, 0);
      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_images`,
        size: totalSize,
        toolId: 'pdf-to-image',
        toolName: 'PDF to Image',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to convert PDF pages to images.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDownloadSingle = (page: ConvertedPdfPageImage) => {
    const url = URL.createObjectURL(page.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = page.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${page.fileName}`);
  };

  const handleDownloadAll = () => {
    convertedPages.forEach((page) => {
      handleDownloadSingle(page);
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConvertedPages([]);
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
        toolName="PDF to Image"
        description="Extract PDF pages into PNG or JPG image files quickly in your browser."
        path="/pdf-to-image"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={FileImage}
          title="PDF to Image Converter"
          description="Convert document pages into crisp PNG or JPEG image graphics with custom resolution."
          badge="Image Tool"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to extract images"
            description="Extract pages into PNG or JPG image files"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Selected File Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">File Size: {formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              >
                Change PDF
              </button>
            </div>

            {/* Format and Resolution Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Image Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === 'png'
                        ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>PNG Format</span>
                      {format === 'png' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Lossless & transparent</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === 'jpeg'
                        ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>JPG Format</span>
                      {format === 'jpeg' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Smaller file size</p>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Image Resolution
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1.0}>Standard (100% scale)</option>
                  <option value={1.5}>Medium Density (150% scale)</option>
                  <option value={2.0}>High Quality HD (200% scale)</option>
                  <option value={3.0}>Ultra HD 300 DPI (300% scale)</option>
                </select>
              </div>
            </div>

            {/* Conversion Trigger Button */}
            {convertedPages.length === 0 && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConvert}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <FileImage className="w-5 h-5" />
                  <span>Extract Images Now</span>
                </motion.button>
              </div>
            )}

            {/* Results Grid */}
            {convertedPages.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Extracted Images ({convertedPages.length} pages)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click download on any image page or download all at once.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConvert}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-render
                    </button>
                    <button
                      onClick={handleDownloadAll}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                    >
                      <Download className="w-4 h-4" /> Download All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {convertedPages.map((pg) => (
                    <motion.div
                      key={pg.pageNumber}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 mb-3 flex items-center justify-center">
                          <img
                            src={pg.dataUrl}
                            alt={`Page ${pg.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 text-[11px] font-bold text-white backdrop-blur-md">
                            Page {pg.pageNumber}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate">{pg.fileName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {pg.width} x {pg.height} px • {formatBytes(pg.blob.size)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadSingle(pg)}
                        className="mt-4 w-full py-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Image
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={null}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '') || 'extracted'}_images`}
          onReset={handleReset}
          title="Converting PDF to Images"
        />
      </div>
    </motion.div>
  );
};
