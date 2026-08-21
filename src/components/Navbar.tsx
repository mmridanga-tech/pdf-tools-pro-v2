import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Cpu,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ToolId, UserSession, SystemHealthData } from '../types';
import { api } from '../services/apiClient';

interface NavbarProps {
  activeTool: ToolId | null;
  onSelectTool: (id: ToolId | null) => void;
  userSession: UserSession;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  onSelectTool,
  userSession,
  onOpenPricing,
  onOpenAuth,
}) => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => onSelectTool(null)}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">SmartPDF</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Privacy-First Browser WASM Engine
            </p>
          </div>
        </div>

        {/* Quick Nav Tools Switcher */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            id="nav-all-tools"
            onClick={() => onSelectTool(null)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === null
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All PDF Tools
          </button>
          <button
            id="nav-ai-chat"
            onClick={() => onSelectTool('ai-chat')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTool === 'ai-chat'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Document Chat
          </button>
          <button
            id="nav-ai-analyzer"
            onClick={() => onSelectTool('ai-analyzer')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTool === 'ai-analyzer'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Enterprise Analyzer
          </button>
          <button
            id="nav-telemetry"
            onClick={() => onSelectTool('telemetry')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTool === 'telemetry'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Telemetry
          </button>
          {userSession.role === 'admin' && (
            <button
              id="nav-admin-seo"
              onClick={() => onSelectTool('admin-seo')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTool === 'admin-seo'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              SEO Studio
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Status Indicator */}
          <div
            id="system-health-pill"
            title={`System: ${health?.status || 'Operational'} | Gemini: ${health?.services.gemini.status || 'Active'}`}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WASM / Gemini Active</span>
          </div>

          {/* Pricing / Plan Badge */}
          <button
            id="pricing-button"
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-xs shadow-sm hover:opacity-95 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="capitalize">{userSession.plan} Plan</span>
          </button>

          {/* User Account / Session */}
          <button
            id="auth-profile-button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
              {userSession.email.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[100px] truncate hidden sm:inline">{userSession.email.split('@')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
