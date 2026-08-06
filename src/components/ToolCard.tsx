import React from 'react';
import { Link } from 'react-router-dom';
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
  Image,
  FileImage,
  Scaling,
  Unlock,
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PDFTool } from '../types/toolTypes';

interface ToolCardProps {
  tool: PDFTool;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Image,
  FileImage,
  Scaling,
  Unlock,
};

// Function to determine the standardized feature badge for each tool
const getBadgeDetails = (tool: PDFTool) => {
  // Check AI tools
  if (tool.category === 'ai' || tool.id === 'ocr-pdf' || tool.badge === 'AI OCR' || tool.badge === 'Gemini AI') {
    return {
      label: 'AI Powered',
      icon: Sparkles,
      badgeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/25 group-hover:bg-purple-500/20 group-hover:border-purple-500/40',
      iconBg: 'from-purple-500/15 via-purple-500/5 to-slate-900 border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500',
      glow: 'bg-purple-500/10'
    };
  }

  // Check Security tools
  if (tool.category === 'security' || tool.id === 'protect-pdf' || tool.id === 'unlock-pdf' || tool.id === 'watermark-pdf' || tool.badge === 'Security') {
    return {
      label: 'Secure',
      icon: ShieldCheck,
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40',
      iconBg: 'from-emerald-500/15 via-emerald-500/5 to-slate-900 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500',
      glow: 'bg-emerald-500/10'
    };
  }

  // Check Popular tools
  if (tool.popular || tool.badge === 'Popular') {
    return {
      label: 'Popular',
      icon: Flame,
      badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/25 group-hover:bg-red-500/20 group-hover:border-red-500/40',
      iconBg: 'from-red-500/15 via-red-500/5 to-slate-900 border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500',
      glow: 'bg-red-500/10'
    };
  }

  // Default Fast badge for high-performance browser tools
  return {
    label: 'Fast',
    icon: Zap,
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/25 group-hover:bg-amber-500/20 group-hover:border-amber-500/40',
    iconBg: 'from-amber-500/15 via-amber-500/5 to-slate-900 border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    glow: 'bg-amber-500/10'
  };
};

export const ToolCard: React.FC<ToolCardProps> = React.memo(({ tool }) => {
  // Dynamically get main tool icon component from ICON_MAP
  const IconComponent = ICON_MAP[tool.icon] || FileText;

  const badgeDetails = getBadgeDetails(tool);
  const BadgeIcon = badgeDetails.icon;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <Link
        to={tool.path}
        className="group relative h-full bg-[#111218]/90 hover:bg-[#151722] rounded-[20px] p-6 border border-slate-800/80 hover:border-red-500/40 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        {/* Ambient background glow on hover */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 ${badgeDetails.glow} rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none opacity-60 group-hover:opacity-100`} />

        <div>
          {/* Header with Icon and Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badgeDetails.iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-md`}>
              <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:rotate-3" />
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full border transition-all duration-300 ${badgeDetails.badgeStyle}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{badgeDetails.label}</span>
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-white mb-2 font-display tracking-tight transition-colors flex items-center justify-between">
            <span>{tool.name}</span>
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors line-clamp-2">
            {tool.description}
          </p>
        </div>

        {/* Action Button Footer */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white pt-4 mt-auto border-t border-slate-800/80 group-hover:border-slate-700/80 transition-colors">
          <span className="group-hover:text-red-400 transition-colors font-bold">Use Tool</span>
          <div className="w-7.5 h-7.5 rounded-xl bg-slate-800/80 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:translate-x-1 shadow-sm border border-slate-700/60 group-hover:border-red-500/50">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

