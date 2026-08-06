import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Zap, Github, Linkedin, Twitter, Heart, Lock, Layers, Scissors, Minimize2, FileText, FileType, Image, ScanText, Bot, FileSearch } from 'lucide-react';

export const Footer: React.FC = React.memo(() => {
  return (
    <footer className="bg-[#06070B] text-slate-400 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 pointer-events-none opacity-15">
        <div className="absolute bottom-0 left-1/3 w-96 h-32 bg-red-600/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/25 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                SmartPDF <span className="text-red-500">AI</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Enterprise-grade PDF productivity platform running 100% locally in your browser with on-device conversion, OCR, and AI insights.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-800/40 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>100% Client-Side & Private</span>
            </div>

            {/* Social Icons with Touch Target */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X Twitter"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular PDF Tools */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Popular PDF Tools
            </h3>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/merge" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/split" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <Scissors className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Split PDF
                </Link>
              </li>
              <li>
                <Link to="/compress" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Compress PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-word" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" /> PDF to Word
                </Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <FileType className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/image-to-pdf" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <Image className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Image to PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Tools */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              AI Tools
            </h3>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/ai-assistant" className="hover:text-purple-400 transition-colors flex items-center gap-2 text-purple-400 font-semibold py-1.5 sm:py-0">
                  <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" /> AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/ai-chat" className="hover:text-amber-400 transition-colors flex items-center gap-2 text-amber-400 font-semibold py-1.5 sm:py-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> AI PDF Chat
                </Link>
              </li>
              <li>
                <Link to="/ocr-pdf" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <ScanText className="w-3.5 h-3.5 text-slate-500 shrink-0" /> OCR PDF
                </Link>
              </li>
              <li>
                <Link to="/analyzer" className="hover:text-red-400 transition-colors flex items-center gap-2 py-1.5 sm:py-0">
                  <FileSearch className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Doc Analyzer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/about" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link to="/review-process" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Review Process
                </Link>
              </li>
              <li>
                <Link to="/ai-content-policy" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  AI Content Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/privacy" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-red-400 transition-colors block py-1.5 sm:py-0">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SmartPDF AI. All rights reserved.</p>

          <p className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by <strong className="text-slate-200">SmartPDF AI</strong></span>
          </p>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              v2.6.0 (Production)
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
});

