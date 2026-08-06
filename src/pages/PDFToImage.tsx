import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ToolHeader } from '../components/ToolHeader';
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
  Archive,
  CheckSquare,
  Square,
  Sliders,
  Maximize2,
  X,
} from 'lucide-react';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumSuccessCard,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

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
      setIsProcessing(true);
      setProgressPercent(10);
      const results = await ImageService.pdfToImage(
        selectedFile,
        {
          format,
          qualityPreset,
          pagesToExtract: selectedPageNumbers,
        },
        (percent, msg) => {
          setProgressPercent(percent);
        }
      );

      setConvertedPages(results);
      setIsProcessing(false);
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
      setIsProcessing(false);
      const msg = err.message || 'Failed to convert PDF pages to images.';
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
    setIsProcessing(false);
  };

  const currentStep = convertedPages.length > 0 ? 3 : isProcessing ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="PDF to Image"
        description="Convert document pages into high-resolution PNG or JPG image files quickly and securely in your browser."
        path="/pdf-to-image"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={FileImage}
          title="PDF to Image Converter"
          description="Extract individual PDF pages into crisp PNG or JPEG image graphics. Supports custom resolution scaling, page selection, and instant ZIP downloads."
          badge="Image Suite"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {!selectedFile ? (
              <PremiumUploadZone
                accept=".pdf,application/pdf"
                multiple={false}
                onFilesSelected={handleFileSelected}
                title="Drop PDF file here to extract images"
                description="Supports high-resolution PNG & JPG rendering • 100% Client-side privacy"
                buttonText="Select PDF Document"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.99, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                {/* Selected File Card */}
                <PremiumFileCard
                  name={selectedFile.name}
                  size={selectedFile.size}
                  pageCount={thumbnails.length}
                  onReplace={(newFile) => handleFileSelected([newFile])}
                  onRemove={handleReset}
                />

                {isProcessing && (
                  <PremiumProgress
                    progress={progressPercent}
                    statusMessage="Rendering PDF pages to canvas..."
                    stepName="Raster Graphics Pipeline"
                  />
                )}

                {/* Settings & Page Selector (when not yet converted) */}
                {convertedPages.length === 0 && !isProcessing && (
                  <div className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
                    {/* Resolution & Format Configuration */}
                    <div className="bg-[#181824] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-red-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Output Quality & Format Settings
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Format */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Image Format</label>
                          <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                            className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-bold"
                          >
                            <option value="png">PNG (Lossless, Transparent Support)</option>
                            <option value="jpeg">JPEG (Smaller File Size)</option>
                          </select>
                        </div>

                        {/* Resolution */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Resolution Scaling</label>
                          <select
                            value={qualityPreset}
                            onChange={(e) => setQualityPreset(e.target.value as any)}
                            className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-bold"
                          >
                            <option value="standard">Standard DPI (150 DPI - Fast)</option>
                            <option value="hd">High Definition HD (300 DPI - Recommended)</option>
                            <option value="ultrahd">Ultra HD 4K (600 DPI - Crisp Text)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Page Selection Grid Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Select Pages to Extract ({selectedPageNumbers.length} / {thumbnails.length})</span>
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-200 border border-white/10 transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {/* Thumbnails Grid */}
                    {isLoadingThumbnails ? (
                      <div className="p-12 text-center text-slate-400 text-sm space-y-3">
                        <p className="font-semibold text-white">Generating Page Thumbnails ({thumbnailProgress}%)...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {thumbnails.map((t) => {
                          const isSelected = selectedPageNumbers.includes(t.pageNumber);
                          return (
                            <div
                              key={t.pageNumber}
                              onClick={() => handleTogglePage(t.pageNumber)}
                              className={`group relative rounded-2xl p-3 border cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/20'
                                  : 'bg-slate-950/80 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="relative aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                                <img
                                  src={t.thumbnailDataUrl}
                                  alt={`Page ${t.pageNumber}`}
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute top-2 left-2">
                                  {isSelected ? (
                                    <div className="w-5 h-5 rounded-md bg-red-500 text-white flex items-center justify-center shadow">
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md bg-black/60 text-slate-400 border border-white/20 flex items-center justify-center">
                                      <Square className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs font-bold text-white text-center mt-2">
                                Page {t.pageNumber}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Convert Button */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConvert}
                        disabled={selectedPageNumbers.length === 0}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <FileImage className="w-5 h-5" />
                        <span>Extract {selectedPageNumbers.length} Page(s) to Image</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Output Converted Images Grid */}
                {convertedPages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white">Extracted Images ({convertedPages.length})</h3>
                        <p className="text-xs text-slate-400">All pages converted successfully</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {convertedPages.length > 1 && (
                          <button
                            type="button"
                            onClick={handleDownloadAllZip}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                            <span>Download All (ZIP)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        >
                          Convert Another
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {convertedPages.map((page) => {
                        const imgUrl = URL.createObjectURL(page.blob);
                        return (
                          <div
                            key={page.pageNumber}
                            className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 space-y-3 flex flex-col justify-between"
                          >
                            <div className="aspect-[3/4] rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-white/5">
                              <img src={imgUrl} alt={page.fileName} className="w-full h-full object-contain" />
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-bold text-white truncate" title={page.fileName}>
                                Page {page.pageNumber} ({formatBytes(page.blob.size)})
                              </p>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingle(page)}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="PDF to Image"
              supportedFormats={['PDF (.pdf)']}
              tips={[
                'Extract all pages or choose specific page numbers to convert.',
                'Select between PNG for maximum image clarity or JPEG for smaller file size.',
                'High Definition 300 DPI and Ultra HD 600 DPI rendering supported.',
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
