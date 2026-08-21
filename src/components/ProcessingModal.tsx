import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Download, RotateCcw, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProcessingState } from '../types/toolTypes';
import { formatBytes, downloadBlob } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';

interface ProcessingModalProps {
  state: ProcessingState;
  resultBlob: Blob | null;
  resultFileName: string;
  originalSize?: number;
  newSize?: number;
  onReset: () => void;
  title?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  state,
  resultBlob,
  resultFileName,
  originalSize,
  newSize,
  onReset,
  title = 'Processing Document',
}) => {
  const toast = useToast();

  const handleDownload = () => {
    if (resultBlob) {
      downloadBlob(resultBlob, resultFileName);
      toast.success(`Started download for ${resultFileName}`);
    }
  };


  const savedBytes = originalSize && newSize ? Math.max(0, originalSize - newSize) : 0;
  const savedPercentage =
    originalSize && newSize && originalSize > 0
      ? Math.round(((originalSize - newSize) / originalSize) * 100)
      : null;

  return (
    <AnimatePresence>
      {state.status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-[#141417] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 text-center relative overflow-hidden"
          >
            {/* Top close button when finished or error */}
            {(state.status === 'success' || state.status === 'error') && (
              <button
                onClick={onReset}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Processing State */}
            {state.status === 'processing' && (
              <div className="py-6 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shadow-inner">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400">{state.message || 'Please wait a moment...'}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs font-semibold text-red-400">{state.progress}% Completed</p>
              </div>
            )}

            {/* Success State */}
            {state.status === 'success' && (
              <div className="py-6 space-y-6">
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Your File is Ready!</h3>
                  <p className="text-sm text-slate-400">{state.message}</p>
                </div>

                {/* Compression savings badge if present */}
                {savedPercentage !== null && (
                  savedPercentage > 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm space-y-1">
                      <p className="font-bold text-base">
                        Reduced by {savedPercentage}% ({formatBytes(savedBytes)} saved)!
                      </p>
                      <div className="flex justify-center gap-4 text-xs text-emerald-400">
                        <span>Original: {formatBytes(originalSize!)}</span>
                        <span>→</span>
                        <span className="font-bold">Compressed: {formatBytes(newSize!)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-sm space-y-1">
                      <p className="font-bold text-base">Document Fully Optimized</p>
                      <div className="flex justify-center gap-4 text-xs text-slate-400">
                        <span>Original: {formatBytes(originalSize!)}</span>
                        <span>→</span>
                        <span className="font-bold">Final: {formatBytes(newSize!)}</span>
                      </div>
                    </div>
                  )
                )}

                {/* File Info */}
                <div className="flex items-center gap-3 p-3.5 bg-slate-900 rounded-2xl text-left border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden pr-2">
                    <p className="text-sm font-bold text-white truncate">{resultFileName}</p>
                    {resultBlob && (
                      <p className="text-xs text-slate-400">{formatBytes(resultBlob.size)}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download File</span>
                  </motion.button>

                  <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Process Another File</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {state.status === 'error' && (
              <div className="py-6 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Processing Failed</h3>
                  <p className="text-sm text-red-300 bg-red-950/60 p-3 rounded-xl border border-red-800/80">
                    {state.error || 'An unexpected error occurred while processing your document.'}
                  </p>
                </div>

                <button
                  onClick={onReset}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm shadow-md transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

