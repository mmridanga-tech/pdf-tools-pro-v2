import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { WordToPDFSEOContent } from '../components/seo/WordToPDFSEOContent';
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumSuccessCard,
  PremiumErrorCard,
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
  FileText,
  Loader2,
  ArrowRight,
  RotateCcw,
  Download,
  Settings2,
  Cpu,
  Server,
  Sparkles,
  Archive,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MAX_FILE_SIZE_MB = 50;
const ACCEPT_STRING =
  '.docx,.doc,.odt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text';

export const WordToPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [engineMode, setEngineMode] = useState<ConversionEngineMode>('auto');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Ready for conversion');
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [conversionTimeMs, setConversionTimeMs] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read external backend API base URL from env
  const externalApiBase = (import.meta.env.VITE_WORD_TO_PDF_API_URL as string | undefined)?.trim();
  const activeApiEndpoint = WordConverterService.getBackendApiUrl();

  // Handle incoming file selection (single or multi)
  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    // Reset previous conversion states
    setErrorMessage(null);
    setConvertedPdfBlob(null);

    // Validate files for format & size
    const validFiles: File[] = [];
    for (const f of files) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (!['docx', 'doc', 'odt'].includes(ext)) {
        toast.error(`Unsupported format: "${f.name}". Only Word (.docx, .doc) files are accepted.`);
        return;
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the ${MAX_FILE_SIZE_MB}MB file size limit.`);
        return;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 1) {
      // Single file workflow
      setSelectedFile(validFiles[0]);
      setQueue([]);
      toast.info(`Selected "${validFiles[0].name}" (${formatBytes(validFiles[0].size)})`);
    } else {
      // Multi-file queue workflow
      setSelectedFile(null);
      const newItems: FileQueueItem[] = validFiles.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        format: WordConverterService.getFileFormat(file.name),
        status: 'pending',
        progress: 0,
        statusMsg: 'Ready for conversion',
      }));
      setQueue(newItems);
      toast.info(`Added ${validFiles.length} Word documents to queue.`);
    }
  };

  // Convert single selected file
  const handleConvertSingle = async () => {
    if (!selectedFile || isConverting) return;

    setIsConverting(true);
    setProgress(10);
    setStatusMsg('Initializing Word to PDF conversion engine...');
    setErrorMessage(null);
    setConvertedPdfBlob(null);

    const startTime = Date.now();

    try {
      const pdfBlob = await WordConverterService.convertToPDF(selectedFile, {
        engine: engineMode,
        onProgress: (percent, msg) => {
          setProgress(percent);
          if (msg) setStatusMsg(msg);
        },
      });

      const elapsed = Date.now() - startTime;
      setConversionTimeMs(elapsed);
      setConvertedPdfBlob(pdfBlob);
      setIsConverting(false);
      setProgress(100);
      setStatusMsg('Conversion completed successfully!');

      toast.success(`Successfully converted "${selectedFile.name}" to PDF!`);

      // Automatically trigger download
      triggerAutomaticDownload(pdfBlob, selectedFile.name);
    } catch (err: any) {
      setIsConverting(false);
      const msg = err?.message || 'Word to PDF conversion failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Convert queue items
  const handleConvertQueueItem = async (id: string) => {
    const targetItem = queue.find((item) => item.id === id);
    if (!targetItem || targetItem.status === 'converting') return;

    const startTime = Date.now();
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'converting', progress: 10, statusMsg: 'Connecting to conversion API...' }
          : item
      )
    );

    try {
      const pdfBlob = await WordConverterService.convertToPDF(targetItem.file, {
        engine: engineMode,
        onProgress: (percent, msg) => {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, progress: percent, statusMsg: msg } : item
            )
          );
        },
      });

      const conversionTime = Date.now() - startTime;
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                statusMsg: 'Conversion successful!',
                pdfBlob,
                conversionTimeMs: conversionTime,
              }
            : item
        )
      );

      toast.success(`Converted ${targetItem.name} to PDF!`);
      triggerAutomaticDownload(pdfBlob, targetItem.name);
    } catch (err: any) {
      const msg = err?.message || 'Conversion failed.';
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'error', progress: 0, error: msg, statusMsg: msg }
            : item
        )
      );
      toast.error(`Failed to convert ${targetItem.name}: ${msg}`);
    }
  };

  // Convert all items in queue
  const handleConvertAllQueue = async () => {
    const pending = queue.filter((i) => i.status === 'pending' || i.status === 'error');
    if (pending.length === 0) return;

    setIsConverting(true);
    for (const item of pending) {
      await handleConvertQueueItem(item.id);
    }
    setIsConverting(false);
    toast.success('Batch conversion completed!');
  };

  // Automatic download helper
  const triggerAutomaticDownload = (blob: Blob, originalName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const outputPdfName = originalName.replace(/\.(docx|doc|odt)$/i, '') + '.pdf';
    link.download = outputPdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke memory URL after slight delay to ensure browser handled download
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  };

  // Manual download trigger
  const handleManualDownload = () => {
    if (!convertedPdfBlob || !selectedFile) return;
    triggerAutomaticDownload(convertedPdfBlob, selectedFile.name);
    toast.info('Downloading PDF document...');
  };

  // Reset workflow to convert another file
  const handleConvertAnother = () => {
    setSelectedFile(null);
    setQueue([]);
    setConvertedPdfBlob(null);
    setErrorMessage(null);
    setProgress(0);
    setIsConverting(false);
    setConversionTimeMs(undefined);
  };

  // Derived state for step indicator
  const isCompleted = !!convertedPdfBlob || queue.some((i) => i.status === 'completed');
  const hasFiles = !!selectedFile || queue.length > 0;
  const currentStep = isCompleted ? 3 : isConverting ? 2 : hasFiles ? 2 : 1;

  const completedQueueCount = queue.filter((i) => i.status === 'completed').length;
  const pendingQueueCount = queue.filter((i) => i.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12 text-slate-100"
    >
      <SEO
        title="Word to PDF Converter - Free, High-Fidelity & Secure | SmartPDF AI"
        description="Convert Microsoft Word (.docx, .doc) files to PDF with 100% layout accuracy, preserved formatting, fonts, tables, and images. Fast and secure."
        toolName="Word to PDF"
        path="/word-to-pdf"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={FileType}
          title="Word to PDF Converter"
          description="Convert Microsoft Word documents (.docx, .doc) into high-quality, universally compatible PDF files with pixel-perfect layout preservation."
          badge="High-Fidelity DOCX Engine"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Action Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Engine Status & Options Bar */}
            <div className="bg-[#12131F]/90 border border-white/10 rounded-[28px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>Active Engine:</span>
                    <span className="text-red-400 font-mono">
                      {engineMode === 'server' || (engineMode === 'auto' && externalApiBase)
                        ? 'Backend API Service'
                        : engineMode === 'client'
                        ? 'Client-Side (In-Browser)'
                        : 'Auto (Backend + Client Fallback)'}
                    </span>
                    {externalApiBase && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Custom API Connected
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">
                    Endpoint: <code className="text-slate-300 font-mono text-[10px]">{activeApiEndpoint}</code>
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="word-to-pdf-engine-options-btn"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-red-400" />
                <span>Engine Options</span>
              </button>
            </div>

            {/* Engine Drawer */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#181824] border border-white/10 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-red-400" />
                      <span>Select Conversion Route</span>
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Configure via <code className="text-red-400">VITE_WORD_TO_PDF_API_URL</code>
                    </span>
                  </div>

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
                        <span>Auto (Recommended)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Uses external conversion service if configured, with client-side fallback.
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
                        <span>External Backend API</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Sends multipart/form-data directly to POST /convert/word-to-pdf.
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
                        <span>100% In-Browser</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Processes document locally inside browser memory for total privacy.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Card if conversion failed */}
            {errorMessage && (
              <PremiumErrorCard
                title="Conversion Failed"
                errorMsg={errorMessage}
                onRetry={selectedFile ? handleConvertSingle : undefined}
                onReset={handleConvertAnother}
              />
            )}

            {/* STATE 1: Initial Upload Zone (No files selected yet) */}
            {!selectedFile && queue.length === 0 && !isConverting && !convertedPdfBlob && (
              <PremiumUploadZone
                accept={ACCEPT_STRING}
                multiple={true}
                maxSizeMB={MAX_FILE_SIZE_MB}
                onFilesSelected={handleFilesSelected}
                title="Select Word Documents"
                description="Drag & drop your .doc or .docx files here, or click to choose from your device"
                buttonText="Choose Word Files"
                supportedTypesText="DOCX, DOC (Up to 50MB)"
              />
            )}

            {/* STATE 2: Single File Selected & Ready for Conversion */}
            {selectedFile && !isConverting && !convertedPdfBlob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#12131F]/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl p-6 sm:p-10 space-y-8"
              >
                {/* File Header Details */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Ready to Convert
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Your document is prepared for high-fidelity conversion into PDF format.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConvertAnother}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Change File
                  </button>
                </div>

                {/* Selected File Card */}
                <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-red-500/20 hover:border-red-500/40 transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 to-rose-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                    <FileType className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        {selectedFile.name.split('.').pop()?.toUpperCase() || 'DOCX'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{formatBytes(selectedFile.size)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Big Convert Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    id="word-to-pdf-convert-btn"
                    onClick={handleConvertSingle}
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-lg shadow-[0_15px_40px_rgba(239,68,68,0.4)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.55)] border border-red-400/40 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <span>Convert to PDF</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATE 3: Multi-file Queue Selected */}
            {queue.length > 0 && !isConverting && !convertedPdfBlob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>Document Conversion Queue</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/[0.06] text-slate-300 border border-white/10">
                        {queue.length} file{queue.length > 1 ? 's' : ''}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {completedQueueCount} completed • {pendingQueueCount} pending
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleConvertAnother}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Clear All
                    </button>

                    <button
                      type="button"
                      id="word-to-pdf-convert-all-btn"
                      onClick={handleConvertAllQueue}
                      disabled={pendingQueueCount === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <FileType className="w-3.5 h-3.5" />
                      <span>Convert All to PDF</span>
                    </button>
                  </div>
                </div>

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
                      onConvert={() => handleConvertQueueItem(item.id)}
                      onRemove={() => setQueue((prev) => prev.filter((q) => q.id !== item.id))}
                      onDownload={item.pdfBlob ? () => triggerAutomaticDownload(item.pdfBlob!, item.name) : undefined}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STATE 4: Converting Progress State */}
            {isConverting && (
              <PremiumProgress
                progress={progress}
                statusMessage={statusMsg}
                stepName={progress < 40 ? 'Uploading' : progress < 80 ? 'Processing' : 'Finalizing'}
                estimatedTime="A few moments..."
              />
            )}

            {/* STATE 5: Conversion Success State */}
            {convertedPdfBlob && selectedFile && !isConverting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#121422] via-[#0E101A] to-[#0A0B12] border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-center space-y-8 relative overflow-hidden"
              >
                {/* Emerald Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Animated Success Badge */}
                <div className="relative inline-flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 border border-emerald-300/40 z-10"
                  >
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </motion.div>
                </div>

                {/* Header */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    Your PDF is Ready!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-lg mx-auto font-normal">
                    Your Word document has been converted into a high-fidelity PDF and downloaded automatically.
                  </p>
                </div>

                {/* File Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
                  <div className="col-span-2 sm:col-span-3 pb-3 border-b border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        Generated PDF
                      </span>
                      <span className="block text-xs sm:text-sm font-bold text-white truncate">
                        {selectedFile.name.replace(/\.(docx|doc|odt)$/i, '')}.pdf
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[11px] text-slate-400 font-medium">Output Size</span>
                    <span className="block text-sm font-bold text-white mt-0.5">
                      {formatBytes(convertedPdfBlob.size)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[11px] text-slate-400 font-medium">Original Format</span>
                    <span className="block text-sm font-bold text-white mt-0.5 uppercase">
                      {selectedFile.name.split('.').pop() || 'DOCX'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[11px] text-slate-400 font-medium">Time Elapsed</span>
                    <span className="block text-sm font-bold text-emerald-400 mt-0.5">
                      {conversionTimeMs ? `${(conversionTimeMs / 1000).toFixed(2)}s` : '< 1s'}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    id="word-to-pdf-download-again-btn"
                    onClick={handleManualDownload}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download PDF Again</span>
                  </button>

                  <button
                    type="button"
                    id="word-to-pdf-convert-another-btn"
                    onClick={handleConvertAnother}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-base border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-[0.98]"
                  >
                    <RotateCcw className="w-4.5 h-4.5 text-slate-400" />
                    <span>Convert Another File</span>
                  </button>
                </div>

                {/* Next Steps / Related Tools */}
                <div className="pt-6 border-t border-white/5 text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center sm:text-left">
                    Continue with your PDF:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Link
                      to="/compress-pdf"
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all flex items-center gap-2.5 group"
                    >
                      <Zap className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Compress PDF</span>
                    </Link>

                    <Link
                      to="/merge-pdf"
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all flex items-center gap-2.5 group"
                    >
                      <Archive className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Merge PDFs</span>
                    </Link>

                    <Link
                      to="/protect-pdf"
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all flex items-center gap-2.5 group"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Protect PDF</span>
                    </Link>
                  </div>
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
                'Converts text formatting, typography, margins, vector shapes, headers, and tables with 100% layout fidelity.',
                'Powered by an external backend API microservice via POST /convert/word-to-pdf.',
                'Zero file storage on frontend: all files are processed securely and discarded immediately after download.',
                'Supports both single-document conversion and batch queue processing.',
              ]}
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <WordToPDFSEOContent />
      </div>
    </motion.div>
  );
};
