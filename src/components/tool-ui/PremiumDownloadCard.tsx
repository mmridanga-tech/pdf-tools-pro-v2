import React from 'react';
import { motion } from 'motion/react';
import { Download, RotateCcw, FileCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { formatBytes } from '../../utils/fileUtils';

interface PremiumDownloadCardProps {
  fileName: string;
  fileSize?: number;
  onDownload: () => void;
  onReset: () => void;
  downloadLabel?: string;
  resetLabel?: string;
  className?: string;
}

export const PremiumDownloadCard: React.FC<PremiumDownloadCardProps> = React.memo(({
  fileName,
  fileSize,
  onDownload,
  onReset,
  downloadLabel = 'Download Processed File',
  resetLabel = 'Convert Another File',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-xl mx-auto p-8 rounded-[28px] bg-[#121322] border border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
        <FileCheck className="w-7 h-7" />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          Your File is Ready!
        </h3>
        <p className="text-sm font-semibold text-slate-300 truncate max-w-sm mx-auto">
          {fileName}
        </p>
        {typeof fileSize === 'number' && (
          <span className="inline-block mt-1 text-xs text-slate-400 font-medium">
            Size: {formatBytes(fileSize)}
          </span>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onDownload}
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-[0_10px_30px_rgba(239,68,68,0.35)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Download className="w-5 h-5" />
          <span>{downloadLabel}</span>
        </button>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onDownload}
            className="text-xs text-slate-400 hover:text-white underline font-semibold transition-colors cursor-pointer"
          >
            Download Again
          </button>

          <span className="text-white/20">•</span>

          <button
            type="button"
            onClick={onReset}
            className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetLabel}</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
        <ShieldCheck className="w-4 h-4" />
        <span>Verified zero-log client memory processing</span>
      </div>
    </motion.div>
  );
});
