import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
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
  GripVertical,
  Zap,
} from 'lucide-react';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...images];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setImages(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

  const primaryName = images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images';
  const totalSize = images.reduce((acc, cur) => acc + cur.file.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-12"
    >
      <SEO
        toolName="Image to PDF"
        description="Convert JPG, PNG, WebP, and SVG photos into a PDF document easily online with margin, orientation, and quality controls."
        path="/image-to-pdf"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ToolHeader
          icon={ImageIcon}
          title="Image to PDF Converter"
          description="Transform photos, graphics, and document scans into a crisp, compiled PDF. Customize page sizes, margins, rotation, and orientation."
          badge="Image Tool"
        />

        {images.length === 0 ? (
          <FileUploader
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg, .bmp, .gif"
            multiple={true}
            buttonText="Select Image Files"
            onFilesSelected={handleFilesSelected}
            title="Drag & Drop Image Files Here"
            description="JPG, PNG, WebP, SVG, GIF images supported • Batch conversion ready"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Header & Quick Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold text-sm">
                  {images.length}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {images.length} Image{images.length > 1 ? 's' : ''} Selected
                  </p>
                  <p className="text-xs text-slate-400">
                    Total Raw Size: {formatBytes(totalSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
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
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <p className="text-xs text-slate-400 flex items-center gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <GripVertical className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Tip:</strong> Drag and drop thumbnails to rearrange page order, or use the rotate button to orient images before compiling into PDF.
              </span>
            </p>

            {/* Images Reorderable Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto p-1.5 scrollbar-thin">
              <AnimatePresence>
                {images.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, idx)}
                    onDragOver={(e: any) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative bg-slate-900/90 border rounded-2xl p-3 flex flex-col items-center shadow-lg transition-all ${
                      draggedIndex === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 opacity-60'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge & Zoom Button */}
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/80 mb-2.5">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="w-full h-full object-contain transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-slate-200 backdrop-blur-sm border border-slate-800">
                        Page {idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => setZoomImage(item)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white transition-all backdrop-blur-sm"
                        title="Zoom Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-white truncate w-full text-center px-1">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {formatBytes(item.file.size)} {item.rotation > 0 ? `• ${item.rotation}°` : ''}
                    </p>

                    {/* Controls Row */}
                    <div className="flex items-center gap-1 mt-3">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRotateImage(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                        title="Rotate 90 Clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        disabled={idx === images.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Layout & PDF Formatting Options */}
            <div className="bg-[#18181D] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>PDF Document Formatting Options</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">US Letter (8.5 x 11 in)</option>
                    <option value="fit">Original Size (Fit to Image)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="auto">Auto (Match Image Ratio)</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Page Margin</label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={0}>No Margin (Full Bleed)</option>
                    <option value={15}>Small Margin (15pt)</option>
                    <option value={30}>Medium Margin (30pt)</option>
                    <option value={45}>Large Margin (45pt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Image Quality ({Math.round(quality * 100)}%)
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={0.95}>High Quality (95%)</option>
                    <option value={0.80}>Balanced (80%)</option>
                    <option value={0.60}>Compressed (60%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Convert Action Button */}
            <div className="pt-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Convert Images to PDF</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Zoom Image Modal */}
        <AnimatePresence>
          {zoomImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setZoomImage(null)}
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
                  onClick={() => setZoomImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>{zoomImage.file.name}</span>
                </h3>

                <div className="max-h-[60vh] overflow-auto rounded-2xl bg-black p-2 border border-slate-800">
                  <img
                    src={zoomImage.previewUrl}
                    alt={zoomImage.file.name}
                    style={{ transform: `rotate(${zoomImage.rotation}deg)` }}
                    className="max-h-[55vh] object-contain mx-auto"
                  />
                </div>

                <div className="mt-4 text-xs font-mono text-slate-400">
                  Size: {formatBytes(zoomImage.file.size)} | Rotation: {zoomImage.rotation}°
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${primaryName}_converted.pdf`}
          onReset={handleReset}
          title="Converting Images to PDF"
        />
      </div>
    </motion.div>
  );
};
