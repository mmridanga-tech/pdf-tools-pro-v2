import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Cpu, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PremiumProgressProps {
  progress: number; // 0 - 100
  statusMessage?: string;
  stepName?: 'Uploading' | 'Reading' | 'Processing' | 'Rendering' | 'Finalizing' | string;
  estimatedTime?: string;
  className?: string;
}

export const PremiumProgress: React.FC<PremiumProgressProps> = React.memo(({
  progress,
  statusMessage = 'Processing document...',
  stepName = 'Processing',
  estimatedTime,
  className = '',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`w-full max-w-xl mx-auto p-8 rounded-[28px] bg-gradient-to-b from-[#121320] to-[#0D0E17] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-center space-y-6 ${className}`}
    >
      {/* Icon & Pulse FX */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg border border-red-400/40 z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>

      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">
          <Cpu className="w-3.5 h-3.5 text-red-400 animate-spin" />
          <span>{stepName}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {statusMessage}
        </h3>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-400">Completion Status</span>
          <span className="text-red-400 font-mono text-base">{Math.round(normalizedProgress)}%</span>
        </div>

        <div className="relative w-full h-3.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${normalizedProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Shimmer Light Bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>WebAssembly Engine</span>
        </span>

        {estimatedTime ? (
          <span className="text-slate-400">{estimatedTime}</span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted in RAM</span>
          </span>
        )}
      </div>
    </motion.div>
  );
});
