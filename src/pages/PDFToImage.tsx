import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { FileUploader } from '../components/FileUploader';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService, ConvertedPdfPageImage } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import { SEO } from '../components/SEO';
import {
  FileImage,
  FileText,
  Download,
  Check,
  RefreshCw,
  Sparkles,
  Archive,
  Layers,
  CheckSquare,
  Square,
  Zap,
  ShieldCheck,
  Eye,
  X,
  Maximize2,
  Sliders,
} from 'lucide-react';

interface PdfThumbnail {
  pageNumber: number;
  thumbnailDataUrl: string;
  width: number;
  height: number;
}

export const PDFToImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PdfThumbnail[]>([]);
  const [selectedPageNumbers, setSelectedPageNumbers] = useState<number[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
  const [thumbnailProgress, setThumbnailProgress] = useState<number>(0);

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [qualityPreset, setQualityPreset] = useState<'standard' | 'hd' | 'ultrahd'>('hd');
  const [convertedPages, setConvertedPages] = useState<ConvertedPdfPageImage[]>([]);
  const [previewZoomModal, setPreviewZoomModal] = useState<{ title: string; url: string } | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a valid PDF file.');
      return;
    }

    setSelectedFile(file);
    setConvertedPages([]);
    setThumbnails([]);
    setSelectedPageNumbers([]);
    setIsLoadingThumbnails(true);
    setThumbnailProgress(0);

    try {
      const thumbs = await ImageService.getPdfThumbnails(file, (pct) => {
        setThumbnailProgress(pct);
      });
      setThumbnails(thumbs);
      setSelectedPageNumbers(thumbs.map((t) => t.pageNumber));
      setIsLoadingThumbnails(false);
      toast.success(`Loaded ${thumbs.length} page previews for ${file.name}`);
    } catch (err: any) {
      setIsLoadingThumbnails(false);
      toast.error(`Failed to load page previews: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleTogglePage = (pageNumber: number) => {
    setSelectedPageNumbers((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    setSelectedPageNumbers(thumbnails.map((t) => t.pageNumber));
  };

  const handleDeselectAll = () => {
    setSelectedPageNumbers([]);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    if (selectedPageNumbers.length === 0) {
      toast.error('Please select at least one page to convert.');
      return;
    }

    try {
      startProcessing('Extracting PDF pages into high-resolution images...');
      const results = await ImageService.pdfToImage(
        selectedFile,
        {
          format,
          qualityPreset,
          pagesToExtract: selectedPageNumbers,
        },
        (percent, msg) => {
          updateProgress(percent, msg);
        }
      );

      setConvertedPages(results);
      reset();
      toast.success(`Extracted ${results.length} image page(s)!`);

      const totalSize = results.reduce((acc, c) => acc + c.blob.size, 0);
      saveRecentFile({
        name: `${selectedFile.name.replace(/\.pdf$/i, '')}_extracted_images`,
        size: totalSize,
        toolId: 'pdf-to-image',
        toolName: 'PDF to Image',
        status: 'completed',
      });
      addActivityLog(
        `Extracted ${results.length} pages from ${selectedFile.name} as ${format.toUpperCase()}`,
        'PDF to Image'
      );
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

  const handleDownloadAllZip = async () => {
    if (convertedPages.length === 0) return;

    try {
      toast.info('Creating ZIP archive...');
      const zip = new JSZip();

      convertedPages.forEach((page) => {
        zip.file(page.fileName, page.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = selectedFile?.name.replace(/\.pdf$/i, '') || 'pdf_pages';
      link.download = `${baseName}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Downloaded ZIP archive with all images!');
    } catch (err: any) {
      toast.error(`Failed to create ZIP package: ${err?.message}`);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setThumbnails([]);
    setSelectedPageNumbers([]);
    setConvertedPages([]);
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-12"
    >
      <SEO
        toolName="PDF to Image"
        description="Convert document pages into high-resolution PNG or JPG image files quickly and securely in your browser."
        path="/pdf-to-image"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ToolHeader
          icon={FileImage}
          title="PDF to Image Converter"
          description="Extract individual PDF pages into crisp PNG or JPEG image graphics. Supports custom resolution scaling, page selection, and instant ZIP downloads."
          badge="Image Suite"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf,application/pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Drop PDF file here to extract images"
            description="Supports high-resolution PNG & JPG rendering • 100% Client-side privacy"
            buttonText="Select PDF File"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Selected File Info Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    Size: {formatBytes(selectedFile.size)}{' '}
                    {thumbnails.length > 0 ? `• ${thumbnails.length} Page(s)` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Quality & Format Settings Grid */}
            <div className="bg-[#18181D] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Output Image Format & Quality Settings</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Target Image Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormat('png')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        format === 'png'
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold ring-1 ring-blue-500/30'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold">PNG Format</span>
                        {format === 'png' && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400">Lossless quality & sharp text</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormat('jpeg')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        format === 'jpeg'
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold ring-1 ring-blue-500/30'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold">JPG Format</span>
                        {format === 'jpeg' && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400">Smaller file size & fast sharing</p>
                    </button>
                  </div>
                </div>

                {/* Preset resolution */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Resolution Preset</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQualityPreset('standard')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        qualityPreset === 'standard'
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold">Standard</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">150 DPI (1.0x)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQualityPreset('hd')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        qualityPreset === 'hd'
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-blue-400">HD Recommended</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">200 DPI (2.0x)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQualityPreset('ultrahd')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        qualityPreset === 'ultrahd'
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-amber-400">Ultra HD</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">300 DPI (3.0x)</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Page Thumbnails */}
            {isLoadingThumbnails && (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-full bg-slate-800 rounded-full h-2 max-w-md mx-auto overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-200"
                    style={{ width: `${thumbnailProgress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  Generating Page Previews ({thumbnailProgress}%)...
                </p>
              </div>
            )}

            {/* Page Selection Preview Grid */}
            {!isLoadingThumbnails && thumbnails.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Select Pages to Convert</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Selected {selectedPageNumbers.length} of {thumbnails.length} pages
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[380px] overflow-y-auto p-1 scrollbar-thin">
                  {thumbnails.map((thumb) => {
                    const isSelected = selectedPageNumbers.includes(thumb.pageNumber);

                    return (
                      <div
                        key={thumb.pageNumber}
                        onClick={() => handleTogglePage(thumb.pageNumber)}
                        className={`group relative bg-slate-900 border rounded-2xl p-2.5 flex flex-col items-center cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                            : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                        }`}
                      >
                        {/* Checkbox badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-black/60 border border-slate-600 backdrop-blur-sm" />
                          )}
                        </div>

                        {/* Zoom Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewZoomModal({
                              title: `Page ${thumb.pageNumber}`,
                              url: thumb.thumbnailDataUrl,
                            });
                          }}
                          className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-black/70 hover:bg-black text-slate-300 hover:text-white backdrop-blur-sm transition-all"
                          title="Zoom preview"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>

                        <div className="w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 mb-2 flex items-center justify-center p-1">
                          <img
                            src={thumb.thumbnailDataUrl}
                            alt={`Page ${thumb.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <span className="text-xs font-bold text-white">
                          Page {thumb.pageNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversion Progress Indicator */}
            {state.status === 'processing' && (
              <div className="p-6 text-center bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-full bg-slate-800 rounded-full h-2.5 max-w-md mx-auto overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-200"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {state.message || 'Converting PDF pages...'} ({state.progress}%)
                </p>
              </div>
            )}

            {/* Convert Trigger Button */}
            {convertedPages.length === 0 && state.status !== 'processing' && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConvert}
                  disabled={selectedPageNumbers.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileImage className="w-5 h-5" />
                  <span>
                    Convert {selectedPageNumbers.length} Page{selectedPageNumbers.length > 1 ? 's' : ''} to {format.toUpperCase()}
                  </span>
                </motion.button>
              </div>
            )}

            {/* Extracted Image Results Grid */}
            {convertedPages.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Extracted Images ({convertedPages.length} Pages)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ready to download as individual files or a single ZIP package.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConvert}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-render
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                      <Archive className="w-4 h-4" /> Download All (ZIP)
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
                        <div className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 mb-3 flex items-center justify-center p-2">
                          <img
                            src={pg.dataUrl}
                            alt={`Page ${pg.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 text-[11px] font-bold text-white backdrop-blur-md border border-slate-800">
                            Page {pg.pageNumber}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate">{pg.fileName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {pg.width} x {pg.height} px • {formatBytes(pg.blob.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(pg)}
                        className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* Modal for Zoom Preview */}
        <AnimatePresence>
          {previewZoomModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setPreviewZoomModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden flex flex-col items-center shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setPreviewZoomModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{previewZoomModal.title}</span>
                </h3>

                <div className="max-h-[65vh] overflow-auto rounded-2xl bg-black p-2 border border-slate-800">
                  <img
                    src={previewZoomModal.url}
                    alt={previewZoomModal.title}
                    className="max-h-[60vh] object-contain mx-auto"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
