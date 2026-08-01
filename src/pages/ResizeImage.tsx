import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Scaling, Image as ImageIcon, Download, Lock, Unlock, RefreshCw } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

export const ResizeImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.92);

  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
    dataUrl: string;
  } | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const t = (file.type || '').toLowerCase();
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!t.startsWith('image/') && !['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }

    try {
      const img = await ImageService.loadImageFromFile(file);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      setSelectedFile(file);
      setOrigDimensions({ width: w, height: h });
      setTargetWidth(w);
      setTargetHeight(h);
      setResult(null);
      toast.info(`Loaded ${file.name} (${w}x${h}px)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to read image dimensions.');
    }
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (maintainAspect && origDimensions.width > 0) {
      const h = Math.round((origDimensions.height * val) / origDimensions.width);
      setTargetHeight(h);
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (maintainAspect && origDimensions.height > 0) {
      const w = Math.round((origDimensions.width * val) / origDimensions.height);
      setTargetWidth(w);
    }
  };

  const handlePercentagePreset = (pct: number) => {
    if (origDimensions.width === 0) return;
    const newW = Math.round((origDimensions.width * pct) / 100);
    const newH = Math.round((origDimensions.height * pct) / 100);
    setTargetWidth(newW);
    setTargetHeight(newH);
  };

  const handleResize = async () => {
    if (!selectedFile || !targetWidth || !targetHeight) return;

    try {
      startProcessing('Resizing canvas viewport and resampling pixels...');
      const resized = await ImageService.resizeImage(selectedFile, {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: false,
        format,
        quality,
      });

      setResult({
        blob: resized.blob,
        width: resized.width,
        height: resized.height,
        dataUrl: resized.dataUrl,
      });

      setSuccess(`Resized image to ${resized.width}x${resized.height}px!`);
      toast.success('Image resized successfully!');

      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
      const resizedName = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_${resized.width}x${resized.height}.${ext}`;

      saveRecentFile({
        name: resizedName,
        size: resized.blob.size,
        toolId: 'resize-image',
        toolName: 'Resize Image',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to resize image.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const resizedName = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_${result.width}x${result.height}.${ext}`;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resizedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${resizedName}`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
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
        toolName="Resize Image"
        description="Modify image dimensions in pixels or percentages while locking aspect ratio online."
        path="/resize-image"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Scaling}
          title="Resize Image Dimensions"
          description="Scale images to exact dimensions in pixels or percentages for web, print, or mobile."
          badge="Image Tool"
        />

        {!selectedFile ? (
          <FileUploader
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
            multiple={false}
            buttonText="Choose Image File"
            onFilesSelected={handleFileSelected}
            title="Select Image file to resize"
            description="JPG, PNG, WebP, SVG image formats supported"
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
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    Original Resolution: <span className="font-semibold text-white">{origDimensions.width} x {origDimensions.height} px</span> ({formatBytes(selectedFile.size)})
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Quick Percentage Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Quick Scale Presets
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[25, 50, 75, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentagePreset(pct)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Target Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth || ''}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target Height (px)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                      maintainAspect
                        ? 'text-violet-400 bg-violet-500/10 border border-violet-500/20'
                        : 'text-slate-500 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {maintainAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {maintainAspect ? 'Aspect Locked' : 'Aspect Unlocked'}
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight || ''}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('image/png')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    format === 'image/png'
                      ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs block">PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('image/jpeg')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    format === 'image/jpeg'
                      ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs block">JPG / JPEG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('image/webp')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    format === 'image/webp'
                      ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs block">WebP</span>
                </button>
              </div>
            </div>

            {/* Action or Result */}
            {!result ? (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResize}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-violet-600/20 transition-all cursor-pointer"
                >
                  <Scaling className="w-5 h-5" />
                  <span>Resize Image Now</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-6 border-t border-slate-800"
              >
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={result.dataUrl}
                      alt="Resized Preview"
                      className="w-20 h-20 object-contain rounded-xl bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <span className="text-lg font-extrabold text-violet-400">
                        {result.width} x {result.height} px
                      </span>
                      <p className="text-xs text-slate-300 mt-1">
                        New File Size: <span className="font-bold text-white">{formatBytes(result.blob.size)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleResize}
                      className="px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Resized Image
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={result?.blob || null}
          resultFileName={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'image'}_${result?.width || targetWidth}x${result?.height || targetHeight}.${format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg'}`}
          onReset={handleReset}
          title="Resizing Image"
        />
      </div>
    </motion.div>
  );
};
