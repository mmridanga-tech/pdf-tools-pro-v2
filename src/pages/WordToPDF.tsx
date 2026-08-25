import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';
import {
  WordConverterService,
  FileQueueItem,
  ConversionEngineMode,
} from '../services/wordConverterService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import {
  FileType,
  Loader2,
  Settings2,
  Cpu,
  Server,
  Sparkles,
  Archive,
} from 'lucide-react';

export const WordToPDF: React.FC = () => {
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [engineMode, setEngineMode] = useState<ConversionEngineMode>('auto');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const toast = useToast();

  const acceptString =
    '.docx,.doc,.odt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text';

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const newItems: FileQueueItem[] = files.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      format: WordConverterService.getFileFormat(file.name),
      status: 'pending',
      progress: 0,
      statusMsg: 'Ready for conversion',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    toast.info(`Added ${files.length} document${files.length > 1 ? 's' : ''} to queue.`);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed from queue.');
  };

  const handleClearQueue = () => {
    setQueue([]);
    toast.info('Cleared queue.');
  };

  const convertSingleItem = async (id: string) => {
    const targetItem = queue.find((item) => item.id === id);
    if (!targetItem || targetItem.status === 'converting') return;

    const startTime = Date.now();
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'converting', progress: 5, statusMsg: 'Starting conversion...' }
          : item
      )
    );

    try {
      const pdfBlob = await WordConverterService.convertToPDF(targetItem.file, {
        engine: engineMode,
        onProgress: (percent, statusMsg) => {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, progress: percent, statusMsg } : item
            )
          );
        },
      });

      const conversionTimeMs = Date.now() - startTime;
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                statusMsg: 'Conversion successful!',
                pdfBlob,
                conversionTimeMs,
              }
            : item
        )
      );
      toast.success(`Converted ${targetItem.name} to PDF!`);
    } catch (err: any) {
      const errorMsg = err?.message || 'Conversion failed.';
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'error', progress: 0, error: errorMsg, statusMsg: errorMsg }
            : item
        )
      );
      toast.error(`Failed to convert ${targetItem.name}: ${errorMsg}`);
    }
  };

  const convertAllQueue = async () => {
    const pendingItems = queue.filter((item) => item.status === 'pending' || item.status === 'error');
    if (pendingItems.length === 0) {
      toast.info('No pending files to convert.');
      return;
    }

    setIsProcessingBatch(true);
    let successCount = 0;

    for (const item of pendingItems) {
      await convertSingleItem(item.id);
      successCount++;
    }

    setIsProcessingBatch(false);
    toast.success(`Batch conversion completed for ${successCount} file(s).`);
  };

  const downloadPDF = (item: FileQueueItem) => {
    if (!item.pdfBlob) return;
    const url = URL.createObjectURL(item.pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    const pdfName = item.name.replace(/\.(docx|doc|odt)$/i, '') + '.pdf';
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${pdfName}`);
  };

  const downloadAllZip = async () => {
    const completedItems = queue.filter((item) => item.status === 'completed' && item.pdfBlob);
    if (completedItems.length === 0) {
      toast.error('No converted PDFs available to download.');
      return;
    }

    try {
      toast.info('Creating ZIP package...');
      const zip = new JSZip();

      completedItems.forEach((item) => {
        const pdfName = item.name.replace(/\.(docx|doc|odt)$/i, '') + '.pdf';
        zip.file(pdfName, item.pdfBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartPDF_Word_Conversions_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded ZIP archive with all PDFs!');
    } catch (err: any) {
      toast.error(`Failed to create ZIP package: ${err?.message}`);
    }
  };

  const completedCount = queue.filter((item) => item.status === 'completed').length;
  const pendingCount = queue.filter((item) => item.status === 'pending').length;
  const currentStep = completedCount > 0 ? 3 : isProcessingBatch ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="Word to PDF"
        description="Convert Microsoft Word DOC and DOCX files into PDF documents quickly with 100% layout accuracy."
        path="/word-to-pdf"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={FileType}
          title="Word & ODT to PDF Converter"
          description="Convert Microsoft Word (.docx, .doc) and OpenDocument (.odt) files with exact layout, fonts, margins, tables, and images."
          badge="High-Fidelity Engine"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Engine Settings Bar */}
            <div className="bg-[#12131F]/90 border border-white/10 rounded-[28px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Engine Mode:</span>
                    <span className="text-red-400 capitalize font-mono">
                      {engineMode === 'auto'
                        ? 'Auto (Client + Server Fallback)'
                        : engineMode === 'client'
                        ? 'Client-Side (Fast & Private)'
                        : 'Server Endpoint API'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Preserves original OpenXML pagination, vector images, styles & document tables
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-red-400" />
                <span>Engine Options</span>
              </button>
            </div>

            {/* Settings Drawer */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#181824] border border-white/10 rounded-2xl p-5 space-y-4"
                >
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-red-400" />
                    <span>Select Converter Engine</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEngineMode('auto')}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        engineMode === 'auto'
                          ? 'bg-red-500/10 border-red-500/40 text-white'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                        <span>Auto Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        High-speed browser renderer with optional server fallback for complex DOCX features.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode('client')}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
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
                        Processes directly inside your browser memory. Ideal for confidential files.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode('server')}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
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
                        Routes document to server-side converter endpoint (/api/convert/word).
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag & Drop Upload Zone */}
            <PremiumUploadZone
              accept={acceptString}
              multiple={true}
              onFilesSelected={handleFilesSelected}
              title="Select Word or ODT Documents"
              description="Supports DOCX, DOC, and ODT file formats • Single or batch upload"
              buttonText="Choose Word Files"
            />

            {/* Queue Management UI */}
            {queue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
              >
                {/* Header & Batch Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Document Conversion Queue</span>
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
                      onClick={convertAllQueue}
                      disabled={isProcessingBatch || pendingCount === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingBatch ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Converting Batch...</span>
                        </>
                      ) : (
                        <>
                          <FileType className="w-3.5 h-3.5" />
                          <span>Convert All Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Queue Item Cards */}
                <div className="space-y-3">
                  {queue.map((item, index) => (
                    <PremiumFileCard
                      key={item.id}
                      name={item.name}
                      size={item.size}
                      status={item.status}
                      statusMsg={item.statusMsg}
                      index={index}
                      totalFiles={queue.length}
                      onConvert={() => convertSingleItem(item.id)}
                      onRemove={() => handleRemoveItem(item.id)}
                      onDownload={item.status === 'completed' ? () => downloadPDF(item) : undefined}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="Word to PDF"
              supportedFormats={['DOCX (.docx)', 'DOC (.doc)', 'ODT (.odt)']}
              tips={[
                'Converts text formatting, fonts, margins, vector shapes, and tables accurately.',
                'Client-side engine renders documents locally inside browser memory for privacy.',
                'Download individual PDFs or batch convert all files into a single ZIP archive.',
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
