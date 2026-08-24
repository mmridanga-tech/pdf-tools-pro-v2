import React, { useState, useMemo } from 'react';
import {
  FileText,
  Scissors,
  Minimize2,
  FileSpreadsheet,
  Image,
  ScanText,
  Stamp,
  Lock,
  RotateCw,
  Sparkles,
  ShieldAlert,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  SlidersHorizontal,
  LucideIcon,
  Cpu,
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../types';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'ai-chat',
    title: 'AI Document Intelligence',
    shortDesc: 'Chat with PDF, ask questions with page citations [Page X], generate executive summaries & translate.',
    category: 'ai',
    icon: 'Sparkles',
    badge: 'Gemini 3.7',
    isPro: false,
  },
  {
    id: 'ai-analyzer',
    title: 'Enterprise Document Analyzer',
    shortDesc: 'Deep compliance audit, risk detection, structured entity extraction and executive reports.',
    category: 'ai',
    icon: 'ShieldAlert',
    badge: 'Audit Grade',
    isPro: true,
  },
  {
    id: 'merge',
    title: 'Merge PDF Files',
    shortDesc: 'Combine multiple PDF files into a single unified document with custom page sequencing.',
    category: 'organize',
    icon: 'FileText',
    badge: 'Client WASM',
  },
  {
    id: 'split',
    title: 'Split & Extract Pages',
    shortDesc: 'Separate individual pages or extract custom page ranges into brand new PDF documents.',
    category: 'organize',
    icon: 'Scissors',
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    shortDesc: 'Optimize PDF size client-side without compromising resolution or metadata.',
    category: 'convert',
    icon: 'Minimize2',
    badge: 'Lossless',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word (.docx)',
    shortDesc: 'Convert PDF files into fully editable Microsoft Word documents with structured formatting.',
    category: 'convert',
    icon: 'FileSpreadsheet',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    shortDesc: 'Convert JPG, PNG, WEBP and modern image formats into a standardized multipage PDF.',
    category: 'convert',
    icon: 'Image',
  },
  {
    id: 'ocr',
    title: 'OCR Text Scanner',
    shortDesc: 'Extract editable text from scanned documents and images using on-device WebAssembly OCR.',
    category: 'convert',
    icon: 'ScanText',
    badge: 'WASM OCR',
  },
  {
    id: 'watermark',
    title: 'Watermark PDF',
    shortDesc: 'Add custom security text stamps, angle rotations, opacity levels, and copyright markers.',
    category: 'security',
    icon: 'Stamp',
  },
  {
    id: 'protect',
    title: 'Protect & Encrypt',
    shortDesc: 'Lock your sensitive PDF files with robust cryptographic password security.',
    category: 'security',
    icon: 'Lock',
    badge: '256-bit AES',
  },
  {
    id: 'rotate',
    title: 'Rotate & Reorder',
    shortDesc: 'Permanently rotate inverted pages 90°, 180°, or 270° with live thumbnail previews.',
    category: 'organize',
    icon: 'RotateCw',
  },
];

interface ToolsGridProps {
  onSelectTool: (id: ToolId) => void;
}

