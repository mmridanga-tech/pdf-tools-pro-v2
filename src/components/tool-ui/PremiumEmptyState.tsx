import React from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface PremiumEmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onUploadClick?: () => void;
  className?: string;
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = React.memo(({
  title = 'No Document Selected',
  description = 'Upload a PDF or Word document to get started with instant browser processing.',
  buttonText = 'Select Document',
  onUploadClick,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-xl mx-auto p-10 rounded-[32px] bg-[#10111A] border border-white/10 text-center space-y-6 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600/20 via-rose-500/15 to-slate-900 border border-red-500/30 text-red-400 flex items-center justify-center shadow-xl">
          <FileText className="w-10 h-10" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-300/80 leading-relaxed max-w-md mx-auto font-normal">
          {description}
        </p>
      </div>

      {onUploadClick && (
        <div>
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-[0_10px_30px_rgba(239,68,68,0.35)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Upload className="w-5 h-5" />
            <span>{buttonText}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
});
