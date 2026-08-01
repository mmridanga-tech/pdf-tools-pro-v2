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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        to={tool.path}
        className="group relative h-full bg-[#141417]/90 hover:bg-[#18181d] rounded-2xl p-6 border border-slate-800/80 hover:border-red-500/50 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        {/* Decorative gradient blur background on hover */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md shadow-red-950/30`}
            >
              <IconComponent className="w-6 h-6" />
            </motion.div>

            {tool.badge && (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 shadow-sm">
                {tool.badge}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-2">
            {tool.name}
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
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

