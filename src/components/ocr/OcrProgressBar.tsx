import React from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, ScanText } from 'lucide-react';

interface OcrProgressBarProps {
  progressPercent: number;
  statusMessage: string;
  activePage?: number;
  totalPages?: number;
}

export const OcrProgressBar: React.FC<OcrProgressBarProps> = ({
  progressPercent,
  statusMessage,
  activePage = 0,
  totalPages = 0,
}) => {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-amber-400 flex items-center gap-2">
          <ScanText className="w-4 h-4 animate-pulse" />
          <span>{statusMessage || 'Processing OCR Recognition...'}</span>
        </span>
        <span className="text-slate-300 font-mono">{progressPercent}%</span>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
        <motion.div
          className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Page Progress Pills */}
      {totalPages > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isDone = pageNum < activePage || progressPercent >= 90;
            const isCurrent = pageNum === activePage && progressPercent < 90;

            return (
              <div
                key={pageNum}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 border transition-all ${
                  isDone
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-mono text-[10px]">
                    {pageNum}
                  </span>
                )}
                <span>Page {pageNum}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
