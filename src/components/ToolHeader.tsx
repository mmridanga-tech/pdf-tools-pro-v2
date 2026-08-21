import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ArrowLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  category?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  category = 'PDF Tools',
}) => {
  return (
    <div className="text-center mb-10 relative space-y-4">
      {/* Top Header Bar with Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/" className="hover:text-white transition-colors">{category}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-semibold">{title}</span>
        </nav>

        <div className="flex items-center gap-3">
          {badge && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20">
              {badge}
            </span>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tools</span>
          </Link>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/25 border border-red-500/30"
      >
        <Icon className="w-8 h-8" aria-hidden="true" />
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        {title}
      </h1>

      <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
};

