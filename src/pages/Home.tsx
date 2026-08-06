import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { DeferredSection } from '../components/DeferredSection';
import { PDF_TOOLS } from '../utils/toolsData';
import { ToolCategory } from '../types/toolTypes';
import {
  ShieldCheck,
  Zap,
  Lock,
  HelpCircle,
  Star,
  EyeOff,
  Sparkles,
  HardDriveDownload,
  Smartphone,
  Layers,
  Scissors,
  Minimize2,
  FileText,
  FileType,
  ScanText,
  Flame,
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { getFavoriteTools } from '../utils/storageUtils';
import { getAllBlogPosts, BlogPostItem } from '../data/blogData';

// Featured Popular PDF Tools Data (Highlighting 6 core tools)
const POPULAR_TOOLS = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one unified document easily in seconds.',
    icon: Layers,
    badge: 'Popular',
    badgeType: 'popular' as const,
    path: '/merge',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Separate one PDF page range or extract all pages into independent files.',
    icon: Scissors,
    badge: 'Popular',
    badgeType: 'popular' as const,
    path: '/split',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size of your PDF while maintaining optimal visual quality.',
    icon: Minimize2,
    badge: 'Fast',
    badgeType: 'fast' as const,
    path: '/compress',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files into editable DOCX Word documents seamlessly.',
    icon: FileText,
    badge: 'Popular',
    badgeType: 'popular' as const,
    path: '/pdf-to-word',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Microsoft Word DOC and DOCX files to PDF documents quickly.',
    icon: FileType,
    badge: 'Fast',
    badgeType: 'fast' as const,
    path: '/word-to-pdf',
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Extract and convert scanned PDF pages into selectable, searchable text.',
    icon: ScanText,
    badge: 'AI Powered',
    badgeType: 'ai' as const,
    path: '/ocr-pdf',
  },
];

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteTools());
  }, []);

  const favoriteTools = useMemo(() => {
    return PDF_TOOLS.filter((t) => favoriteIds.includes(t.id));
  }, [favoriteIds]);

  const latestArticles = useMemo(() => {
    return getAllBlogPosts().slice(0, 6);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCategory = useCallback((category: ToolCategory) => {
    setSelectedCategory(category);
  }, []);

  // Filter tools based on search query and selected category
  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return PDF_TOOLS.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <SEO
        title="PDF Tools Pro - Free Commercial Browser PDF Utility Suite"
        description="Merge, split, compress, protect, unlock, OCR, and convert PDF documents easily online with zero server uploads."
        path="/"
      />

      {/* Hero Section */}
      <Hero searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {/* Main Tools Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Favorite Tools Quick Section (if any) */}
        {favoriteTools.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="bg-[#121215] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                Your Starred Favorite Tools
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteTools.map((tool) => (
                <ToolCard key={`fav-${tool.id}`} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* Popular PDF Tools Section (Featured Grid when viewing default catalog) */}
        {!searchQuery && selectedCategory === 'all' && (
          <DeferredSection fallbackHeight="min-h-[480px]">
            <div className="mb-14">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800/80 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Most Popular</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Popular PDF Tools
                  </h2>
                </div>
                <p className="text-slate-400 text-sm max-w-md">
                  Our most used client-side PDF utility tools for fast, private, and high-performance document editing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {POPULAR_TOOLS.map((tool) => {
                  const IconComp = tool.icon;
                  const isPopular = tool.badgeType === 'popular';
                  const isAI = tool.badgeType === 'ai';

                  const badgeBg = isAI
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/25 group-hover:bg-purple-500/20'
                    : isPopular
                    ? 'bg-red-500/10 text-red-400 border-red-500/25 group-hover:bg-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25 group-hover:bg-amber-500/20';

                  const iconBg = isAI
                    ? 'from-purple-500/15 via-purple-500/5 to-slate-900 border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500'
                    : isPopular
                    ? 'from-red-500/15 via-red-500/5 to-slate-900 border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500'
                    : 'from-amber-500/15 via-amber-500/5 to-slate-900 border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500';

                  const BadgeIcon = isAI ? Sparkles : isPopular ? Flame : Zap;

                  return (
                    <motion.div
                      key={tool.id}
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <Link
                        to={tool.path}
                        className="group relative h-full bg-[#111218]/90 hover:bg-[#151722] rounded-2xl p-6.5 border border-slate-800/80 hover:border-red-500/40 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      >
                        {/* Ambient Glow */}
                        <div className="absolute -right-8 -top-8 w-28 h-28 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/15 group-hover:scale-150 transition-all duration-500 pointer-events-none" />

                        <div>
                          {/* Header: Icon & Badge */}
                          <div className="flex items-center justify-between mb-5">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-md`}
                            >
                              <IconComp className="w-6 h-6 transition-transform duration-300 group-hover:rotate-3" />
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full border transition-all duration-300 ${badgeBg}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              <span>{tool.badge}</span>
                            </span>
                          </div>

                          {/* Title & Description */}
                          <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-red-400 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Open Tool Button */}
                        <div className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-800/70 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 text-slate-300 group-hover:text-white font-semibold text-xs sm:text-sm transition-all duration-300 border border-slate-700/60 group-hover:border-red-500/50 shadow-sm mt-auto">
                          <span>Open Tool</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </DeferredSection>
        )}

        {/* Category Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Tools Grid */}
        <AnimatePresence mode="wait">
          {filteredTools.length > 0 ? (
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#141417] rounded-3xl p-12 text-center border border-slate-800/80 max-w-md mx-auto shadow-2xl"
            >
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No PDF tools found</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                We couldn't find any tool matching "{searchQuery}". Try searching for merge, split, or compress.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Reset Search Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Why Choose SmartPDF AI Section */}
      <DeferredSection fallbackHeight="min-h-[580px]">
        <section className="bg-[#090A0F] border-y border-slate-800/80 py-20 sm:py-28 relative overflow-hidden">
          {/* Subtle background ambient light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-red-400 mb-4 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Next-Gen PDF Infrastructure</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5"
              >
                Why Millions Choose SmartPDF AI
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="text-slate-400 text-base sm:text-lg leading-relaxed"
              >
                Engineered with modern browser WebAssembly and on-device AI capabilities for unmatched security, rapid performance, and frictionless workflows.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* 1. Privacy First */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-rose-400 transition-colors">
                  Privacy First
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  All file processing happens strictly inside your local browser memory. Confidential documents never touch cloud servers or third-party storage.
                </p>
              </motion.div>

              {/* 2. AI Powered */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-purple-400 transition-colors">
                  AI Powered
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Leverage advanced intelligence for automatic OCR text extraction, document summaries, AI chats, and structure analysis directly from PDFs.
                </p>
              </motion.div>

              {/* 3. Fast Processing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-amber-400 transition-colors">
                  Fast Processing
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Zero network upload latency means high-speed execution. Merge, split, compress, and convert multi-megabyte PDFs in milliseconds.
                </p>
              </motion.div>

              {/* 4. No Installation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <HardDriveDownload className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-sky-400 transition-colors">
                  No Installation
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Access full-featured professional PDF tools instantly in your browser without software downloads, desktop apps, or system plugins.
                </p>
              </motion.div>

              {/* 5. Cross Platform */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-indigo-400 transition-colors">
                  Cross Platform
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Works fluidly across Windows, macOS, Linux, iOS, and Android. Enjoy an identical high-speed experience on mobile, tablet, or desktop.
                </p>
              </motion.div>

              {/* 6. Secure Processing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-8 rounded-3xl bg-[#111218]/90 hover:bg-[#151722] border border-slate-800/80 hover:border-slate-700/80 text-left shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-emerald-400 transition-colors">
                  Secure Processing
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Client-side sandboxed execution prevents unauthorized data access, file retention, or telemetry logging. Your files remain 100% under your control.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </DeferredSection>

      {/* Latest Articles Section */}
      <DeferredSection fallbackHeight="min-h-[550px]">
        <section className="py-20 sm:py-28 bg-[#090A0F] border-b border-slate-800/80 relative overflow-hidden">
          {/* Subtle background ambient light */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-rose-600/5 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-xs font-semibold text-red-400 mb-4 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-red-400" />
                  <span>Knowledge & Engineering Guides</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
                >
                  Latest Articles
                </motion.h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.16 }}
              >
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-semibold border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
                >
                  <span>Browse All Articles</span>
                  <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Articles Grid (Top 6 Articles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {latestArticles.map((article, idx) => (
                <motion.div
                  key={article.id || article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className="h-full"
                >
                  <Link
                    to={`/blog/${article.slug}`}
                    className="group relative h-full bg-[#111218]/90 hover:bg-[#151722] rounded-2xl border border-slate-800/80 hover:border-red-500/40 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <div>
                      {/* Featured Image with Overlay Badge */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                        <img
                          src={article.featuredImage}
                          alt={article.imageAlt || article.title}
                          loading="lazy"
                          width="400"
                          height="225"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111218] via-transparent to-transparent opacity-80" />

                        {/* Category Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-950/85 text-red-400 border border-red-500/30 backdrop-blur-md shadow-md">
                            <Tag className="w-3 h-3 text-red-400" />
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-red-400 mb-3 tracking-tight leading-snug transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                          {article.excerpt}
                        </p>

                        {/* Author & Meta Row */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
                          {/* Author */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                              {article.author?.avatar ? (
                                <img
                                  src={article.author.avatar}
                                  alt={article.author.name}
                                  width="24"
                                  height="24"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </div>
                            <span className="text-slate-300 font-semibold truncate max-w-[110px]">
                              {article.author?.name || 'Mridanga Mondal'}
                            </span>
                          </div>

                          {/* Date & Reading Time */}
                          <div className="flex items-center gap-3 text-slate-400 shrink-0">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {article.publishDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {article.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read Article Button */}
                    <div className="px-6 pb-6 pt-2 mt-auto">
                      <div className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-800/70 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 text-slate-300 group-hover:text-white font-semibold text-xs sm:text-sm transition-all duration-300 border border-slate-700/60 group-hover:border-red-500/50 shadow-sm">
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </DeferredSection>

      {/* FAQ Section */}
      <DeferredSection fallbackHeight="min-h-[350px]">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">Everything you need to know about SmartPDF AI.</p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            <div className="p-5 sm:p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                Are my PDF files uploaded to any external server?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                No! All PDF merging, splitting, rotation, and conversion operations are processed 100% locally in your web browser using WebAssembly and client-side JavaScript. Your files never leave your computer.
              </p>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                Is SmartPDF AI completely free to use?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Yes, all tools are completely free with no limits on the number of files or pages you process.
              </p>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-lg">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                Can I convert PDF files into editable Word documents?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Yes! Our PDF to Word tool parses the structural layers of your PDF file and extracts text directly into native Microsoft Word (.docx) format.
              </p>
            </div>
          </div>
        </section>
      </DeferredSection>
    </div>
  );
};


