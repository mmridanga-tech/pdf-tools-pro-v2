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
  ArrowUpRight,
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

const CATEGORY_STYLES: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    borderColor: string;
    glowBg: string;
  }
> = {
  ai: {
    iconBg: 'bg-purple-500/10 border-purple-500/25',
    iconText: 'text-purple-400 group-hover:text-purple-300',
    borderColor: 'hover:border-purple-500/40',
    glowBg: 'bg-purple-500/10',
  },
  security: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    iconText: 'text-emerald-400 group-hover:text-emerald-300',
    borderColor: 'hover:border-emerald-500/40',
    glowBg: 'bg-emerald-500/10',
  },
  organize: {
    iconBg: 'bg-indigo-500/10 border-indigo-500/25',
    iconText: 'text-indigo-400 group-hover:text-indigo-300',
    borderColor: 'hover:border-indigo-500/40',
    glowBg: 'bg-indigo-500/10',
  },
  convert: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/25',
    iconText: 'text-cyan-400 group-hover:text-cyan-300',
    borderColor: 'hover:border-cyan-500/40',
    glowBg: 'bg-cyan-500/10',
  },
  edit: {
    iconBg: 'bg-amber-500/10 border-amber-500/25',
    iconText: 'text-amber-400 group-hover:text-amber-300',
    borderColor: 'hover:border-amber-500/40',
    glowBg: 'bg-amber-500/10',
  },
  image: {
    iconBg: 'bg-sky-500/10 border-sky-500/25',
    iconText: 'text-sky-400 group-hover:text-sky-300',
    borderColor: 'hover:border-sky-500/40',
    glowBg: 'bg-sky-500/10',
  },
  default: {
    iconBg: 'bg-rose-500/10 border-rose-500/25',
    iconText: 'text-rose-400 group-hover:text-rose-300',
    borderColor: 'hover:border-rose-500/40',
    glowBg: 'bg-rose-500/10',
  },
};

const getBadgeDetails = (tool: PDFTool) => {
  if (tool.category === 'ai' || tool.id === 'ocr-pdf' || tool.badge?.toLowerCase().includes('ai')) {
    return {
      label: 'AI Powered',
      icon: Sparkles,
      badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    };
  }

  if (tool.category === 'security' || tool.id === 'protect-pdf' || tool.id === 'unlock-pdf' || tool.id === 'watermark-pdf' || tool.badge?.toLowerCase().includes('secur')) {
    return {
      label: 'Secure',
      icon: ShieldCheck,
      badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    };
  }

  if (tool.popular || tool.badge?.toLowerCase().includes('popular')) {
    return {
      label: 'Popular',
      icon: Flame,
      badgeStyle: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    };
  }

  return {
    label: 'Fast',
    icon: Zap,
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  };
};

export const ToolCard: React.FC<ToolCardProps> = React.memo(({ tool }) => {
  const IconComponent = ICON_MAP[tool.icon] || FileText;
  const catStyle = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default;
  const badgeDetails = getBadgeDetails(tool);
  const BadgeIcon = badgeDetails.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={tool.path}
        className={`group relative h-full bg-[#10121A]/90 hover:bg-[#161826] rounded-2xl p-5 border border-white/10 ${catStyle.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/40`}
      >
        {/* Ambient background glow on hover */}
        <div className={`absolute -right-10 -top-10 w-28 h-28 ${catStyle.glowBg} rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none opacity-40 group-hover:opacity-80`} />

        <div>
          {/* Header with Icon and Badge */}
          <div className="flex items-center justify-between mb-3.5">
            <div className={`w-11 h-11 rounded-xl ${catStyle.iconBg} border flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300`}>
              <IconComponent className={`w-5 h-5 ${catStyle.iconText} transition-transform duration-300 group-hover:rotate-3`} />
            </div>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-full border transition-all duration-300 ${badgeDetails.badgeStyle}`}>
              <BadgeIcon className="w-2.5 h-2.5" />
              <span>{badgeDetails.label}</span>
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-bold text-slate-100 group-hover:text-white mb-1.5 tracking-tight transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors line-clamp-2 font-normal mb-4">
            {tool.description}
          </p>
        </div>

        {/* Directional Indicator (No Text Button) */}
        <div className="flex justify-end pt-1 mt-auto">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/10 group-hover:border-white/20 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200">
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});