interface CategoryStyleConfig {
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  cardHoverBorder: string;
  cardHoverRing: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tagDot: string;
  accentText: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyleConfig> = {
  ai: {
    iconBg: 'bg-indigo-50/90 group-hover:bg-indigo-100/90',
    iconBorder: 'border-indigo-200/80 group-hover:border-indigo-300',
    iconColor: 'text-indigo-600 group-hover:text-indigo-700',
    cardHoverBorder: 'hover:border-indigo-400/70',
    cardHoverRing: 'group-hover:ring-1 group-hover:ring-indigo-400/20',
    badgeBg: 'bg-indigo-50/90',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/90',
    tagDot: 'bg-indigo-500',
    accentText: 'text-indigo-600 group-hover:text-indigo-700',
  },
  organize: {
    iconBg: 'bg-blue-50/90 group-hover:bg-blue-100/90',
    iconBorder: 'border-blue-200/80 group-hover:border-blue-300',
    iconColor: 'text-blue-600 group-hover:text-blue-700',
    cardHoverBorder: 'hover:border-blue-400/70',
    cardHoverRing: 'group-hover:ring-1 group-hover:ring-blue-400/20',
    badgeBg: 'bg-blue-50/90',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200/90',
    tagDot: 'bg-blue-500',
    accentText: 'text-blue-600 group-hover:text-blue-700',
  },
  convert: {
    iconBg: 'bg-emerald-50/90 group-hover:bg-emerald-100/90',
    iconBorder: 'border-emerald-200/80 group-hover:border-emerald-300',
    iconColor: 'text-emerald-600 group-hover:text-emerald-700',
    cardHoverBorder: 'hover:border-emerald-400/70',
    cardHoverRing: 'group-hover:ring-1 group-hover:ring-emerald-400/20',
    badgeBg: 'bg-emerald-50/90',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200/90',
    tagDot: 'bg-emerald-500',
    accentText: 'text-emerald-600 group-hover:text-emerald-700',
  },
  security: {
    iconBg: 'bg-rose-50/90 group-hover:bg-rose-100/90',
    iconBorder: 'border-rose-200/80 group-hover:border-rose-300',
    iconColor: 'text-rose-600 group-hover:text-rose-700',
    cardHoverBorder: 'hover:border-rose-400/70',
    cardHoverRing: 'group-hover:ring-1 group-hover:ring-rose-400/20',
    badgeBg: 'bg-rose-50/90',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200/90',
    tagDot: 'bg-rose-500',
    accentText: 'text-rose-600 group-hover:text-rose-700',
  },
  default: {
    iconBg: 'bg-slate-50 group-hover:bg-slate-100',
    iconBorder: 'border-slate-200 group-hover:border-slate-300',
    iconColor: 'text-slate-700 group-hover:text-slate-900',
    cardHoverBorder: 'hover:border-indigo-400/70',
    cardHoverRing: 'group-hover:ring-1 group-hover:ring-indigo-400/20',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    tagDot: 'bg-slate-500',
    accentText: 'text-indigo-600 group-hover:text-indigo-700',
  },
};

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Sparkles,
  ShieldAlert,
  FileText,
  Scissors,
  Minimize2,
  FileSpreadsheet,
  Image,
  ScanText,
  Stamp,
  Lock,
  RotateCw,
};

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'organize' | 'convert' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOOLS.length };
    TOOLS.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanQuery ||
        tool.title.toLowerCase().includes(cleanQuery) ||
        tool.shortDesc.toLowerCase().includes(cleanQuery) ||
        tool.category.toLowerCase().includes(cleanQuery) ||
        (tool.badge && tool.badge.toLowerCase().includes(cleanQuery));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categories: { id: 'all' | 'ai' | 'organize' | 'convert' | 'security'; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'ai', label: 'Gemini AI' },
    { id: 'organize', label: 'Organize' },
    { id: 'convert', label: 'Convert' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Modern High-Contrast Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 mb-10 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.1)] border border-slate-800">
        {/* Subtle Ambient Decorative Gradient Layer */}
        <div className="absolute top-0 right-0 w-[460px] h-[460px] bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-[320px] h-[320px] bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Security Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-semibold mb-4 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Zero-Upload WASM Security & Enterprise AI Document Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3.5 leading-tight">
            Fast, Private PDF Processing & AI Intelligence in Your Browser
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            All document editing, merging, splitting, and OCR conversions happen 100% locally on your device via WebAssembly. Connect enterprise Gemini AI for deep document chat, citations, risk audits, and summaries.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              id="hero-try-ai-chat"
              onClick={() => onSelectTool('ai-chat')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all duration-200 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Document Chat</span>
            </button>
            <button
              id="hero-try-analyzer"
              onClick={() => onSelectTool('ai-analyzer')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700/90 hover:border-slate-600 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>Enterprise Risk Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                id={`filter-category-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:bg-slate-50/80 shadow-sm'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Control */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="tool-search-input"
            type="text"
            placeholder="Search PDF tools & AI features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Modernized Tool Cards */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredTools.map((tool) => {
            const IconComp = ICON_COMPONENTS[tool.icon] || FileText;
            const style = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default;

            return (
              <div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                tabIndex={0}
                role="button"
                onClick={() => onSelectTool(tool.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }
                }}
                className={`
                  group relative flex flex-col justify-between
                  bg-white rounded-2xl p-6 sm:p-6.5
                  border border-slate-200/90 ${style.cardHoverBorder}
                  shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.04)]
                  hover:shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.08)]
                  hover:-translate-y-1.5 active:translate-y-0 active:shadow-sm
                  transition-all duration-200 ease-out cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                `}
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4.5">
                    {/* Multi-layered Icon Container */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        border ${style.iconBg} ${style.iconBorder}
                        shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                        group-hover:scale-105 group-hover:shadow-md transition-all duration-200
                      `}
                    >
                      <IconComp
                        className={`w-5.5 h-5.5 ${style.iconColor} transition-transform duration-200 group-hover:rotate-3`}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Pro / Feature Badge */}
                    {tool.badge && (
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                          text-[11px] font-bold tracking-tight whitespace-nowrap
                          border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}
                          shadow-sm
                        `}
                      >
                        {tool.badge.includes('Gemini') && <Cpu className="w-3 h-3 shrink-0" />}
                        <span>{tool.badge}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>

                  {/* Description with precise line height */}
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal line-clamp-2">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Card Footer Bar */}
                <div className="pt-4.5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Category Indicator Tag */}
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 capitalize text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${style.tagDot}`} />
                    <span>{tool.category}</span>
                  </span>

                  {/* Launch Tool CTA with Directional Arrow */}
                  <div
                    className={`
                      inline-flex items-center gap-1 font-bold ${style.accentText}
                      transition-all duration-200
                    `}
                  >
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 max-w-md mx-auto shadow-[0_4px_12px_rgba(0,0,0,0.05)] my-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3.5">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">No matching PDF tools found</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            No tools found matching &ldquo;{searchQuery}&rdquo;. Try searching for merge, split, compress, word, ocr, or ai.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

