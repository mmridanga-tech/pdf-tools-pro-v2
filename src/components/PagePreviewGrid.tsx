import React from 'react';
import { RotateCw, Check, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface PagePreviewGridProps {
  pageCount: number;
  rotations?: { [pageIndex: number]: number };
  onRotatePage?: (pageIndex: number) => void;
  selectedPages?: number[];
  onTogglePageSelect?: (pageIndex: number) => void;
}

export const PagePreviewGrid: React.FC<PagePreviewGridProps> = ({
  pageCount,
  rotations = {},
  onRotatePage,
  selectedPages,
  onTogglePageSelect,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: pageCount }).map((_, idx) => {
        const rotation = rotations[idx] || 0;
        const isSelected = selectedPages ? selectedPages.includes(idx) : true;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            onClick={() => onTogglePageSelect && onTogglePageSelect(idx)}
            onKeyDown={(e) => {
              if (onTogglePageSelect && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onTogglePageSelect(idx);
              }
            }}
            tabIndex={onTogglePageSelect ? 0 : undefined}
            role={onTogglePageSelect ? 'checkbox' : undefined}
            aria-checked={onTogglePageSelect ? isSelected : undefined}
            aria-label={`Page ${idx + 1}`}
            className={`group relative bg-[#141417] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
              onTogglePageSelect ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-red-500/80 shadow-lg shadow-red-500/10 ring-2 ring-red-500/30'
                : 'border-slate-800 opacity-50 hover:opacity-100'
            }`}
          >
            {/* Checkbox indicator */}
            {onTogglePageSelect && (
              <div
                className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected ? 'bg-red-600 text-white shadow' : 'border border-slate-700 bg-slate-900'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
            )}

            {/* Page visual representation */}
            <div className="w-full h-32 my-2 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-800/80 transition-colors">
              <div
                className="transition-transform duration-300 ease-out flex flex-col items-center justify-center"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <FileText className="w-10 h-10 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-wider">
                  Page {idx + 1}
                </span>
              </div>
            </div>

            {/* Page number & individual rotation button */}
            <div className="w-full flex items-center justify-between mt-1 text-xs text-slate-400 font-medium">
              <span className="font-semibold text-slate-300">Page {idx + 1}</span>

              {onRotatePage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(idx);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

