import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { FileUploader } from '../components/FileUploader';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { CompressPDFSEOContent } from '../components/seo/CompressPDFSEOContent';
import {
  PDFCompressionService,
  PDFCompressQueueItem,
  CompressionLevel,
  CompressionEngineMode,
} from '../services/pdfCompressionService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import {
  Minimize2,
  FileText,
  Trash2,
  Download,
  Loader2,
  RefreshCw,
  Settings2,
  Cpu,
  Server,
  Sparkles,
  Archive,
  Check,
  XCircle,
  TrendingDown,
  Gauge,
  Zap,
  HardDrive,
} from 'lucide-react';

export const CompressPDF: React.FC = () => {
  const [queue, setQueue] = useState<PDFCompressQueueItem[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('recommended');
  const [engineMode, setEngineMode] = useState<CompressionEngineMode>('auto');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const toast = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const pdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      toast.error('Please select valid PDF documents.');
      return;
    }

    const newItems: PDFCompressQueueItem[] = pdfFiles.map((file) => {
      const estimatedSize = PDFCompressionService.estimateCompressedSize(
        file.size,
        compressionLevel
      );

      return {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        level: compressionLevel,
        status: 'pending',
        progress: 0,
        statusMsg: 'Ready for compression',
        estimatedSize,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
    toast.info(`Added ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''} to queue.`);
  };

  const handleLevelChange = (newLevel: CompressionLevel) => {
    setCompressionLevel(newLevel);
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        level: newLevel,
        estimatedSize: PDFCompressionService.estimateCompressedSize(item.size, newLevel),
      }))
    );
  };

  const handleRemoveItem = (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (item?.abortController) {
      item.abortController.abort();
    }
    setQueue((prev) => prev.filter((i) => i.id !== id));
    toast.info('Item removed from queue.');
  };

  const handleClearQueue = () => {
    queue.forEach((item) => {
      if (item.abortController) item.abortController.abort();
    });
    setQueue([]);
    toast.info('Cleared queue.');
  };

  const handleCancelItem = (id: string) => {
    const target = queue.find((i) => i.id === id);
    if (target?.abortController) {
      target.abortController.abort();
    }
    setQueue((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'cancelled',
              progress: 0,
              statusMsg: 'Cancelled by user',
            }
          : i
      )
    );
    toast.info(`Cancelled compression for ${target?.name}`);
  };

  const compressSingleItem = async (id: string) => {
    const targetItem = queue.find((i) => i.id === id);
    if (!targetItem || targetItem.status === 'compressing') return;

    const controller = new AbortController();

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'compressing',
              progress: 5,
              statusMsg: 'Starting compression...',
              abortController: controller,
            }
          : item
      )
    );

    try {
      const res = await PDFCompressionService.compressPDF(targetItem.file, {
        level: targetItem.level,
        engine: engineMode,
        signal: controller.signal,
        onProgress: (percent, statusMsg) => {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, progress: percent, statusMsg } : item
            )
          );
        },
      });

      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                statusMsg: `Saved ${res.savingsPercentage}% (${formatBytes(res.savingsBytes)})`,
                resultBlob: res.blob,
                compressedSize: res.newSize,
                savingsPercentage: res.savingsPercentage,
                durationMs: res.durationMs,
              }
            : item
        )
      );

      saveRecentFile({
        name: `${targetItem.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
        size: res.newSize,
        toolId: 'compress-pdf',
        toolName: 'Compress PDF',
        status: 'completed',
      });
      addActivityLog(`Compressed ${targetItem.name} (-${res.savingsPercentage}%)`, 'Compress PDF');

      toast.success(`Compressed ${targetItem.name} successfully! Saved ${res.savingsPercentage}%.`);
    } catch (err: any) {
      const isCancelled = err?.message?.includes('cancelled');
      const errorMsg = isCancelled ? 'Cancelled by user' : err?.message || 'Compression failed.';

      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: isCancelled ? 'cancelled' : 'error',
                progress: 0,
                error: errorMsg,
                statusMsg: errorMsg,
              }
            : item
        )
      );

      if (!isCancelled) {
        toast.error(`Failed to compress ${targetItem.name}: ${errorMsg}`);
      }
    }
  };

  const compressAllQueue = async () => {
    const pendingItems = queue.filter(
      (item) => item.status === 'pending' || item.status === 'error' || item.status === 'cancelled'
    );

    if (pendingItems.length === 0) {
      toast.info('No pending files to compress.');
      return;
    }

    setIsProcessingBatch(true);
    let successCount = 0;

    for (const item of pendingItems) {
      await compressSingleItem(item.id);
      successCount++;
    }

    setIsProcessingBatch(false);
    toast.success(`Batch compression completed for ${successCount} file(s).`);
  };

  const downloadPDF = (item: PDFCompressQueueItem) => {
    if (!item.resultBlob) return;
    const url = URL.createObjectURL(item.resultBlob);
    const link = document.createElement('a');
    link.href = url;
    const compressedName = `${item.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
    link.download = compressedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${compressedName}`);
  };

  const downloadAllZip = async () => {
    const completedItems = queue.filter((item) => item.status === 'completed' && item.resultBlob);
    if (completedItems.length === 0) {
      toast.error('No compressed PDF files available to download.');
      return;
    }

    try {
      toast.info('Creating ZIP package...');
      const zip = new JSZip();

      completedItems.forEach((item) => {
        const compressedName = `${item.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
        zip.file(compressedName, item.resultBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartPDF_Compressed_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded ZIP archive with all compressed PDFs!');
    } catch (err: any) {
      toast.error(`Failed to create ZIP package: ${err?.message}`);
    }
  };

  // Stats calculation
  const totalOriginalSize = queue.reduce((acc, item) => acc + item.size, 0);
  const totalCompressedSize = queue.reduce(
    (acc, item) => acc + (item.compressedSize || item.estimatedSize),
    0
  );
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalSavedPercent = totalOriginalSize > 0 ? Math.round((totalSavedBytes / totalOriginalSize) * 100) : 0;

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const pendingCount = queue.filter((i) => i.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-12"
    >
      <SEO
        toolName="Compress PDF"
        description="Reduce PDF file size online while maintaining document quality with 100% private, browser-based optimization."
        path="/compress"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ToolHeader
          icon={Minimize2}
          title="Compress PDF Files"
          description="Reduce PDF file size while preserving document quality, images, and text formatting. Single or batch processing with local privacy."
          badge="Smart PDF Optimizer"
        />

        {/* Compression Preset Selector Grid */}
        <div className="bg-[#141417]/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-red-500" />
                <span>Select Compression Preset</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the balance between image quality and file size reduction
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
            >
              <Settings2 className="w-3.5 h-3.5 text-red-400" />
              <span>Engine Mode ({engineMode})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Low Compression (Best Quality) */}
            <button
              type="button"
              onClick={() => handleLevelChange('less')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                compressionLevel === 'less'
                  ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Low Compression</span>
                </span>
                {compressionLevel === 'less' && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Best visual quality. Minimal compression applied for crisp prints & graphics.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ~20% Size Reduction
              </span>
            </button>

            {/* Medium Compression (Recommended) */}
            <button
              type="button"
              onClick={() => handleLevelChange('recommended')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                compressionLevel === 'recommended'
                  ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Medium Compression</span>
                </span>
                {compressionLevel === 'recommended' && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Recommended balance. High document quality with significantly smaller file size.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ~50% Size Reduction
              </span>
            </button>

            {/* High Compression (Smallest File) */}
            <button
              type="button"
              onClick={() => handleLevelChange('extreme')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                compressionLevel === 'extreme'
                  ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  <span>High Compression</span>
                </span>
                {compressionLevel === 'extreme' && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Smallest file size. Ideal for strict email limits & low-bandwidth uploads.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ~75% Size Reduction
              </span>
            </button>
          </div>

          {/* Engine Settings Drawer */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-[#18181C] border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-400" />
                  <span>Optimizer Architecture Selection</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEngineMode('auto')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      engineMode === 'auto'
                        ? 'bg-red-500/10 border-red-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      <span>Auto Mode (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Fast browser canvas + stream compaction with microservice fallback.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineMode('client')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      engineMode === 'client'
                        ? 'bg-red-500/10 border-red-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100% Client-Side</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Runs locally in browser memory. Maximum privacy for sensitive documents.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineMode('server')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      engineMode === 'server'
                        ? 'bg-red-500/10 border-red-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-purple-400" />
                      <span>Server Endpoint API</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Routes PDF to pluggable server-side optimizer API (/api/convert/compress).
                    </p>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drag & Drop File Uploader Dropzone */}
        <FileUploader
          accept=".pdf,application/pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Drop PDF documents here to compress"
          description="Supports single or batch multi-file upload • Up to 100 MB+ files supported"
          buttonText="Select PDF Files"
        />

        {/* Queue Management UI */}
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Compression Queue</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {queue.length} file{queue.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {completedCount} completed • {pendingCount} pending
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleClearQueue}
                  disabled={isProcessingBatch}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  Clear Queue
                </button>

                {completedCount > 1 && (
                  <button
                    type="button"
                    onClick={downloadAllZip}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download All (ZIP)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={compressAllQueue}
                  disabled={isProcessingBatch || pendingCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingBatch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compressing Batch...</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Compress All Queue</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Total Estimated & Actual Savings Bar */}
            <div className="bg-[#18181D] border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Total Original Size</p>
                  <p className="font-mono font-bold text-white text-sm">
                    {formatBytes(totalOriginalSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Est. / Actual Size</p>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {formatBytes(totalCompressedSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Total Space Saved</p>
                  <p className="font-mono font-bold text-red-400 text-sm">
                    {formatBytes(totalSavedBytes)} ({totalSavedPercent}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Queue Item List */}
            <div className="space-y-3">
              {queue.map((item) => {
                const isCompressing = item.status === 'compressing';
                const isCompleted = item.status === 'completed';
                const isError = item.status === 'error';
                const isCancelled = item.status === 'cancelled';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span>Original: {formatBytes(item.size)}</span>
                          <span>•</span>
                          {isCompleted && item.compressedSize ? (
                            <span className="text-emerald-400 font-bold font-mono">
                              Compressed: {formatBytes(item.compressedSize)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">
                              Est: {formatBytes(item.estimatedSize)}
                            </span>
                          )}
                          <span>•</span>
                          <span
                            className={`font-semibold ${
                              isCompleted
                                ? 'text-emerald-400'
                                : isError || isCancelled
                                ? 'text-red-400'
                                : isCompressing
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {item.statusMsg}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isCompressing && (
                      <div className="flex-1 max-w-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Compressing...</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-200 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => downloadPDF(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      )}

                      {isCompressing && (
                        <button
                          type="button"
                          onClick={() => handleCancelItem(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      {(item.status === 'pending' || isError || isCancelled) && (
                        <button
                          type="button"
                          onClick={() => compressSingleItem(item.id)}
                          disabled={isProcessingBatch}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isError || isCancelled ? 'Retry' : 'Compress'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SEO Content Section */}
        <CompressPDFSEOContent />
      </div>
    </motion.div>
  );
};
