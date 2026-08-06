import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RotateCcw, Upload, HelpCircle, ShieldAlert } from 'lucide-react';

interface PremiumErrorCardProps {
  errorMsg?: string;
  onRetry?: () => void;
  onReset?: () => void;
  title?: string;
  className?: string;
}

export const PremiumErrorCard: React.FC<PremiumErrorCardProps> = React.memo(({
  errorMsg = 'An unexpected error occurred while processing your document.',
  onRetry,
  onReset,
  title = 'Processing Failed',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-xl mx-auto p-8 rounded-[28px] bg-[#1A0E12] border border-red-500/40 shadow-2xl backdrop-blur-xl text-center space-y-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-red-200/90 leading-relaxed font-normal bg-red-950/40 p-4 rounded-xl border border-red-500/20 max-w-md mx-auto">
          {errorMsg}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-sm border border-white/10 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-red-400" />
            <span>Choose Another File</span>
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>Need help? Make sure your PDF is not password-encrypted or corrupted.</span>
      </div>
    </motion.div>
  );
});
