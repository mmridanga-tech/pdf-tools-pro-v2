import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Zap, Github, Linkedin, Twitter, ExternalLink, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070708] text-slate-400 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Info & Social Icons */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                SmartPDF <span className="text-red-500">AI</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Enterprise PDF productivity platform featuring client-side WebAssembly conversion, Gemini AI Document Chat, OCR text extraction, and secure Team Workspaces.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Ephemeral RAM purge & 256-bit SSL</span>
            </div>
          </div>

          {/* Core Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-red-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-red-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-red-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-red-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-red-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Platform Tools */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              AI & Power Tools
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/ai-chat" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> AI PDF Chat
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-purple-400 font-bold">
                  <Zap className="w-3.5 h-3.5" /> AI Assistant Suite
                </Link>
              </li>
              <li>
                <Link to="/ocr-pdf" className="hover:text-red-400 transition-colors">
                  OCR Text Extractor
                </Link>
              </li>
              <li>
                <Link to="/cloud-storage" className="hover:text-red-400 transition-colors">
                  Cloud Drive Sync
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-red-400 transition-colors">
                  Team Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Community */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Support & Utilities
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/help" className="hover:text-red-400 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-red-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-red-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-red-400 transition-colors">
                  Legal Disclaimer
                </Link>
              </li>
              <li>
                <a href="https://smartpdfai.tech" className="hover:text-red-400 transition-colors flex items-center gap-1 text-slate-400">
                  <Globe className="w-3 h-3" /> smartpdfai.tech
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright, version & disclaimer bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SmartPDF AI. All rights reserved.</p>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              v2.6.0 (Production)
            </span>
            <a
              href="mailto:mmridanga@gmail.com"
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              mmridanga@gmail.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
