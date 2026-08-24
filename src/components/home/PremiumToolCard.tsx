import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PDFTool } from '../../types/toolTypes';
import {
  Layers,
  Scissors,
  Trash2,
  FileOutput,
  ArrowUpDown,
  Copy,
  Minimize2,
  FileText,
  FileType,
  RotateCw,
  Stamp,
  Hash,
  ScanText,
  Lock,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  FileImage,
  Scaling,
  Unlock,
  Star,
  ArrowUpRight,
  Wrench,
  FileSpreadsheet,
  Table,
  Presentation,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Scissors,
  Trash2,
  FileOutput,
  ArrowUpDown,
  Copy,
  Minimize2,
  FileText,
  FileType,
  FileSpreadsheet,
  Table,
  Presentation,
  RotateCw,
  Stamp,
  Hash,
  ScanText,
  Lock,
  MessageSquare,
  Sparkles,
  Image: ImageIcon,
  FileImage,
  Scaling,
  Unlock,
};

const CATEGORY_STYLES: Record<
  string,
  {
    iconBg: string;
    hoverBorder: string;
  }
> = {
  organize: {
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    hoverBorder: 'hover:border-indigo-500/30',
  },
  convert: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/30',
  },
  ai: {
    iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/30',
  },
  security: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/30',
  },
  edit: {
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/30',
  },
  image: {
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/30',
  },
  default: {
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/30',
  },
};

interface PremiumToolCardProps {
  tool: PDFTool;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const PremiumToolCard: React.FC<PremiumToolCardProps> = React.memo(
  ({ tool, isFavorite = false, onToggleFavorite }) => {
    const IconComponent = ICON_MAP[tool.icon] || Wrench;
    const catStyle = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default;

    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="h-full"
      >
        <Link
          to={tool.path}
          className={`
            group relative flex h-full flex-col justify-between
            rounded-2xl border border-white/[0.07] bg-[#0c0d14]/90 backdrop-blur-sm
            p-4 sm:p-5 transition-all duration-200
            hover:bg-[#121420] hover:border-white/[0.16] hover:shadow-lg hover:shadow-black/40
            ${catStyle.hoverBorder}
            focus:outline-none focus:ring-1 focus:ring-red-500/40
          `}
        >
          <div>
            {/* Header row: Icon + Name + Favorite + Arrow */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-xl border ${catStyle.iconBg}
                    transition-transform duration-200 group-hover:scale-105 group-hover:shadow-sm
                  `}
                >
                  <IconComponent className="h-4.5 w-4.5" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-100 group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    {tool.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          tool.badge.includes('AI')
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : tool.badge === 'Popular'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    className={`
                      flex h-7 w-7 items-center justify-center rounded-lg
                      transition-all cursor-pointer
                      ${
                        isFavorite
                          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20 shadow-sm'
                          : 'text-slate-600 hover:text-slate-200 hover:bg-white/[0.06] opacity-60 group-hover:opacity-100'
                      }
                    `}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                      strokeWidth={1.8}
                    />
                  </button>
                )}

                <span className="text-slate-500 group-hover:text-red-400 transition-colors">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
              {tool.description}
            </p>
          </div>

          {/* Subtle bottom indicator */}
          <div className="mt-3.5 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
            <span className="font-medium capitalize">{tool.category.replace('-', ' ')}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-red-400/90 opacity-0 group-hover:opacity-100 transition-opacity">
              Launch tool &rarr;
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }
);

PremiumToolCard.displayName = 'PremiumToolCard';
