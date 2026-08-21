import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ImageService } from '../services/imageService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Minimize2, Image as ImageIcon, Download, Check, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';
import { saveRecentFile } from '../utils/storageUtils';

export const CompressImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.75); // 0.75 = 75% quality
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [result, setResult] = useState<{
    blob: Blob;
    originalSize: number;
    newSize: number;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const t = (file.type || '').toLowerCase();
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!t.startsWith('image/') && !['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }
    setSelectedFile(file);
    setResult(null);
    toast.info(`Selected ${file.name}`);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Compressing image pixel buffer...');
      const compressed = await ImageService.compressImage(selectedFile, {
        quality,
        format,
      });

      setResult(compressed);
      setSuccess('Image compressed successfully!');
      toast.success('Image compressed!');

      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
      const compressedName = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;

      saveRecentFile({
        name: compressedName,
        size: compressed.newSize,
        toolId: 'compress-image',
        toolName: 'Compress Image',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to compress image.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const compressedName = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${compressedName}`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    reset();
  };

  const savedPercent = result
    ? Math.max(0, Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Compress Image"
        description="Reduce JPG, PNG, and WebP image file sizes online with custom compression settings."
        path="/compress-image"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Minimize2}
          title="Compress Image"
          description="Drastically shrink image file sizes without sacrificing visual clarity or sharpness."
          badge="Image Tool"
        />

        {!selectedFile ? (
          <FileUploader
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
            multiple={false}
            buttonText="Choose Image File"
            onFilesSelected={handleFileSelected}
            title="Select Image file to compress"
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
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">Original Size: {formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Quality Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Compression Quality: {Math.round(quality * 100)}%
                  </label>
                  <span className="text-xs font-semibold text-amber-400">
                    {quality <= 0.5 ? 'High Compression' : quality <= 0.8 ? 'Recommended' : 'Best Quality'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
                  <span>Smaller File (10%)</span>
                  <span>Balanced (75%)</span>
                  <span>Best Visuals (95%)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Output Image Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('image/jpeg')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      format === 'image/jpeg'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs block">JPG / JPEG</span>
                    <span className="text-[10px] text-slate-400">Best compression</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('image/webp')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      format === 'image/webp'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs block">WebP</span>
                    <span className="text-[10px] text-slate-400">Modern web standard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('image/png')}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      format === 'image/png'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs block">PNG</span>
                    <span className="text-[10px] text-slate-400">Lossless quality</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action or Result Section */}
            {!result ? (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompress}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-amber-600/20 transition-all cursor-pointer"
                >
                  <Minimize2 className="w-5 h-5" />
                  <span>Compress Image Now</span>
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
                      alt="Compressed Preview"
                      className="w-20 h-20 object-contain rounded-xl bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-emerald-400">{savedPercent}% Smaller</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                          Optimized
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Original: <span className="line-through text-slate-500">{formatBytes(result.originalSize)}</span>{' '}
                        → <span className="font-bold text-white">{formatBytes(result.newSize)}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dimensions: {result.width} x {result.height} px
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Compressed Image
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={result?.blob || null}
          resultFileName={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'image'}_compressed.${format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg'}`}
          originalSize={result?.originalSize}
          newSize={result?.newSize}
          onReset={handleReset}
          title="Compressing Image"
        />
      </div>
    </motion.div>
  );
};
