import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PDFTool, ToolCategory } from '../../types/toolTypes';
import { PremiumToolCard } from './PremiumToolCard';
import { PDF_TOOLS } from '../../utils/toolsData';
import {
  Star,
  Sparkles,
  HelpCircle,
  LayoutGrid,
  Layers,
  Minimize2,
  FileText,
  Shield,
  Image as ImageIcon,
  ChevronUp,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';

interface PremiumToolGridProps {
  tools: PDFTool[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
}

const CATEGORIES: { id: ToolCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Tools', icon: LayoutGrid },
  { id: 'organize', label: 'Organize & Split', icon: Layers },
  { id: 'convert', label: 'Convert PDF', icon: FileText },
  { id: 'edit', label: 'Edit & Compress', icon: Minimize2 },
  { id: 'security', label: 'Security & Protect', icon: Shield },
  { id: 'image', label: 'Image Utilities', icon: ImageIcon },
  { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
];

// 6 Featured Popular Core PDF Tools Data
const FEATURED_POPULAR: PDFTool[] = PDF_TOOLS.filter((t) =>
  ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'ai-chat', 'ocr-pdf', 'ai-assistant', 'protect-pdf'].includes(t.id)
).slice(0, 6);

export const PremiumToolGrid: React.FC<PremiumToolGridProps> = ({
  tools,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  favoriteIds,
  onToggleFavorite,
}) => {
  const [showAllTools, setShowAllTools] = useState(false);

  const favoriteTools = useMemo(() => {
    return PDF_TOOLS.filter((t) => favoriteIds.includes(t.id));
  }, [favoriteIds]);

  const displayedFavorites = useMemo(() => {
    return favoriteTools.slice(0, 6);
  }, [favoriteTools]);

  const isFiltering = Boolean(searchQuery || selectedCategory !== 'all');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PDF_TOOLS.length };
    PDF_TOOLS.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section id="tools-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-7">
      {/* Category Navigation Bar & Filter Strip */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                <Zap className="w-3 h-3 text-red-400" />
                Browser-Native Architecture
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>PDF & AI Tool Suite</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                {tools.length} Tools Available
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-normal mt-1">
              Select a dedicated tool below to begin instant, zero-upload processing in your browser.
            </p>
          </div>

          {/* Quick Toggle for Featured vs All */}
          {!isFiltering && (
            <div className="flex items-center gap-2 bg-[#0c0d14] p-1 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setShowAllTools(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  !showAllTools
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Featured (6)
              </button>
              <button
                onClick={() => setShowAllTools(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  showAllTools
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Tools ({PDF_TOOLS.length})
              </button>
            </div>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-semibold scale-[1.02]'
                    : 'bg-[#0d0f17] text-slate-400 hover:text-slate-100 hover:bg-[#141724] border border-white/[0.08]'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10.5px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned / Favorites Strip */}
      {favoriteTools.length > 0 && !isFiltering && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 px-4 py-2.5 rounded-2xl bg-[#0c0d14] border border-white/[0.08] shadow-sm scrollbar-none"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 shrink-0 pr-1">
            <Star className="w-4 h-4 fill-current text-amber-400" />
            <span>Pinned Tools</span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 scrollbar-none">
            {displayedFavorites.map((tool) => (
              <div
                key={`fav-chip-${tool.id}`}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-400/30 text-xs font-medium text-slate-300 hover:text-white transition-all shrink-0"
              >
                <Link to={tool.path} className="flex items-center gap-1.5">
                  <span className="truncate max-w-[140px] font-semibold">{tool.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(tool.id)}
                  className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                  aria-label={`Unpin ${tool.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {favoriteTools.length > 6 && (
            <span className="text-[11px] font-medium text-slate-500 shrink-0 pl-1">
              +{favoriteTools.length - 6} more
            </span>
          )}
        </motion.div>
      )}

      {/* Featured PDF Tools */}
      {!isFiltering && !showAllTools ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5.5">
            {FEATURED_POPULAR.map((tool) => (
              <PremiumToolCard
                key={`featured-${tool.id}`}
                tool={tool}
                isFavorite={favoriteIds.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          <div className="text-center pt-3">
            <button
              onClick={() => setShowAllTools(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-100 text-xs sm:text-sm font-bold border border-white/[0.1] hover:border-white/20 transition-all cursor-pointer group shadow-sm hover:scale-[1.02]"
            >
              <span>Explore All {PDF_TOOLS.length} PDF & AI Tools</span>
              <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Catalog / Filtered Tools View */
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {tools.length > 0 ? (
              <div className="space-y-6">
                <motion.div
                  key={selectedCategory + searchQuery}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 sm:gap-5"
                >
                  {tools.map((tool) => (
                    <PremiumToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={favoriteIds.includes(tool.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </motion.div>

                {/* Show Fewer Button when expanded via showAllTools and not active search */}
                {!isFiltering && showAllTools && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => setShowAllTools(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-100 text-xs sm:text-sm font-bold border border-white/[0.1] hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <span>Show Featured Popular Tools</span>
                      <ChevronUp className="w-4 h-4 text-red-400 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0d0f17] rounded-3xl p-8 text-center border border-white/[0.08] max-w-md mx-auto shadow-xl my-6"
              >
                <HelpCircle className="w-9 h-9 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1.5">No matching PDF tools found</h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed font-normal">
                  No tools found matching "{searchQuery}". Try searching for compress, merge, split, word, or ocr.
                </p>
                <button
                  onClick={() => {
                    onSearchChange('');
                    onSelectCategory('all');
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer"
                >
                  Reset Search & All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
