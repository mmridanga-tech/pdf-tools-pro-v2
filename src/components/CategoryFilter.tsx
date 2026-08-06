import React from 'react';
import { motion } from 'motion/react';
import { ToolCategory } from '../types/toolTypes';

interface CategoryFilterProps {
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'image', label: 'Image Tools' },
  { id: 'organize', label: 'Organize PDF' },
  { id: 'convert', label: 'Convert PDF' },
  { id: 'edit', label: 'Edit & Optimize' },
  { id: 'security', label: 'Security & Tools' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#111218]/80 border border-slate-800/80 backdrop-blur-md max-w-fit mx-auto gap-1.5 flex-wrap mb-10 shadow-lg">
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            aria-pressed={isActive}
            className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer ${
              isActive
                ? 'text-white font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="category-active-pill"
                className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-md shadow-red-600/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
});

