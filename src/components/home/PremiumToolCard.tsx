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
  Flame,
  Zap,
  Shield,
  Wrench,
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

interface PremiumToolCardProps {
  tool: PDFTool;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const PremiumToolCard: React.FC<PremiumToolCardProps> = React.memo(({
  tool,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const IconComponent = ICON_MAP[tool.icon] || Wrench;

  // Determine badge styling based on tool properties or category
  const isAI = tool.category === 'ai' || tool.badge?.toLowerCase().includes('ai');
  const isPopular = tool.popular || tool.badge?.toLowerCase().includes('popular');

  const badgeText = tool.badge || (isAI ? 'AI Powered' : isPopular ? 'Popular' : 'Utility');

  const badgeBg = isAI
    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 group-hover:bg-purple-500/20'
    : isPopular
    ? 'bg-red-500/10 text-red-300 border-red-500/30 group-hover:bg-red-500/20'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 group-hover:bg-amber-500/20';

  const badgeIcon = isAI ? Sparkles : isPopular ? Flame : Zap;
  const BadgeIcon = badgeIcon;

  const iconGradient = isAI
    ? 'from-purple-500/20 via-purple-600/10 to-slate-900 border-purple-500/30 text-purple-400 group-hover:border-purple-400 group-hover:text-purple-300'
    : isPopular
    ? 'from-red-500/20 via-rose-600/10 to-slate-900 border-red-500/30 text-red-400 group-hover:border-red-400 group-hover:text-red-300'
    : 'from-amber-500/20 via-orange-600/10 to-slate-900 border-amber-500/30 text-amber-400 group-hover:border-amber-400 group-hover:text-amber-300';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <div className="group relative h-full rounded-[20px] bg-[#12131F]/80 hover:bg-[#181928] border border-white/10 hover:border-red-500/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(239,68,68,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl">
        {/* Ambient Corner Glow on Hover */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-red-500/0 rounded-full blur-2xl group-hover:bg-red-500/15 group-hover:scale-150 transition-all duration-500 pointer-events-none" />

        <div>
          {/* Header Row: Icon & Badge & Favorite */}
          <div className="flex items-center justify-between mb-5">
            <div
              className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${iconGradient} border flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300`}
            >
              <IconComponent className="w-6.5 h-6.5 transition-transform duration-300 group-hover:rotate-3" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wide rounded-full border transition-all duration-300 ${badgeBg}`}
              >
                <BadgeIcon className="w-3 h-3" />
                <span>{badgeText}</span>
              </span>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isFavorite
                      ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                      : 'text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10'
                  }`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-red-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-300/80 leading-relaxed mb-6 group-hover:text-slate-200 transition-colors line-clamp-2">
            {tool.description}
          </p>
        </div>

        {/* Action Button */}
        <Link
          to={tool.path}
          className="inline-flex items-center justify-between w-full px-4.5 py-3 rounded-xl bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 text-slate-200 group-hover:text-white font-bold text-xs sm:text-sm transition-all duration-300 border border-white/10 group-hover:border-red-400/40 shadow-md mt-auto"
        >
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  );
});
