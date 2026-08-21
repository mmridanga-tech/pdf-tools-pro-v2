import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  FileCheck,
  Download,
  RotateCcw,
  Sparkles,
  Clock,
  HardDrive,
  FileText,
  Share2,
} from 'lucide-react';
import { formatBytes } from '../../utils/fileUtils';

interface PremiumSuccessCardProps {
  title?: string;
  message?: string;
  outputFileName?: string;
  outputFileSize?: number;
  pageCount?: number;
  timeTakenMs?: number;
  onDownload?: () => void;
  onReset?: () => void;
  downloadButtonText?: string;
  className?: string;
}

export const PremiumSuccessCard: React.FC<PremiumSuccessCardProps> = React.memo(({
  title = 'Processing Completed Successfully!',
  message = 'Your document has been processed with high fidelity and zero file uploads.',
  outputFileName,
  outputFileSize,
  pageCount,
  timeTakenMs,
  onDownload,
  onReset,
  downloadButtonText = 'Download File',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#121422] via-[#0E101A] to-[#0A0B12] border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-center space-y-8 relative overflow-hidden ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Success Icon */}
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

      {/* Title & Description */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-lg mx-auto font-normal">
          {message}
        </p>
      </div>

      {/* File Output Info Grid */}
      {(outputFileName || outputFileSize || pageCount || timeTakenMs) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
          {outputFileName && (
            <div className="col-span-2 sm:col-span-3 pb-3 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Output File</span>
                <span className="block text-xs sm:text-sm font-bold text-white truncate">{outputFileName}</span>
              </div>
            </div>
          )}

          {typeof outputFileSize === 'number' && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="block text-[11px] text-slate-400 font-medium">File Size</span>
              <span className="block text-sm font-bold text-white mt-0.5">{formatBytes(outputFileSize)}</span>
            </div>
          )}

          {typeof pageCount === 'number' && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="block text-[11px] text-slate-400 font-medium">Total Pages</span>
              <span className="block text-sm font-bold text-white mt-0.5">{pageCount} page{pageCount === 1 ? '' : 's'}</span>
            </div>
          )}

          {typeof timeTakenMs === 'number' && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="block text-[11px] text-slate-400 font-medium">Execution Time</span>
              <span className="block text-sm font-bold text-emerald-400 mt-0.5">{(timeTakenMs / 1000).toFixed(2)}s</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            <span>{downloadButtonText}</span>
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-base border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-[0.98]"
          >
            <RotateCcw className="w-4.5 h-4.5 text-slate-400" />
            <span>Process Another File</span>
          </button>
        )}
      </div>
    </motion.div>
  );
});
