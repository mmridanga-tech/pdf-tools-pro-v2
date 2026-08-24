import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { CompressPDFSEOContent } from '../components/seo/CompressPDFSEOContent';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';
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
      prev.map((item) =>
        item.status === 'completed' || item.status === 'compressing'
          ? item
          : {
              ...item,
              level: newLevel,
              estimatedSize: PDFCompressionService.estimateCompressedSize(item.size, newLevel),
            }
      )
    );
  };

  const handleItemLevelChange = (id: string, newLevel: CompressionLevel) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id && item.status !== 'compressing' && item.status !== 'completed'
          ? {
              ...item,
              level: newLevel,
              estimatedSize: PDFCompressionService.estimateCompressedSize(item.size, newLevel),
            }
          : item
      )
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
  const completedCount = queue.filter((item) => item.status === 'completed').length;
  const pendingCount = queue.filter((item) => item.status === 'pending').length;
  const totalOriginalSize = queue.reduce((acc, item) => acc + item.size, 0);
  const totalCompressedSize = queue.reduce(
    (acc, item) => acc + (item.compressedSize || item.estimatedSize),
    0
  );
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalSavedPercent = totalOriginalSize > 0 ? Math.round((totalSavedBytes / totalOriginalSize) * 100) : 0;

  const currentStep = completedCount > 0 ? 3 : isProcessingBatch ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="Compress PDF"
        description="Reduce PDF file size online while maintaining document quality with 100% private, browser-based optimization."
        path="/compress"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={Minimize2}
          title="Compress PDF Files"
          description="Reduce PDF file size while preserving document quality, images, and text formatting. Single or batch processing with local privacy."
          badge="Smart PDF Optimizer"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Compression Preset Selector Grid */}
            <div className="bg-[#12131F]/90 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-5 backdrop-blur-xl">
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
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
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
                      : 'border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-400'
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
                      : 'border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-400'
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
                      : 'border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-400'
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
                    className="overflow-hidden bg-[#18181C] border border-white/10 rounded-2xl p-4 space-y-3"
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
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
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
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
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
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
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
            <PremiumUploadZone
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
                className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
              >
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Compression Queue</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/[0.06] text-slate-300 border border-white/10">
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
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50 cursor-pointer"
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
                <div className="bg-[#181824] border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-400 flex items-center justify-center font-bold">
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
                  {queue.map((item, index) => {
                    return (
                      <div key={item.id} className="space-y-2">
                        <PremiumFileCard
                          name={item.name}
                          size={item.size}
                          status={
                            item.status === 'compressing'
                              ? 'processing'
                              : item.status === 'cancelled'
                              ? 'cancelled'
                              : item.status
                          }
                          statusMsg={item.statusMsg}
                          index={index}
                          totalFiles={queue.length}
                          onRemove={() => handleRemoveItem(item.id)}
                          onDownload={item.status === 'completed' ? () => downloadPDF(item) : undefined}
                        />

                        {/* Individual Item Action Strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Preset:</span>
                            {item.status === 'completed' || item.status === 'compressing' ? (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-semibold uppercase text-[10px]">
                                {item.level}
                              </span>
                            ) : (
                              <select
                                value={item.level}
                                onChange={(e) =>
                                  handleItemLevelChange(item.id, e.target.value as CompressionLevel)
                                }
                                className="bg-[#181824] border border-white/10 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                              >
                                <option value="less">Low (Best Quality)</option>
                                <option value="recommended">Medium (Recommended)</option>
                                <option value="extreme">High (Smallest Size)</option>
                              </select>
                            )}

                            {item.status === 'completed' && item.compressedSize && (
                              <span className="text-emerald-400 font-mono font-bold ml-2">
                                {formatBytes(item.compressedSize)} (
                                {item.savingsPercentage && item.savingsPercentage > 0
                                  ? `-${item.savingsPercentage}%`
                                  : '0% saved'}
                                )
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {item.status === 'compressing' && (
                              <button
                                type="button"
                                onClick={() => handleCancelItem(item.id)}
                                className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            {(item.status === 'pending' ||
                              item.status === 'error' ||
                              item.status === 'cancelled') && (
                              <button
                                type="button"
                                onClick={() => compressSingleItem(item.id)}
                                disabled={isProcessingBatch}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                              >
                                <Minimize2 className="w-3 h-3" />
                                <span>Compress File</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="Compress PDF"
              supportedFormats={['PDF (.pdf)']}
              tips={[
                'Choose Medium Compression for the ideal balance between visual quality & size.',
                '100% private client-side engine keeps all document data inside your local browser.',
                'Supports batch compression and instant ZIP download.',
              ]}
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <CompressPDFSEOContent />
      </div>
    </motion.div>
  );
};
