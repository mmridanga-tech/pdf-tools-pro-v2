import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  icon: Icon,
  title,
  description,
  badge,
}) => {
  return (
    <div className="text-center mb-10 relative">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Tools</span>
        </Link>

        {badge && (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20">
            {badge}
          </span>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-600/25 border border-red-500/30"
      >
        <Icon className="w-8 h-8" aria-hidden="true" />
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
        {title}
      </h1>

      <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
};
