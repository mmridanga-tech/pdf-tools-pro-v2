import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { PDFToWordSEOContent } from '../components/seo/PDFToWordSEOContent';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumSuccessCard,
  PremiumDownloadCard,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';
import {
  PDFToWordService,
  PDFQueueItem,
  PDFToWordEngineMode,
} from '../services/pdfToWordService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import {
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
  Scan,
} from 'lucide-react';

export const PDFToWord: React.FC = () => {
  const [queue, setQueue] = useState<PDFQueueItem[]>([]);
  const [engineMode, setEngineMode] = useState<PDFToWordEngineMode>('auto');
  const [enableOCR, setEnableOCR] = useState(true);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const toast = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const newItems: PDFQueueItem[] = files.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      statusMsg: 'Ready for conversion',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    toast.info(`Added ${files.length} PDF document${files.length > 1 ? 's' : ''} to queue.`);
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
      const docxBlob = await PDFToWordService.convertToWord(targetItem.file, {
        engine: engineMode,
        enableOCR,
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
                statusMsg: 'Converted to Word successfully!',
                docxBlob,
                conversionTimeMs,
              }
            : item
        )
      );
      toast.success(`Converted ${targetItem.name} to DOCX!`);
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
    const pendingItems = queue.filter(
      (item) => item.status === 'pending' || item.status === 'error'
    );
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

  const downloadDOCX = (item: PDFQueueItem) => {
    if (!item.docxBlob) return;
    const url = URL.createObjectURL(item.docxBlob);
    const link = document.createElement('a');
    link.href = url;
    const docxName = item.name.replace(/\.pdf$/i, '') + '.docx';
    link.download = docxName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${docxName}`);
  };

  const downloadAllZip = async () => {
    const completedItems = queue.filter((item) => item.status === 'completed' && item.docxBlob);
    if (completedItems.length === 0) {
      toast.error('No converted DOCX files available to download.');
      return;
    }

    try {
      toast.info('Creating ZIP package...');
      const zip = new JSZip();

      completedItems.forEach((item) => {
        const docxName = item.name.replace(/\.pdf$/i, '') + '.docx';
        zip.file(docxName, item.docxBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartPDF_PDF_To_Word_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded ZIP archive with all DOCX files!');
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
        title="Convert PDF to Word Online Free - High Fidelity DOCX"
        description="Convert PDF files into editable Microsoft Word (.docx) documents preserving layout, fonts, images, tables, and OCR for scanned documents."
        toolName="PDF to Word"
        path="/pdf-to-word"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={FileText}
          title="Production PDF to Word Converter"
          description="Convert PDF files into editable Microsoft Word (.docx) documents preserving layout, fonts, images, tables, hyperlinks, headers and OCR for scanned documents."
          badge="High-Fidelity DOCX Engine"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Engine Settings Bar */}
            <div className="bg-[#12131F]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Engine Mode:</span>
                    <span className="text-blue-400 capitalize font-mono">
                      {engineMode === 'auto'
                        ? 'Auto (Client + Pluggable Server Fallback)'
                        : engineMode === 'client'
                        ? 'Client-Side (Fast & Private)'
                        : 'Server-Side Engine'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Preserves original text, fonts, tables, hyperlinks & graphics with OCR fallback
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-blue-400" />
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
                  className="overflow-hidden bg-[#121320] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Conversion Engine Architecture</span>
                    </h4>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableOCR}
                        onChange={(e) => setEnableOCR(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50"
                      />
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Scan className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enable OCR for Scanned PDFs</span>
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEngineMode('auto')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        engineMode === 'auto'
                          ? 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Auto (Recommended)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Uses fast client-side rendering with server API fallback for maximum fidelity.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode('client')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        engineMode === 'client'
                          ? 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs mb-1">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Client-Side Engine</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        100% browser-based conversion with local OCR. High privacy.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode('server')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        engineMode === 'server'
                          ? 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs mb-1">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                        <span>Server Endpoint API</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Routes PDF directly to pluggable cloud conversion microservice.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium File Upload Zone */}
            <PremiumUploadZone
              accept=".pdf,application/pdf"
              multiple={true}
              onFilesSelected={handleFilesSelected}
              title="Drop PDF documents here to convert to Word"
              description="Supports PDF • Single or Multiple File Queue"
              buttonText="Choose PDF Files"
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
                      <span>PDF Conversion Queue</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
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
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Clear Queue
                    </button>

                    {completedCount > 1 && (
                      <button
                        type="button"
                        onClick={downloadAllZip}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Download All (ZIP)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={convertAllQueue}
                      disabled={isProcessingBatch || pendingCount === 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingBatch ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Converting Batch...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Convert All Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Queue Item Cards */}
                <div className="space-y-3">
                  {queue.map((item, idx) => {
                    const isConverting = item.status === 'converting';
                    const isCompleted = item.status === 'completed';
                    const isError = item.status === 'error';

                    return (
                      <div key={item.id} className="space-y-2">
                        <PremiumFileCard
                          name={item.name}
                          size={item.size}
                          status={item.status}
                          statusMsg={item.statusMsg}
                          onRemove={() => handleRemoveItem(item.id)}
                        />

                        {isConverting && (
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                            <div className="flex justify-between text-xs font-mono text-slate-300">
                              <span>Converting to DOCX...</span>
                              <span className="text-red-400 font-bold">{item.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {isCompleted && item.docxBlob && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                            <span className="text-emerald-300 font-semibold">Word Document Ready</span>
                            <button
                              type="button"
                              onClick={() => downloadDOCX(item)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-md cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download DOCX</span>
                            </button>
                          </div>
                        )}
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
              toolName="PDF to Word"
              supportedFormats={['PDF (.pdf)', 'DOCX (.docx)']}
              tips={[
                'Converts text, formatting, tables, images & hyperlinks accurately.',
                'Enables built-in client OCR for scanned PDF documents automatically.',
                'Use "Download All (ZIP)" when converting multi-file queues.',
              ]}
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <PDFToWordSEOContent />
      </div>
    </motion.div>
  );
};
