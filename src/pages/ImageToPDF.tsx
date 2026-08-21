import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService, ImageToPDFItem } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import { SEO } from '../components/SEO';
import {
  Image as ImageIcon,
  FileText,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  X,
  Zap,
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

interface SelectedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export const ImageToPDF: React.FC = () => {
  const [images, setImages] = useState<SelectedImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(20);
  const [quality, setQuality] = useState<number>(0.92);
  const [zoomImage, setZoomImage] = useState<SelectedImageItem | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    const validImageFiles = selectedFiles.filter((f) => {
      const t = (f.type || '').toLowerCase();
      const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
      return (
        t.startsWith('image/') ||
        ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp', '.gif'].includes(ext)
      );
    });

    if (validImageFiles.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, WebP, SVG).');
      return;
    }

    const newItems: SelectedImageItem[] = validImageFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      rotation: 0,
    }));

    setImages((prev) => [...prev, ...newItems]);
    toast.success(`Added ${validImageFiles.length} image${validImageFiles.length > 1 ? 's' : ''}`);
  };

  const handleRotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newRotation = (item.rotation + 90) % 360;
          return { ...item, rotation: newRotation };
        }
        return item;
      })
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    toast.info('Image removed.');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      startProcessing('Initializing image compiler...');
      const itemsToConvert: ImageToPDFItem[] = images.map((img) => ({
        file: img.file,
        rotation: img.rotation,
      }));

      const pdfBlob = await ImageService.imageToPDF(
        itemsToConvert,
        {
          orientation,
          margin,
          pageSize,
          quality,
        },
        (percent, statusMsg) => {
          updateProgress(percent, statusMsg);
        }
      );

      setResultBlob(pdfBlob);
      setSuccess('PDF document generated successfully!');
      toast.success('Successfully converted images to PDF!');

      const docName = images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images';
      saveRecentFile({
        name: `${docName}_converted.pdf`,
        size: pdfBlob.size,
        toolId: 'image-to-pdf',
        toolName: 'Image to PDF',
        status: 'completed',
      });
      addActivityLog(`Converted ${images.length} images to PDF`, 'Image to PDF');
    } catch (err: any) {
      const msg = err?.message || 'Failed to convert images to PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResultBlob(null);
    reset();
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    const docName = images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images';
    link.download = `${docName}_converted.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded converted PDF!');
  };

  const totalSize = images.reduce((acc, cur) => acc + cur.file.size, 0);
  const currentStep = state.status === 'success' ? 3 : state.status === 'processing' ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="Image to PDF"
        description="Convert JPG, PNG, WebP, and SVG photos into a PDF document easily online with margin, orientation, and quality controls."
        path="/image-to-pdf"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={ImageIcon}
          title="Image to PDF Converter"
          description="Transform photos, graphics, and document scans into a crisp, compiled PDF. Customize page sizes, margins, rotation, and orientation."
          badge="Image Suite"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {state.status === 'processing' && (
              <PremiumProgress
                progress={state.progress}
                statusMessage={state.message || 'Converting images to PDF...'}
                stepName="Raster PDF Compiler"
              />
            )}

            {state.status === 'success' && resultBlob && (
              <PremiumSuccessCard
                title="PDF Generated Successfully!"
                message={`Compiled ${images.length} image(s) into a high-quality single PDF file.`}
                outputFileName={`${images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images'}_converted.pdf`}
                outputFileSize={resultBlob.size}
                pageCount={images.length}
                onDownload={handleDownload}
                onReset={handleReset}
                downloadButtonText="Download PDF Document"
              />
            )}

            {state.status === 'idle' && (
              <>
                {images.length === 0 ? (
                  <PremiumUploadZone
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg, .bmp, .gif"
                    multiple={true}
                    onFilesSelected={handleFilesSelected}
                    title="Drag & Drop Image Files Here"
                    description="JPG, PNG, WebP, SVG, GIF images supported • Batch conversion ready"
                    buttonText="Choose Image Files"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.99, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
                  >
                    {/* Header & Quick Action Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold text-sm">
                          {images.length}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {images.length} Image{images.length > 1 ? 's' : ''} Selected
                          </p>
                          <p className="text-xs text-slate-400">
                            Total Size: {formatBytes(totalSize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Add More
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Page Options Control Box */}
                    <div className="bg-[#181824] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-red-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          PDF Page & Margins Configuration
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        {/* Page Size */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Page Size</label>
                          <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value as any)}
                            className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                          >
                            <option value="a4">A4 (Standard Document)</option>
                            <option value="letter">US Letter</option>
                            <option value="fit">Fit to Image Size</option>
                          </select>
                        </div>

                        {/* Orientation */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Orientation</label>
                          <select
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value as any)}
                            className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                          >
                            <option value="auto">Auto Detect</option>
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                          </select>
                        </div>

                        {/* Margin */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">Margin</label>
                          <select
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                            className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                          >
                            <option value={0}>No Margin (Full Page)</option>
                            <option value={10}>Small (10px)</option>
                            <option value={20}>Medium (20px)</option>
                            <option value={35}>Large (35px)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Image Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg p-3 space-y-2 flex flex-col justify-between"
                        >
                          {/* Image Thumbnail Frame */}
                          <div className="relative aspect-square rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-white/5">
                            <img
                              src={img.previewUrl}
                              alt={img.file.name}
                              className="w-full h-full object-contain transition-transform duration-300"
                              style={{ transform: `rotate(${img.rotation}deg)` }}
                            />

                            <button
                              type="button"
                              onClick={() => setZoomImage(img)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Preview Zoom"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Info & Controls */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-white truncate" title={img.file.name}>
                              {img.file.name}
                            </p>

                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMove(idx, 'left')}
                                  disabled={idx === 0}
                                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(idx, 'right')}
                                  disabled={idx === images.length - 1}
                                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRotateImage(img.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                                  title="Rotate 90°"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Convert Action Button */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConvert}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Convert {images.length} Image(s) to PDF</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="Image to PDF"
              supportedFormats={['JPG (.jpg)', 'PNG (.png)', 'WEBP (.webp)', 'SVG (.svg)']}
              tips={[
                'Reorder images easily using the left & right arrow controls.',
                'Adjust rotation angles per image individually.',
                'Specify margins, orientation, and standard document page dimensions.',
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
