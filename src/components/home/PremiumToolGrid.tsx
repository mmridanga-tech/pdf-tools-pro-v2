import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFTool, ToolCategory } from '../../types/toolTypes';
import { PremiumToolCard } from './PremiumToolCard';
import { DeferredSection } from '../DeferredSection';
import {
  Flame,
  Star,
  Sparkles,
  HelpCircle,
  LayoutGrid,
  Scissors,
  Layers,
  Minimize2,
  FileText,
  FileType,
  ScanText,
  Shield,
  Image as ImageIcon,
  CheckCircle2,
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

// Highlighted Popular Core PDF Tools Data
const FEATURED_POPULAR: PDFTool[] = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one unified document easily in seconds.',
    icon: 'Layers',
    category: 'organize',
    path: '/merge',
    popular: true,
    badge: 'Popular',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Separate one PDF page range or extract all pages into independent files.',
    icon: 'Scissors',
    category: 'organize',
    path: '/split',
    popular: true,
    badge: 'Popular',
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
    badge: 'Fast',
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
    badge: 'Popular',
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
    badge: 'Fast',
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
    badge: 'AI Powered',
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
  const favoriteTools = useMemo(() => {
    return tools.filter((t) => favoriteIds.includes(t.id));
  }, [tools, favoriteIds]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Starred Favorite Tools Section */}
      {favoriteTools.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-950/30 via-[#141522] to-amber-950/20 border border-amber-500/30 rounded-[24px] p-6.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-amber-300">
                Your Starred Favorite Tools
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {favoriteTools.length} starred
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteTools.map((tool) => (
              <PremiumToolCard
                key={`fav-${tool.id}`}
                tool={tool}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Spotlight Popular PDF Tools Section */}
      {!searchQuery && selectedCategory === 'all' && (
        <DeferredSection fallbackHeight="min-h-[480px]">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2.5 shadow-md">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Most Popular Workflows</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Featured PDF Tools
                </h2>
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                Fast, client-side PDF utilities engineered for zero server latency and maximum visual clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURED_POPULAR.map((tool) => (
                <PremiumToolCard
                  key={`featured-${tool.id}`}
                  tool={tool}
                  isFavorite={favoriteIds.includes(tool.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        </DeferredSection>
      )}

      {/* Category Navigation Bar */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Explore All Tools ({tools.length})
          </h2>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 border border-red-400/50'
                    : 'bg-[#12131F]/90 text-slate-400 hover:text-white hover:bg-[#181928] border border-white/10'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Filtered Tools Grid */}
      <AnimatePresence mode="wait">
        {tools.length > 0 ? (
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#12131F] rounded-[24px] p-12 text-center border border-white/10 max-w-md mx-auto shadow-2xl backdrop-blur-xl"
          >
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No PDF tools found</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We couldn't find any tool matching "{searchQuery}". Try searching for merge, split, compress, or OCR.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/25 cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
