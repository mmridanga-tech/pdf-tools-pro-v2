import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  Lock,
  Download,
  Eye,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';

export const Settings: React.FC = () => {
  const { showToast, info } = useToast();

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    conversionComplete: true,
    securityAlerts: true,
  });
  const [privacy, setPrivacy] = useState({
    autoDeleteFilesHours: '1',
    shareTelemetry: true,
    rememberFileHistory: true,
  });
  const [downloadOpts, setDownloadOpts] = useState({
    appendTimestamp: true,
    directDownload: true,
    defaultCompression: 'recommended',
  });
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
  });

  const handleSave = () => {
    showToast('Settings preferences saved successfully', 'success');
  };

  const handleReset = () => {
    setTheme('dark');
    setLanguage('en');
    setNotifications({ emailUpdates: true, conversionComplete: true, securityAlerts: true });
    setPrivacy({ autoDeleteFilesHours: '1', shareTelemetry: true, rememberFileHistory: true });
    setDownloadOpts({ appendTimestamp: true, directDownload: true, defaultCompression: 'recommended' });
    setAccessibility({ highContrast: false, reducedMotion: false, fontSize: 'medium' });
    info('Settings reset to default values');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Settings & Preferences - SmartPDF AI"
        description="Configure theme, privacy, notifications, download defaults, and accessibility settings."
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <SettingsIcon className="w-3.5 h-3.5" /> Workspace Configuration
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Platform Settings</h1>
            <p className="text-sm text-slate-400">
              Customize your processing preferences, privacy controls, and user experience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Moon className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-extrabold text-white">Appearance & Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['dark', 'light', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  theme === mode
                    ? 'bg-red-500/10 border-red-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  {mode === 'dark' && <Moon className="w-5 h-5 text-purple-400" />}
                  {mode === 'light' && <Sun className="w-5 h-5 text-amber-400" />}
                  {mode === 'system' && <Globe className="w-5 h-5 text-blue-400" />}
                  {theme === mode && <Check className="w-4 h-4 text-red-500" />}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold capitalize">{mode} Mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {mode === 'dark' && 'OLED dark contrast optimized for PDF focus'}
                    {mode === 'light' && 'High light intensity for bright environments'}
                    {mode === 'system' && 'Sync automatically with OS preferences'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Privacy & Data Retention */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">Privacy & File Storage</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">Automatic File Auto-Purge</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Set how long processed files stay stored in transient RAM before deletion.
                </p>
              </div>
              <select
                value={privacy.autoDeleteFilesHours}
                onChange={(e) => setPrivacy({ ...privacy, autoDeleteFilesHours: e.target.value })}
                className="bg-[#18181d] border border-slate-800 text-white rounded-xl px-3 py-1.5 font-semibold text-xs"
              >
                <option value="0.5">30 Minutes</option>
                <option value="1">1 Hour (Recommended)</option>
                <option value="6">6 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">Browser File History</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Keep recent converted file logs in encrypted client localStorage.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.rememberFileHistory}
                onChange={(e) => setPrivacy({ ...privacy, rememberFileHistory: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Downloads & File Preferences */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Download className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-extrabold text-white">Downloads & File Naming</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">Append Timestamp to Converted Files</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Example: <code className="text-red-400">document_20260801.pdf</code>
                </p>
              </div>
              <input
                type="checkbox"
                checked={downloadOpts.appendTimestamp}
                onChange={(e) => setDownloadOpts({ ...downloadOpts, appendTimestamp: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">Direct Download Trigger</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Automatically start browser download as soon as processing completes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={downloadOpts.directDownload}
                onChange={(e) => setDownloadOpts({ ...downloadOpts, directDownload: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Accessibility */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Eye className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-extrabold text-white">Accessibility & Display</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">Reduced Motion Animations</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Minimize transition effects for smoother accessibility performance.
                </p>
              </div>
              <input
                type="checkbox"
                checked={accessibility.reducedMotion}
                onChange={(e) => setAccessibility({ ...accessibility, reducedMotion: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="font-bold text-white">UI Font Scaling</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Adjust text size across tools.</p>
              </div>
              <select
                value={accessibility.fontSize}
                onChange={(e) => setAccessibility({ ...accessibility, fontSize: e.target.value })}
                className="bg-[#18181d] border border-slate-800 text-white rounded-xl px-3 py-1.5 font-semibold text-xs"
              >
                <option value="small">Small (Compact)</option>
                <option value="medium">Medium (Default)</option>
                <option value="large">Large (Accessible)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
