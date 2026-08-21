import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Lock,
  Download,
  Eye,
  Check,
  Save,
  RotateCcw,
  ShieldCheck,
  Trash2,
  FileJson,
  AlertTriangle,
  ExternalLink,
  Cookie,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { SEO } from '../components/SEO';

export const Settings: React.FC = () => {
  const { showToast, info, error: toastError } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  // Export & Deletion State
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      if (!token) {
        toastError('Please sign in to export your personal account data.');
        setIsExporting(false);
        return;
      }

      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate export archive');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartpdf_data_export_${user?.id || 'account'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Personal data export downloaded successfully.', 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      toastError('Failed to download user data. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toastError('Please type DELETE to confirm account deletion.');
      return;
    }

    try {
      setIsDeleting(true);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      if (!token) {
        toastError('Session expired. Please sign in again.');
        setIsDeleting(false);
        return;
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setShowDeleteModal(false);
      await logout();
      showToast('Your account and personal data have been permanently deleted.', 'success');
      navigate('/');
    } catch (err: any) {
      console.error('Account deletion error:', err);
      toastError(err.message || 'An error occurred during account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Settings & Preferences - SmartPDF AI"
        description="Configure theme, privacy, notifications, download defaults, data export, and accessibility settings."
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

        {/* Section 4: Data Rights & Compliance (GDPR/CCPA) */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-extrabold text-white">Data Rights & Privacy Controls</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Data */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>Export Account Data (JSON)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Download a structured, machine-readable JSON archive of your personal profile, chat histories, report metadata, and workspace settings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Preparing Archive...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download JSON Archive</span>
                  </>
                )}
              </button>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete Account & Data</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permanently delete your profile, authentication credentials, chat history, and personal Firestore documents. This action is irreversible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account...</span>
              </button>
            </div>
          </div>

          {/* Legal and Compliance Links Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Compliance & Trust Resources:</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/privacy" className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3" /> Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3" /> Terms
              </Link>
              <Link to="/cookies" className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
                <Cookie className="w-3 h-3" /> Cookie Policy
              </Link>
              <Link to="/security" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Security & Trust
              </Link>
            </div>
          </div>
        </div>

        {/* Section 5: Accessibility */}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141418] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This action <strong className="text-red-400">CANNOT be undone</strong>. All your chat history, uploaded document analysis logs, and saved preferences will be permanently wiped from our database.
                </p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-300">
                To confirm, please type <strong className="text-white font-mono uppercase">DELETE</strong> below:
              </div>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-[#1c1c22] border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/40 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
