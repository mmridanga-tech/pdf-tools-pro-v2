import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Linkedin, Twitter, Heart } from 'lucide-react';

export const Footer: React.FC = React.memo(() => {
  return (
    <footer className="bg-[#08090d] text-slate-400 border-t border-white/[0.06] pt-12 pb-8 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/[0.06]">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 sm:col-span-2 md:col-span-2 space-y-3 pr-0 md:pr-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-base group-hover:bg-red-500 transition-colors">
                S
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                SmartPDF <span className="text-red-500">AI</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Enterprise-grade PDF productivity platform running 100% locally in your browser with on-device conversion, OCR, and AI insights.
            </p>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>100% Client-Side & Private</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X Twitter"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Tools */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Tools
            </h3>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link to="/merge" className="text-slate-400 hover:text-white transition-colors block">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/split" className="text-slate-400 hover:text-white transition-colors block">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link to="/compress" className="text-slate-400 hover:text-white transition-colors block">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-word" className="text-slate-400 hover:text-white transition-colors block">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="text-slate-400 hover:text-white transition-colors block">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/image-to-pdf" className="text-slate-400 hover:text-white transition-colors block">
                  Image to PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AI & Intelligence */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mb-3">
              AI Tools
            </h3>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link to="/ai-assistant" className="text-slate-400 hover:text-white transition-colors block">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/ai-chat" className="text-slate-400 hover:text-white transition-colors block">
                  AI PDF Chat
                </Link>
              </li>
              <li>
                <Link to="/ocr-pdf" className="text-slate-400 hover:text-white transition-colors block">
                  OCR PDF
                </Link>
              </li>
              <li>
                <Link to="/document-analyzer" className="text-slate-400 hover:text-white transition-colors block">
                  Doc Analyzer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Company & Legal
            </h3>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors block">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="text-slate-400 hover:text-white transition-colors block">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link to="/review-process" className="text-slate-400 hover:text-white transition-colors block">
                  Review Process
                </Link>
              </li>
              <li>
                <Link to="/ai-content-policy" className="text-slate-400 hover:text-white transition-colors block">
                  AI Content Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors block">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-slate-400 hover:text-white transition-colors block">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-slate-400 hover:text-white transition-colors block">
                  Security & Trust
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 SmartPDF AI. All rights reserved.</p>

          <p className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>by <strong className="text-slate-300">SmartPDF AI</strong></span>
          </p>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              v2.6.0 (Production)
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
});


