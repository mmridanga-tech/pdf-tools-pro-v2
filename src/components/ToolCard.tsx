import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import { PDFTool } from '../types/toolTypes';

interface ToolCardProps {
  tool: PDFTool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  // Dynamically get icon component from lucide-react
  const IconComponent =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] ||
    Icons.FileText;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link
        to={tool.path}
        className="group relative h-full bg-[#141417]/90 hover:bg-[#18181d] rounded-2xl p-6 border border-slate-800/80 hover:border-red-500/50 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        {/* Decorative gradient blur background on hover */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

        <div>
          {/* Icon Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 group-hover:scale-110 transition-all duration-300 shadow-md">
              <IconComponent className="w-6 h-6" />
            </div>
            {tool.badge && (
              <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                {tool.badge}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-white mb-2 tracking-tight transition-colors">
            {tool.name}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors line-clamp-2">
            {tool.description}
          </p>
        </div>

        <div className="flex items-center text-xs font-semibold text-red-400 group-hover:text-red-300 gap-1.5 mt-auto pt-3.5 border-t border-slate-800/80">
          <span>Use Tool</span>
          <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
        </div>
      </Link>
    </motion.div>
  );
};
