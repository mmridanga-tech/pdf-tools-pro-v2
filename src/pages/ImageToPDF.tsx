import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService, ImageToPDFOptions } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Image, FileText, Trash2, ArrowUp, ArrowDown, Plus, FileCode } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

interface SelectedImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageToPDF: React.FC = () => {
  const [images, setImages] = useState<SelectedImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(20);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    const validImageFiles = selectedFiles.filter((f) => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, WebP, SVG).');
      return;
    }

    const newItems: SelectedImageItem[] = validImageFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
    toast.success(`Added ${validImageFiles.length} image${validImageFiles.length > 1 ? 's' : ''}`);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      startProcessing('Compiling image files into PDF document...');
      const filesToProcess = images.map((i) => i.file);
      const pdfBlob = await ImageService.imageToPDF(filesToProcess, {
        orientation,
        margin,
        pageSize,
      });

      setResultBlob(pdfBlob);
      setSuccess('PDF document generated successfully!');
      toast.success('Converted images to PDF!');

      const docName = images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images';
      saveRecentFile({
        name: `${docName}_converted.pdf`,
        size: pdfBlob.size,
        toolId: 'image-to-pdf',
        toolName: 'Image to PDF',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to convert images to PDF.';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Image to PDF"
        description="Convert JPG, PNG, WEBP, and SVG images into a compiled PDF document easily online."
        path="/image-to-pdf"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Image}
          title="Image to PDF Converter"
          description="Transform pictures, graphics, and scanned photos into a crisp, portable PDF document."
          badge="Image Tool"
        />

        {images.length === 0 ? (
          <FileUploader
            accept="image/*"
            multiple={true}
            onFilesSelected={handleFilesSelected}
            title="Select Image files to convert"
            description="JPG, PNG, WebP, SVG images supported"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold text-sm">
                  {images.length}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {images.length} Image{images.length > 1 ? 's' : ''} Selected
                  </p>
                  <p className="text-xs text-slate-400">
                    Total Raw Size: {formatBytes(images.reduce((acc, cur) => acc + cur.file.size, 0))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
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
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto p-2">
              <AnimatePresence>
                {images.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center shadow-lg hover:border-slate-700 transition-all"
                  >
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/80 mb-2">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-slate-300 backdrop-blur-sm">
                        #{idx + 1}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-white truncate w-full text-center px-1">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatBytes(item.file.size)}</p>

                    {/* Quick controls */}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
                        title="Move Left/Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
                        title="Move Right/Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="a4">A4 Standard (210 x 297 mm)</option>
                  <option value="letter">US Letter (8.5 x 11 in)</option>
                  <option value="fit">Auto Fit (Same as Image Dimensions)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="auto">Auto (Match image aspect)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Page Margins</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>No Margin (Full Bleed)</option>
                  <option value={15}>Small Margin (15pt)</option>
                  <option value={30}>Standard Margin (30pt)</option>
                </select>
              </div>
            </div>

            {/* Convert Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Convert to PDF Document</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
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
