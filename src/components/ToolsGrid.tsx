import React, { useState } from 'react';
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
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../types';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'ai-chat',
    title: 'AI Document Intelligence',
    shortDesc: 'Chat with PDF, ask questions with page citations [Page X], generate executive summaries & translate.',
    category: 'ai',
    icon: 'Sparkles',
    badge: 'Gemini 3.6',
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

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'organize' | 'convert' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-indigo-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-violet-600" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'Scissors':
        return <Scissors className="w-6 h-6 text-amber-600" />;
      case 'Minimize2':
        return <Minimize2 className="w-6 h-6 text-emerald-600" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-6 h-6 text-cyan-600" />;
      case 'Image':
        return <Image className="w-6 h-6 text-teal-600" />;
      case 'ScanText':
        return <ScanText className="w-6 h-6 text-purple-600" />;
      case 'Stamp':
        return <Stamp className="w-6 h-6 text-rose-600" />;
      case 'Lock':
        return <Lock className="w-6 h-6 text-red-600" />;
      case 'RotateCw':
        return <RotateCw className="w-6 h-6 text-sky-600" />;
      default:
        return <FileText className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Upload WASM Security & Enterprise AI Document Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Fast, Private PDF Processing & AI Intelligence in Your Browser
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            All document editing, merging, splitting, and OCR conversions happen 100% locally on your device via WebAssembly. Connect enterprise Gemini AI for deep document chat, citations, risk audits, and summaries.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-try-ai-chat"
              onClick={() => onSelectTool('ai-chat')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Launch AI Document Chat
            </button>
            <button
              id="hero-try-analyzer"
              onClick={() => onSelectTool('ai-analyzer')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              Enterprise Risk Analyzer
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'ai', label: 'Gemini AI' },
            { id: 'organize', label: 'Organize' },
            { id: 'convert', label: 'Convert' },
            { id: 'security', label: 'Security' },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="tool-search-input"
            type="text"
            placeholder="Search PDF tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            id={`tool-card-${tool.id}`}
            onClick={() => onSelectTool(tool.id)}
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 flex items-center justify-center transition-colors">
                  {getIcon(tool.icon)}
                </div>
                {tool.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tool.shortDesc}
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>Open Tool</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
