import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Image as ImageIcon,
  FileType,
  Download,
} from 'lucide-react';
import { formatBytes } from '../../utils/fileUtils';

export interface PremiumFileCardProps {
  id?: string;
  name: string;
  size: number;
  pageCount?: number;
  status?: 'pending' | 'ready' | 'processing' | 'converting' | 'completed' | 'error' | 'cancelled';
  statusMsg?: string;
  index?: number;
  totalFiles?: number;
  onRemove?: () => void;
  onReplace?: (newFile: File) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDownload?: () => void;
  fileType?: string;
  className?: string;
}

export const PremiumFileCard: React.FC<PremiumFileCardProps> = React.memo(({
  name,
  size,
  pageCount,
  status = 'ready',
  statusMsg,
  index,
  totalFiles,
  onRemove,
  onReplace,
  onMoveUp,
  onMoveDown,
  onDownload,
  fileType,
  className = '',
}) => {
  const replaceInputRef = React.useRef<HTMLInputElement>(null);

  const getIcon = () => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'doc' || ext === 'docx') return FileType;
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) return ImageIcon;
    return FileText;
  };

  const IconComponent = getIcon();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative p-4.5 sm:p-5 rounded-2xl bg-[#12131F]/90 hover:bg-[#161726] border border-white/10 hover:border-white/20 shadow-lg backdrop-blur-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      {/* Left: Icon & Info */}
      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-slate-900 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-md">
          <IconComponent className="w-6 h-6" />
          {typeof index === 'number' && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] flex items-center justify-center border border-red-400 shadow-sm">
              {index + 1}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-red-300 transition-colors">
            {name}
          </h4>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-medium mt-1">
            <span>{formatBytes(size)}</span>

            {typeof pageCount === 'number' && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-slate-300">{pageCount} page{pageCount === 1 ? '' : 's'}</span>
              </>
            )}

            {statusMsg && (
              <>
                <span className="text-white/20">•</span>
                <span
                  className={
                    status === 'completed'
                      ? 'text-emerald-400 font-semibold'
                      : status === 'error'
                      ? 'text-red-400 font-semibold'
                      : status === 'processing' || status === 'converting'
                      ? 'text-amber-400 font-semibold animate-pulse'
                      : 'text-slate-400'
                  }
                >
                  {statusMsg}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions (Download, Reorder, Replace, Remove) */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        {onDownload && status === 'completed' && (
          <button
            type="button"
            onClick={onDownload}
            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold px-3"
            title="Download Result"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        )}

        {onMoveUp && typeof index === 'number' && index > 0 && (
          <button
            type="button"
            onClick={onMoveUp}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            title="Move Up"
            aria-label="Move file up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {onMoveDown && typeof index === 'number' && typeof totalFiles === 'number' && index < totalFiles - 1 && (
          <button
            type="button"
            onClick={onMoveDown}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            title="Move Down"
            aria-label="Move file down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {onReplace && (
          <>
            <input
              ref={replaceInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onReplace(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-3"
              title="Replace File"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </button>
          </>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
            title="Remove File"
            aria-label="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
});
