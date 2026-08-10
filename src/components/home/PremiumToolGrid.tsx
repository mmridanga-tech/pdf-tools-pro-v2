import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PDFTool, ToolCategory } from '../../types/toolTypes';
import { PremiumToolCard } from './PremiumToolCard';
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
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'image', label: 'Image Utilities', icon: ImageIcon },
  { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
];

// 6 Featured Popular Core PDF Tools Data
const FEATURED_POPULAR: PDFTool[] = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one unified document easily in seconds.',
    icon: 'Layers',
    category: 'organize',
    path: '/merge',
    popular: true,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Separate one PDF page range or extract all pages into independent files.',
    icon: 'Scissors',
    category: 'organize',
    path: '/split',
    popular: true,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size of your PDF while maintaining optimal visual quality.',
    icon: 'Minimize2',
    category: 'edit',
    path: '/compress',
    popular: true,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files into editable DOCX Word documents seamlessly.',
    icon: 'FileText',
    category: 'convert',
    path: '/pdf-to-word',
    popular: true,
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Microsoft Word DOC and DOCX files to PDF documents quickly.',
    icon: 'FileType',
    category: 'convert',
    path: '/word-to-pdf',
    popular: true,
    color: 'from-sky-500 to-blue-700',
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Extract and convert scanned PDF pages into selectable, searchable text.',
    icon: 'ScanText',
    category: 'convert',
    path: '/ocr-pdf',
    popular: true,
    color: 'from-amber-500 to-red-600',
  },
];

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
    return tools.filter((t) => favoriteIds.includes(t.id));
  }, [tools, favoriteIds]);

  const displayedFavorites = useMemo(() => {
    return favoriteTools.slice(0, 4);
  }, [favoriteTools]);

  const isFiltering = Boolean(searchQuery || selectedCategory !== 'all');

  return (
    <section id="tools-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Compact Favorites Strip */}
      {favoriteTools.length > 0 && !isFiltering && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] scrollbar-none"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 shrink-0 pr-1">
            <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Favorites</span>
          </div>

          <div className="h-3.5 w-[1px] bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 scrollbar-none">
            {displayedFavorites.map((tool) => (
              <div
                key={`fav-chip-${tool.id}`}
                className="group inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-400/30 text-xs font-medium text-slate-300 hover:text-white transition-all shrink-0"
              >
                <Link to={tool.path} className="flex items-center gap-1.5">
                  <span className="truncate max-w-[120px]">{tool.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(tool.id)}
                  className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                  aria-label={`Unstar ${tool.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {favoriteTools.length > 4 && (
            <span className="text-[11px] font-medium text-slate-500 shrink-0 pl-1">
              +{favoriteTools.length - 4} more
            </span>
          )}
        </motion.div>
      )}

      {/* Featured PDF Tools */}
      {!isFiltering && !showAllTools ? (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-white/[0.06] gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Featured PDF Tools
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-normal mt-1">
                Everything you need for fast, private document workflows.
              </p>
            </div>

            <button
              onClick={() => setShowAllTools(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto group"
            >
              <span>View All PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            {FEATURED_POPULAR.map((tool) => (
              <PremiumToolCard
                key={`featured-${tool.id}`}
                tool={tool}
                isFavorite={favoriteIds.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setShowAllTools(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 text-xs sm:text-sm font-semibold border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
            >
              <span>View All PDF Tools ({tools.length})</span>
              <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Catalog / Filtered Tools View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isFiltering ? `Filtered Tools (${tools.length})` : `Complete Tool Suite (${tools.length})`}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.1] text-white border border-white/20 shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-white/[0.06]'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools Grid */}
          <AnimatePresence mode="wait">
            {tools.length > 0 ? (
              <div className="space-y-6">
                <motion.div
                  key={selectedCategory + searchQuery}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
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
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllTools(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 text-xs sm:text-sm font-semibold border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <span>Show Featured Tools Only</span>
                      <ChevronUp className="w-3.5 h-3.5 text-red-400 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0c0d14] rounded-2xl p-6 text-center border border-white/[0.08] max-w-md mx-auto shadow-sm my-4"
              >
                <HelpCircle className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">No PDF tools found</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed font-normal">
                  No tools found matching "{searchQuery}". Try searching for merge, split, compress, or OCR.
                </p>
                <button
                  onClick={() => {
                    onSearchChange('');
                    onSelectCategory('all');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer"
                >
                  Reset Search & Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};


