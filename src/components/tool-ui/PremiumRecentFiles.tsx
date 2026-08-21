import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, Trash2, Download, CheckCircle2 } from 'lucide-react';
import { getRecentFiles, clearRecentFiles, RecentFileRecord } from '../../utils/storageUtils';
import { formatBytes } from '../../utils/fileUtils';

export const PremiumRecentFiles: React.FC = () => {
  const [recentFiles, setRecentFiles] = useState<RecentFileRecord[]>([]);

  useEffect(() => {
    setRecentFiles(getRecentFiles());
  }, []);

  const handleClear = () => {
    clearRecentFiles();
    setRecentFiles([]);
  };

  if (recentFiles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 p-6 sm:p-8 rounded-[24px] bg-[#12131F]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4"
    >
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-white">Recent Processed Documents</h3>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recentFiles.map((file) => (
          <div
            key={file.id}
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-red-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {file.toolName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
