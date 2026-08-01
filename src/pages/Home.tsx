import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { PDF_TOOLS } from '../utils/toolsData';
import { ToolCategory } from '../types/toolTypes';
import { ShieldCheck, Zap, Lock, HelpCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  // Filter tools based on search query and selected category
  const filteredTools = PDF_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Hero Section */}
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Tools Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Category Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
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
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Reset Search Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Features & Security Section */}
      <section className="bg-[#0D0D0F] border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Designed for Speed, Simplicity & Privacy
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Unlike traditional cloud PDF tools, PDF Tools Pro processes documents strictly inside your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-3xl bg-[#141417] border border-slate-800/80 text-center shadow-lg hover:border-emerald-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">100% Secure & Private</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your confidential documents are processed strictly in local browser memory. Files are never uploaded to any cloud server or stored.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-3xl bg-[#141417] border border-slate-800/80 text-center shadow-lg hover:border-red-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast Performance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                By eliminating network uploads and downloads, operations finish in milliseconds using client-side JavaScript stream compilation.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-3xl bg-[#141417] border border-slate-800/80 text-center shadow-lg hover:border-amber-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Registration Required</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No credit cards, sign-ups, or artificial file limits. Access full professional PDF tools without paywalls or subscriptions.
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

