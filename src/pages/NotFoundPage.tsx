import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, FileText, ArrowRight, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { CommandPaletteModal } from '../components/CommandPaletteModal';

export const NotFoundPage: React.FC = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0A0A0B] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEO
        title="404 - Page Not Found | SmartPDF AI"
        description="The page you are looking for does not exist or has been moved. Explore SmartPDF AI's suite of PDF tools, AI chat, and document utilities."
        path="/404"
        noindex={true}
      />

      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        
        {/* Large 404 Visual Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <ShieldAlert className="w-4 h-4" /> Error Code 404
          </div>
          
          <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 tracking-tight select-none">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Sorry, the page you are looking for doesn't exist, was removed, or had its name changed. You can return to the home page or search our PDF & AI toolsuite below.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-red-400" /> Search PDF Tools
          </button>
        </div>

        {/* Popular Tools Quick Grid */}
        <div className="pt-8 border-t border-slate-800/80 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Popular Destinations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <Link
              to="/merge"
              className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-red-500/50 hover:text-white text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" /> Merge PDF
            </Link>
            <Link
              to="/ai-chat"
              className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/50 hover:text-white text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Chat
            </Link>
            <Link
              to="/ocr-pdf"
              className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:text-white text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" /> OCR PDF
            </Link>
            <Link
              to="/help"
              className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:text-white text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Help Center
            </Link>
          </div>
        </div>

      </div>

      {/* Command Palette / Search Modal */}
      <CommandPaletteModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
};
