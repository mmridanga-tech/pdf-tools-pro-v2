import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { PDF_TOOLS } from '../utils/toolsData';
import { ToolCategory } from '../types/toolTypes';
import { ShieldCheck, Zap, Lock, HelpCircle, Star, EyeOff, Sparkles, HardDriveDownload, Smartphone } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getFavoriteTools } from '../utils/storageUtils';

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

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-base">Everything you need to know about PDF Tools Pro.</p>
        </div>

        <div className="space-y-4">
          <div className="p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">
              Are my PDF files uploaded to any external server?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No! All PDF merging, splitting, rotation, and conversion operations are processed 100% locally in your web browser using WebAssembly and client-side JavaScript. Your files never leave your computer.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">
              Is PDF Tools Pro completely free to use?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Yes, all tools are completely free with no limits on the number of files or pages you process.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#141417] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">
              Can I convert PDF files into editable Word documents?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Yes! Our PDF to Word tool parses the structural layers of your PDF file and extracts text directly into native Microsoft Word (.docx) format.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};


