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
  ArrowRight,
  Wrench,
  FileSpreadsheet,
  Table,
  Presentation,
  LucideIcon,
  ShieldCheck,
  Cpu,
  GitCompare,
  FileCheck,
  EyeOff,
  GraduationCap,
  Headphones,
  Receipt,
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
  ShieldCheck,
  GitCompare,
  FileCheck,
  EyeOff,
  GraduationCap,
  Headphones,
  Receipt,
};

interface CategoryTheme {
  gradient: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  hoverGlow: string;
  dotColor: string;
  tagBg: string;
  tagColor: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  organize: {
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-400',
    borderColor: 'group-hover:border-blue-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)]',
    dotColor: 'bg-blue-400',
    tagBg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    tagColor: 'text-blue-400',
  },
  convert: {
    gradient: 'from-cyan-500/10 via-teal-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-cyan-500/20 to-teal-600/20 text-cyan-400 border-cyan-500/30',
    iconColor: 'text-cyan-400',
    borderColor: 'group-hover:border-cyan-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]',
    dotColor: 'bg-cyan-400',
    tagBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    tagColor: 'text-cyan-400',
  },
  ai: {
    gradient: 'from-purple-500/15 via-pink-500/10 to-transparent',
    iconBg: 'bg-gradient-to-br from-purple-500/25 to-pink-600/25 text-purple-300 border-purple-500/40',
    iconColor: 'text-purple-300',
    borderColor: 'group-hover:border-purple-500/50',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]',
    dotColor: 'bg-purple-400',
    tagBg: 'bg-purple-500/15 border-purple-500/30 text-purple-200',
    tagColor: 'text-purple-300',
  },
  security: {
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    borderColor: 'group-hover:border-emerald-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]',
    dotColor: 'bg-emerald-400',
    tagBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    tagColor: 'text-emerald-400',
  },
  edit: {
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-400',
    borderColor: 'group-hover:border-amber-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]',
    dotColor: 'bg-amber-400',
    tagBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    tagColor: 'text-amber-400',
  },
  image: {
    gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30',
    iconColor: 'text-rose-400',
    borderColor: 'group-hover:border-rose-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.2)]',
    dotColor: 'bg-rose-400',
    tagBg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    tagColor: 'text-rose-400',
  },
  default: {
    gradient: 'from-red-500/10 via-rose-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-600/20 text-red-400 border-red-500/30',
    iconColor: 'text-red-400',
    borderColor: 'group-hover:border-red-500/40',
    hoverGlow: 'group-hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.2)]',
    dotColor: 'bg-red-400',
    tagBg: 'bg-red-500/10 border-red-500/20 text-red-300',
    tagColor: 'text-red-400',
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
    const theme = CATEGORY_THEMES[tool.category] || CATEGORY_THEMES.default;
    const isAiTool = tool.category === 'ai' || (tool.badge && tool.badge.includes('AI'));

    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full group relative"
      >
        <Link
          to={tool.path}
          className={`
            relative flex h-full flex-col justify-between overflow-hidden
            rounded-2xl border border-white/[0.08] bg-[#0d0f17]/95
            p-5 sm:p-5.5 transition-all duration-300
            hover:bg-[#121522] ${theme.borderColor} ${theme.hoverGlow}
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_20px_-2px_rgba(0,0,0,0.5)]
            focus:outline-none focus:ring-2 focus:ring-red-500/50
          `}
        >
          {/* Subtle Ambient Radial Glow on Hover */}
          <div
            className={`
              absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${theme.gradient}
              blur-2xl opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none
            `}
          />

          {/* Top Row: Icon + Badges + Favorite Toggle */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5 relative z-10">
              {/* Icon Container with multi-layered depth */}
              <div className="flex items-center gap-3">
                <div
                  className={`
                    relative flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-xl border ${theme.iconBg}
                    shadow-sm transition-all duration-300
                    group-hover:scale-108 group-hover:shadow-md
                  `}
                >
                  <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:rotate-3" strokeWidth={2} />
                  {isAiTool && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 border border-black/50"></span>
                    </span>
                  )}
                </div>

                {/* Badge Indicator */}
                {tool.badge && (
                  <span
                    className={`
                      inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md tracking-wide
                      ${
                        tool.badge.includes('AI')
                          ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : tool.badge === 'Popular'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-white/[0.06] text-slate-300 border border-white/[0.1]'
                      }
                    `}
                  >
                    {tool.badge.includes('AI') && <Cpu className="w-2.5 h-2.5 text-purple-300" />}
                    {tool.badge}
                  </span>
                )}
              </div>

              {/* Pin / Favorite Action Button */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className={`
                    relative z-20 flex h-7.5 w-7.5 items-center justify-center rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${
                      isFavorite
                        ? 'text-amber-400 bg-amber-400/15 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] opacity-60 group-hover:opacity-100 border border-transparent'
                    }
                  `}
                  aria-label={isFavorite ? 'Unpin from favorites' : 'Pin tool to favorites'}
                  title={isFavorite ? 'Unpin tool' : 'Pin to favorites'}
                >
                  <Star
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isFavorite ? 'fill-current scale-110' : 'hover:scale-110'
                    }`}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold tracking-tight text-slate-100 group-hover:text-white transition-colors flex items-center gap-1.5">
              <span>{tool.name}</span>
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-2 mt-1.5 font-normal">
              {tool.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs relative z-10">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 group-hover:text-slate-300 capitalize">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
              <span>{tool.category.replace('-', ' ')}</span>
            </span>

            {/* Launch trigger button */}
            <span
              className={`
                inline-flex items-center gap-1 text-[11px] font-semibold
                text-slate-400 group-hover:text-white transition-colors duration-200
              `}
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-red-400 group-hover:text-red-300" />
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }
);

PremiumToolCard.displayName = 'PremiumToolCard';
