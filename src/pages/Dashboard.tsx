import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { ToolCard } from '../components/ToolCard';
import { PDF_TOOLS } from '../utils/toolsData';
import { formatBytes } from '../utils/fileUtils';
import {
  getRecentFiles,
  updateRecentFile,
  removeRecentFile,
  clearRecentFiles,
  getSavedAiChats,
  updateAiChat,
  removeAiChat,
  clearSavedAiChats,
  getSavedAiAnalysisList,
  updateAiAnalysis,
  removeAiAnalysis,
  clearSavedAiAnalysisList,
  getSavedAnalyzerReports,
  updateAnalyzerReport,
  removeAnalyzerReport,
  clearSavedAnalyzerReports,
  getTotalStorageUsedBytes,
  getActivityLogs,
  getFavoriteTools,
  getThemePreference,
  setThemePreference,
  DEFAULT_WORKSPACE_FOLDERS,
  RecentFileRecord,
  SavedAiChat,
  SavedAiAnalysis,
  SavedAnalyzerReport,
} from '../utils/storageUtils';
import {
  LayoutDashboard,
  History,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Star,
  HardDrive,
  Settings,
  Search,
  Trash2,
  Edit3,
  Tag,
  Folder,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileCode,
  Moon,
  Sun,
  Shield,
  Zap,
  Filter,
  Plus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, updateProfile, sendEmailVerification, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'chats' | 'analysis' | 'reports' | 'favorites' | 'account'>('overview');

  // Theme Persistence
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(getThemePreference());

  // Workspace Storage Collections
  const [historyFiles, setHistoryFiles] = useState<RecentFileRecord[]>([]);
  const [savedChats, setSavedChats] = useState<SavedAiChat[]>([]);
  const [savedAnalysis, setSavedAnalysis] = useState<SavedAiAnalysis[]>([]);
  const [analyzerReports, setAnalyzerReports] = useState<SavedAnalyzerReport[]>([]);
  const [storageBytes, setStorageBytes] = useState(0);
  const [activityLogs, setActivityLogs] = useState(getActivityLogs());

  // Global Search & Folder Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All Folders');
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'size-desc'>('newest');

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');

  // Modal States
  // 1. Rename & Organize Modal
  const [editModal, setEditModal] = useState<{
    open: boolean;
    type: 'document' | 'chat' | 'analysis' | 'report';
    id: string;
    title: string;
    folder: string;
    tags: string[];
    newTagInput: string;
  } | null>(null);

  // 2. View Report Modal
  const [viewReportModal, setViewReportModal] = useState<SavedAnalyzerReport | null>(null);

  // 3. View Analysis Modal
  const [viewAnalysisModal, setViewAnalysisModal] = useState<SavedAiAnalysis | null>(null);

  // 4. View Chat Transcript Modal
  const [viewChatModal, setViewChatModal] = useState<SavedAiChat | null>(null);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    refreshAllCollections();
  }, []);

  const refreshAllCollections = () => {
    setHistoryFiles(getRecentFiles());
    setSavedChats(getSavedAiChats());
    setSavedAnalysis(getSavedAiAnalysisList());
    setAnalyzerReports(getSavedAnalyzerReports());
    setStorageBytes(getTotalStorageUsedBytes());
    setActivityLogs(getActivityLogs());
  };

  // Toggle Dark / Light Theme
  const handleToggleTheme = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    setThemePreference(mode);
    toast.success(`Switched to ${mode === 'dark' ? 'Dark Luxury' : 'Light Clean'} mode`);
  };

  // Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, company, jobTitle });
    toast.success('Profile and workspace details updated!');
  };

  // Trigger Google Login
  const handleGoogleSignIn = async () => {
    try {
      await googleLogin();
      toast.success('Signed in with Google!');
      refreshAllCollections();
    } catch {
      toast.error('Google Sign-In failed.');
    }
  };

  // ==========================================
  // Filtering & Search Utilities across items
  // ==========================================

  const matchesGlobalSearch = (text: string, tags?: string[], folder?: string) => {
    if (!globalSearch.trim()) return true;
    const query = globalSearch.toLowerCase();
    const matchText = text.toLowerCase().includes(query);
    const matchFolder = folder ? folder.toLowerCase().includes(query) : false;
    const matchTags = tags ? tags.some((t) => t.toLowerCase().includes(query)) : false;
    return matchText || matchFolder || matchTags;
  };

  const matchesFolderFilter = (folder?: string) => {
    if (selectedFolder === 'All Folders') return true;
    return (folder || 'General') === selectedFolder;
  };

  // 1. History Files
  const filteredHistory = historyFiles
    .filter((file) => matchesGlobalSearch(`${file.name} ${file.toolName}`, file.tags, file.folder))
    .filter((file) => matchesFolderFilter(file.folder))
    .filter((file) => toolFilter === 'all' || file.toolId === toolFilter)
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
      if (sortOrder === 'size-desc') return b.size - a.size;
      return 0;
    });

  // 2. Saved AI Chats
  const filteredChats = savedChats
    .filter((c) => matchesGlobalSearch(`${c.title} ${c.docName}`, c.tags, c.folder))
    .filter((c) => matchesFolderFilter(c.folder));

  // 3. Saved AI Analysis
  const filteredAnalysis = savedAnalysis
    .filter((a) => matchesGlobalSearch(`${a.title} ${a.docName} ${a.content}`, a.tags, a.folder))
    .filter((a) => matchesFolderFilter(a.folder));

  // 4. Saved Analyzer Reports
  const filteredReports = analyzerReports
    .filter((r) => matchesGlobalSearch(`${r.title} ${r.documentType} ${r.executiveSummary}`, r.tags, r.folder))
    .filter((r) => matchesFolderFilter(r.folder));

  // 5. Starred / Favorite Items
  const favoriteDocs = historyFiles.filter((f) => f.isFavorite);
  const favoriteChatsList = savedChats.filter((c) => c.isFavorite);
  const favoriteAnalysisList = savedAnalysis.filter((a) => a.isFavorite);
  const favoriteReportsList = analyzerReports.filter((r) => r.isFavorite);

  const favoriteIds = getFavoriteTools();
  const favoriteTools = PDF_TOOLS.filter((t) => favoriteIds.includes(t.id));

  // Storage Quota Math
  const MAX_STORAGE_LIMIT = user?.plan === 'enterprise' ? 107374182400 : user?.plan === 'pro' ? 21474836480 : 2147483648;
  const storagePercentage = Math.min(100, Math.round((storageBytes / MAX_STORAGE_LIMIT) * 100));

  // Total items search count
  const totalSearchResultCount =
    filteredHistory.length + filteredChats.length + filteredAnalysis.length + filteredReports.length;

  // ==========================================
  // CRUD Actions
  // ==========================================

  const handleToggleFavorite = (type: 'document' | 'chat' | 'analysis' | 'report', id: string) => {
    if (type === 'document') {
      const item = historyFiles.find((f) => f.id === id);
      if (item) {
        updateRecentFile(id, { isFavorite: !item.isFavorite });
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorite documents!');
      }
    } else if (type === 'chat') {
      const item = savedChats.find((c) => c.id === id);
      if (item) {
        updateAiChat(id, { isFavorite: !item.isFavorite });
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorite chats!');
      }
    } else if (type === 'analysis') {
      const item = savedAnalysis.find((a) => a.id === id);
      if (item) {
        updateAiAnalysis(id, { isFavorite: !item.isFavorite });
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorite analysis!');
      }
    } else if (type === 'report') {
      const item = analyzerReports.find((r) => r.id === id);
      if (item) {
        updateAnalyzerReport(id, { isFavorite: !item.isFavorite });
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorite reports!');
      }
    }
    refreshAllCollections();
  };

  const handleDeleteItem = (type: 'document' | 'chat' | 'analysis' | 'report', id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      if (type === 'document') removeRecentFile(id);
      if (type === 'chat') removeAiChat(id);
      if (type === 'analysis') removeAiAnalysis(id);
      if (type === 'report') removeAnalyzerReport(id);

      refreshAllCollections();
      toast.success('Item deleted from workspace.');
    }
  };

  // Open Edit/Organize Modal
  const openEditModal = (type: 'document' | 'chat' | 'analysis' | 'report', id: string) => {
    let title = '';
    let folder = 'General';
    let tags: string[] = [];

    if (type === 'document') {
      const item = historyFiles.find((f) => f.id === id);
      if (item) {
        title = item.name;
        folder = item.folder || 'General';
        tags = item.tags || [];
      }
    } else if (type === 'chat') {
      const item = savedChats.find((c) => c.id === id);
      if (item) {
        title = item.title;
        folder = item.folder || 'General';
        tags = item.tags || [];
      }
    } else if (type === 'analysis') {
      const item = savedAnalysis.find((a) => a.id === id);
      if (item) {
        title = item.title;
        folder = item.folder || 'General';
        tags = item.tags || [];
      }
    } else if (type === 'report') {
      const item = analyzerReports.find((r) => r.id === id);
      if (item) {
        title = item.title;
        folder = item.folder || 'General';
        tags = item.tags || [];
      }
    }

    setEditModal({ open: true, type, id, title, folder, tags, newTagInput: '' });
  };

  // Save Edit/Organize Changes
  const handleSaveOrganizeModal = () => {
    if (!editModal) return;
    const { type, id, title, folder, tags } = editModal;

    if (type === 'document') {
      updateRecentFile(id, { name: title, folder, tags });
    } else if (type === 'chat') {
      updateAiChat(id, { title, folder, tags });
    } else if (type === 'analysis') {
      updateAiAnalysis(id, { title, folder, tags });
    } else if (type === 'report') {
      updateAnalyzerReport(id, { title, folder, tags });
    }

    refreshAllCollections();
    setEditModal(null);
    toast.success('Workspace item updated successfully!');
  };

  // Copy Content to Clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==========================================
  // Report Exports (PDF, DOCX, JSON)
  // ==========================================

  const handleExportReportPDF = (report: SavedAnalyzerReport) => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('SmartPDF AI v1.3 - Document Analysis Report', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Title: ${report.title}`, 14, 27);
      doc.text(`Type: ${report.documentType} (Confidence: ${report.confidenceScore}%)`, 14, 33);

      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      let y = 45;

      // Executive Summary
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Executive Summary', 14, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(report.executiveSummary, 180);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 5 + 6;

      // Entities
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Extracted Key Information', 14, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      const e = report.entities;
      const entitySummary = [
        `Persons: ${e.personNames?.join(', ') || 'None'}`,
        `Organizations: ${e.organizations?.join(', ') || 'None'}`,
        `Dates: ${e.dates?.join(', ') || 'None'}`,
        `Amounts: ${e.amounts?.join(', ') || 'None'}`,
        `Emails: ${e.emails?.join(', ') || 'None'}`,
        `Phones: ${e.phoneNumbers?.join(', ') || 'None'}`,
        `Addresses: ${e.addresses?.join(', ') || 'None'}`,
        `IDs: ${e.ids?.join(', ') || 'None'}`,
      ];

      for (const line of entitySummary) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const wrapped = doc.splitTextToSize(line, 180);
        doc.text(wrapped, 14, y);
        y += wrapped.length * 4.5;
      }
      y += 6;

      // Risks
      if (report.risks && report.risks.length > 0) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Detected Risks & Issues', 14, y);
        y += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        for (const r of report.risks) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const riskText = `[${r.severity.toUpperCase()}] ${r.title}: ${r.description}`;
          const wrapped = doc.splitTextToSize(riskText, 180);
          doc.text(wrapped, 14, y);
          y += wrapped.length * 4.5 + 2;
        }
      }

      doc.save(`${report.title.toLowerCase().replace(/\s+/g, '_')}_report.pdf`);
      toast.success('Exported PDF report successfully!');
    } catch (err: any) {
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  const handleExportReportDOCX = async (report: SavedAnalyzerReport) => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: 'SmartPDF AI v1.3 - Document Analysis Report',
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Title: ${report.title}\n`, bold: true }),
                  new TextRun({ text: `Document Type: ${report.documentType} (Confidence: ${report.confidenceScore}%)\n` }),
                ],
              }),
              new Paragraph({
                text: 'Executive Summary',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({ text: report.executiveSummary }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}_report.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported DOCX report successfully!');
    } catch (err: any) {
      toast.error('Failed to export DOCX: ' + err.message);
    }
  };

  const handleExportReportJSON = (report: SavedAnalyzerReport) => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported JSON analysis!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-8 transition-colors">
      <SEO
        title="User Workspace & Personal Dashboard - SmartPDF AI"
        description="Unified authenticated user workspace: manage document history, saved AI chats, AI analysis, document analyzer reports, and favorite tools."
        path="/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================== */}
        {/* User Header & Workspace Stats Bar */}
        {/* ========================================== */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-red-500/40 shadow-lg"
              />
              {user?.provider === 'google' && (
                <div
                  className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md"
                  title="Google Account Connected"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
                <span className="px-3 py-0.5 text-xs font-extrabold uppercase rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm">
                  {user?.plan} Workspace
                </span>
                {user?.provider === 'google' && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Google SSO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                {user?.company && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{user.company}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Storage Status */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-[#18181d] border border-slate-800 rounded-2xl p-3.5 min-w-[240px]">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Cloud Storage</span>
                  <span className="text-red-400">{storagePercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, storagePercentage)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {formatBytes(storageBytes)} / {formatBytes(MAX_STORAGE_LIMIT)}
                </p>
              </div>
            </div>

            {user?.provider !== 'google' && (
              <button
                onClick={handleGoogleSignIn}
                className="px-3.5 py-2.5 bg-[#18181d] hover:bg-[#222228] text-white border border-slate-700/80 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                Connect Google
              </button>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* Global Search & Workspace Folder Filter */}
        {/* ========================================== */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search across all documents, AI chats, summaries, and analyzer reports..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Folder Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
                Folder:
              </span>
              {['All Folders', ...DEFAULT_WORKSPACE_FOLDERS].map((folderName) => (
                <button
                  key={folderName}
                  onClick={() => setSelectedFolder(folderName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFolder === folderName
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-[#18181d] text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {folderName}
                </button>
              ))}
            </div>
          </div>

          {globalSearch && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <span>
                Found <strong className="text-red-400">{totalSearchResultCount}</strong> matching workspace items for "
                {globalSearch}"
              </span>
              <button onClick={() => setGlobalSearch('')} className="text-red-400 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* Workspace Navigation Tabs */}
        {/* ========================================== */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            Document History ({filteredHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            AI Chats ({filteredChats.length})
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Saved Analysis ({filteredAnalysis.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Analyzer Reports ({filteredReports.length})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            Favorites ({favoriteDocs.length + favoriteChatsList.length + favoriteAnalysisList.length + favoriteReportsList.length})
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'account'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            Account & Preferences
          </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="p-3 w-fit rounded-2xl bg-red-500/10 text-red-400 mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-white">{historyFiles.length}</p>
                <p className="text-xs text-slate-400 mt-1">Processed Documents</p>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-400 mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-white">{savedChats.length}</p>
                <p className="text-xs text-slate-400 mt-1">Saved AI PDF Chats</p>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="p-3 w-fit rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-white">{savedAnalysis.length}</p>
                <p className="text-xs text-slate-400 mt-1">Saved AI Summaries</p>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-white">{analyzerReports.length}</p>
                <p className="text-xs text-slate-400 mt-1">Audit Reports</p>
              </div>
            </div>

            {/* Document Analyzer v1.2 Featured Card */}
            <div className="bg-gradient-to-r from-red-950/60 via-[#121215] to-[#121215] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-extrabold uppercase tracking-wider mb-3 inline-block">
                  SmartPDF AI v1.2 Enterprise Suite
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                  Enterprise Document Analyzer
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Automatically classify Invoices, Contracts, Resumes, and Legal Agreements, extract structured key entities, detect high-risk clauses, and generate action items.
                </p>
              </div>

              <Link
                to="/document-analyzer"
                className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/25 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Launch Analyzer Workspace
              </Link>
            </div>

            {/* Recent Jobs & Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Files */}
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-400" />
                    <h3 className="text-base font-extrabold text-white">Recent Document Activity</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    <p className="text-xs font-bold">No file activity recorded yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {filteredHistory.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 font-extrabold text-xs">
                            PDF
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{file.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {file.toolName} • {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite('document', file.id)}
                            className="p-1.5 text-slate-400 hover:text-yellow-400"
                          >
                            <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => openEditModal('document', file.id)}
                            className="p-1.5 text-slate-400 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Stream */}
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-white">System Activity Logs</h3>
                </div>

                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#18181d] border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-200">{log.action}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.toolName}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap ml-2">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: DOCUMENT HISTORY */}
        {/* ========================================== */}
        {activeTab === 'history' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Processed Document History</h2>
                <p className="text-xs text-slate-400">Manage, organize into folders, tag, and rename past files.</p>
              </div>

              {historyFiles.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all processing history?')) {
                      clearRecentFiles();
                      refreshAllCollections();
                      toast.success('History cleared.');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Clear History
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={toolFilter}
                onChange={(e) => setToolFilter(e.target.value)}
                className="py-2.5 px-3 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="all">All PDF Tools</option>
                {PDF_TOOLS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="py-2.5 px-3 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="size-desc">Sort: File Size (Largest)</option>
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm font-bold">No documents matching filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Document Name</th>
                      <th className="p-3.5">Folder</th>
                      <th className="p-3.5">Tool Used</th>
                      <th className="p-3.5">Size</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFavorite('document', item.id)}
                              className="text-slate-500 hover:text-yellow-400 cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                            <div>
                              <p className="font-bold text-white max-w-xs truncate">{item.name}</p>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-red-500/10 text-red-300 border border-red-500/20"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                            {item.folder || 'General'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 font-semibold">{item.toolName}</td>
                        <td className="p-3.5 text-slate-400">{formatBytes(item.size)}</td>
                        <td className="p-3.5 text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal('document', item.id)}
                            className="p-2 text-slate-400 hover:text-white inline-block transition-colors cursor-pointer"
                            title="Rename & Organize"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/${item.toolId}`}
                            className="p-2 text-slate-400 hover:text-red-400 inline-block transition-colors"
                            title="Open Tool"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteItem('document', item.id, item.name)}
                            className="p-2 text-slate-400 hover:text-red-500 inline-block transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: RECENT AI CHATS */}
        {/* ========================================== */}
        {activeTab === 'chats' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Saved AI PDF Chat Sessions</h2>
                <p className="text-xs text-slate-400">Review, resume, or export your AI document conversations.</p>
              </div>

              <Link
                to="/ai-chat"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Start New AI Chat
              </Link>
            </div>

            {filteredChats.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <MessageSquare className="w-10 h-10 mx-auto text-blue-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No AI chat sessions found</p>
                <p className="text-xs text-slate-600 mt-1">Upload a PDF in AI PDF Chat to automatically save sessions here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-5 bg-[#18181d] border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white truncate max-w-xs">{chat.title}</h3>
                            <button
                              onClick={() => handleToggleFavorite('chat', chat.id)}
                              className="text-slate-500 hover:text-yellow-400 cursor-pointer"
                            >
                              <Star className={`w-3.5 h-3.5 ${chat.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Doc: {chat.docName} ({chat.pageCount} pages)
                          </p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-slate-800 text-slate-300">
                          {chat.folder || 'General'}
                        </span>
                      </div>

                      {/* Last Message Preview */}
                      {chat.messages && chat.messages.length > 0 && (
                        <div className="p-3 bg-[#121215] border border-slate-800/80 rounded-xl my-3 text-xs text-slate-300 italic line-clamp-2">
                          "{chat.messages[chat.messages.length - 1].text}"
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{chat.messages.length} messages</span>
                        <span>•</span>
                        <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setViewChatModal(chat)}
                        className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Read Transcript <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal('chat', chat.id)}
                          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                          title="Rename & Organize"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('chat', chat.id, chat.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: SAVED AI ANALYSIS */}
        {/* ========================================== */}
        {activeTab === 'analysis' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Saved AI Summaries & Analysis</h2>
                <p className="text-xs text-slate-400">Instant access to generated executive summaries, key takeaways, and translations.</p>
              </div>

              <Link
                to="/ai-assistant"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Run New AI Analysis
              </Link>
            </div>

            {filteredAnalysis.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No saved AI analysis found</p>
                <p className="text-xs text-slate-600 mt-1">Run AI Assistant tools to save output reports here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAnalysis.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-[#18181d] border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white truncate max-w-xs">{item.title}</h3>
                            <button
                              onClick={() => handleToggleFavorite('analysis', item.id)}
                              className="text-slate-500 hover:text-yellow-400 cursor-pointer"
                            >
                              <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Doc: {item.docName}
                          </p>
                        </div>

                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {item.actionType}
                        </span>
                      </div>

                      {/* Content Snippet */}
                      <div className="p-3 bg-[#121215] border border-slate-800/80 rounded-xl my-3 text-xs text-slate-300 whitespace-pre-wrap line-clamp-3 font-sans leading-relaxed">
                        {item.content}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Folder: {item.folder || 'General'}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewAnalysisModal(item)}
                          className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Full Text <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyText(item.id, item.content)}
                          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                          title="Copy Content"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal('analysis', item.id)}
                          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                          title="Rename & Organize"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('analysis', item.id, item.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete Analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: DOCUMENT ANALYZER REPORTS */}
        {/* ========================================== */}
        {activeTab === 'reports' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Saved Document Analyzer Reports</h2>
                <p className="text-xs text-slate-400">Enterprise AI audit reports with risk flags, extracted entities, and exports.</p>
              </div>

              <Link
                to="/document-analyzer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Analyze New Document
              </Link>
            </div>

            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No document analyzer reports found</p>
                <p className="text-xs text-slate-600 mt-1">Run Document Analyzer v1.2 to save audit reports here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 bg-[#18181d] border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white truncate max-w-xs">{report.title}</h3>
                            <button
                              onClick={() => handleToggleFavorite('report', report.id)}
                              className="text-slate-500 hover:text-yellow-400 cursor-pointer"
                            >
                              <Star className={`w-3.5 h-3.5 ${report.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {report.documentType}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Confidence: <strong className="text-white">{report.confidenceScore}%</strong>
                            </span>
                          </div>
                        </div>

                        {report.risks && report.risks.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" /> {report.risks.length} Risks
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 my-3 line-clamp-2 leading-relaxed">
                        {report.executiveSummary}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 my-2">
                        <span>Entities: {report.entities?.personNames?.length || 0} Persons, {report.entities?.organizations?.length || 0} Orgs</span>
                        <span>•</span>
                        <span>Actions: {report.actionItems?.length || 0} tasks</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setViewReportModal(report)}
                        className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View Interactive Report <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleExportReportPDF(report)}
                          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                          title="Export PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal('report', report.id)}
                          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                          title="Rename & Organize"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('report', report.id, report.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: FAVORITE ITEMS */}
        {/* ========================================== */}
        {activeTab === 'favorites' && (
          <div className="space-y-8">
            {/* Starred Favorite Tools */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-extrabold text-white">Starred Favorite PDF Tools</h2>
              </div>

              {favoriteTools.length === 0 ? (
                <p className="text-xs text-slate-500">No tools starred yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favoriteTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>

            {/* Starred Workspace Collections */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-extrabold text-white">Starred Documents & AI Assets</h2>

              {favoriteDocs.length === 0 && favoriteChatsList.length === 0 && favoriteAnalysisList.length === 0 && favoriteReportsList.length === 0 ? (
                <div className="py-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  <Star className="w-8 h-8 mx-auto text-yellow-400 opacity-40 mb-2" />
                  <p className="text-xs font-bold">No starred workspace items yet</p>
                  <p className="text-xs text-slate-600 mt-1">Click the star icon on any document, AI chat, or report to save it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteDocs.map((doc) => (
                    <div key={doc.id} className="p-3 bg-[#18181d] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        <span className="font-bold text-white">{doc.name}</span>
                        <span className="text-[10px] text-slate-500">({doc.toolName})</span>
                      </div>
                      <button onClick={() => handleToggleFavorite('document', doc.id)} className="text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                      </button>
                    </div>
                  ))}

                  {favoriteChatsList.map((chat) => (
                    <div key={chat.id} className="p-3 bg-[#18181d] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">{chat.title}</span>
                      </div>
                      <button onClick={() => handleToggleFavorite('chat', chat.id)} className="text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                      </button>
                    </div>
                  ))}

                  {favoriteReportsList.map((rep) => (
                    <div key={rep.id} className="p-3 bg-[#18181d] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{rep.title}</span>
                        <span className="text-[10px] text-emerald-400">({rep.documentType})</span>
                      </div>
                      <button onClick={() => handleToggleFavorite('report', rep.id)} className="text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 7: ACCOUNT & PREFERENCES */}
        {/* ========================================== */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Form */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">User Profile & Organization</h2>
                <p className="text-xs text-slate-400">Manage account credentials and workspace information.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-3 bg-[#18181d]/50 border border-slate-800 rounded-2xl text-slate-400 text-xs cursor-not-allowed"
                    />
                    {user?.emailVerified ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2.5 rounded-xl border border-emerald-500/20 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sendEmailVerification();
                          toast.success('Verification link sent!');
                        }}
                        className="px-3 py-2.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 hover:bg-amber-500/30 whitespace-nowrap cursor-pointer"
                      >
                        Verify Email
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="Legal Counsel"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>

            {/* Dark Mode Persistence & Workspace Preferences */}
            <div className="space-y-6">
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div>
                  <h2 className="text-xl font-black text-white">Appearance & Dark Mode</h2>
                  <p className="text-xs text-slate-400">Persist visual theme preference across all user sessions.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleToggleTheme('dark')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      themeMode === 'dark'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                        : 'bg-[#18181d] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-red-400" />
                    <span className="text-xs font-bold">Dark Luxury Mode</span>
                  </button>

                  <button
                    onClick={() => handleToggleTheme('light')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      themeMode === 'light'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-[#18181d] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-bold">Clean Light Mode</span>
                  </button>
                </div>
              </div>

              {/* Security & Authentication */}
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> Account Security & SSO
                </h3>
                <p className="text-xs text-slate-400">
                  Google SSO authentication status: <strong className="text-white">{user?.provider === 'google' ? 'Connected' : 'Not Connected'}</strong>
                </p>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 bg-[#18181d] hover:bg-[#222228] border border-slate-700/80 rounded-2xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  Re-Authenticate with Google
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL 1: RENAME & ORGANIZE MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {editModal && editModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-red-400" /> Rename & Organize Item
                </h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Title / Name</label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Folder Category</label>
                <select
                  value={editModal.folder}
                  onChange={(e) => setEditModal({ ...editModal, folder: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                >
                  {DEFAULT_WORKSPACE_FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Custom Tags</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag (e.g., Urgent)"
                    value={editModal.newTagInput}
                    onChange={(e) => setEditModal({ ...editModal, newTagInput: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editModal.newTagInput.trim()) {
                        setEditModal({
                          ...editModal,
                          tags: [...editModal.tags, editModal.newTagInput.trim()],
                          newTagInput: '',
                        });
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {editModal.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() =>
                          setEditModal({
                            ...editModal,
                            tags: editModal.tags.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:text-red-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrganizeModal}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 2: VIEW FULL ANALYZER REPORT */}
      {/* ========================================== */}
      <AnimatePresence>
        {viewReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {viewReportModal.documentType}
                    </span>
                    <span className="text-xs text-slate-400">
                      Confidence: <strong className="text-white">{viewReportModal.confidenceScore}%</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">{viewReportModal.title}</h2>
                </div>

                <button
                  onClick={() => setViewReportModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Executive Summary */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Executive Summary
                </h3>
                <p className="text-xs text-slate-300 bg-[#18181d] p-4 rounded-2xl border border-slate-800 leading-relaxed">
                  {viewReportModal.executiveSummary}
                </p>
              </div>

              {/* Key Extracted Entities */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Extracted Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {viewReportModal.entities?.personNames?.length > 0 && (
                    <div className="p-3 bg-[#18181d] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 font-bold block mb-1">Persons:</span>
                      <span className="text-white font-semibold">{viewReportModal.entities.personNames.join(', ')}</span>
                    </div>
                  )}

                  {viewReportModal.entities?.organizations?.length > 0 && (
                    <div className="p-3 bg-[#18181d] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 font-bold block mb-1">Organizations:</span>
                      <span className="text-white font-semibold">{viewReportModal.entities.organizations.join(', ')}</span>
                    </div>
                  )}

                  {viewReportModal.entities?.dates?.length > 0 && (
                    <div className="p-3 bg-[#18181d] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 font-bold block mb-1">Dates:</span>
                      <span className="text-white font-semibold">{viewReportModal.entities.dates.join(', ')}</span>
                    </div>
                  )}

                  {viewReportModal.entities?.amounts?.length > 0 && (
                    <div className="p-3 bg-[#18181d] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 font-bold block mb-1">Amounts:</span>
                      <span className="text-emerald-400 font-semibold">{viewReportModal.entities.amounts.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Risks */}
              {viewReportModal.risks && viewReportModal.risks.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Detected Risks ({viewReportModal.risks.length})
                  </h3>
                  <div className="space-y-2">
                    {viewReportModal.risks.map((r, i) => (
                      <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-bold text-red-300">{r.title}</span>
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-red-500/20 text-red-200 rounded">
                            {r.severity}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportReportPDF(viewReportModal)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleExportReportDOCX(viewReportModal)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> DOCX
                  </button>
                  <button
                    onClick={() => handleExportReportJSON(viewReportModal)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" /> JSON
                  </button>
                </div>

                <button
                  onClick={() => setViewReportModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 3: VIEW FULL AI ANALYSIS */}
      {/* ========================================== */}
      <AnimatePresence>
        {viewAnalysisModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {viewAnalysisModal.actionType}
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">{viewAnalysisModal.title}</h2>
                </div>
                <button
                  onClick={() => setViewAnalysisModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#18181d] border border-slate-800 rounded-2xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {viewAnalysisModal.content}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleCopyText(viewAnalysisModal.id, viewAnalysisModal.content)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {copiedId === viewAnalysisModal.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Text
                </button>

                <button
                  onClick={() => setViewAnalysisModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 4: VIEW CHAT TRANSCRIPT */}
      {/* ========================================== */}
      <AnimatePresence>
        {viewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">{viewChatModal.title}</h2>
                  <p className="text-xs text-slate-400">Document: {viewChatModal.docName}</p>
                </div>
                <button
                  onClick={() => setViewChatModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 my-4">
                {viewChatModal.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-red-600 text-white ml-auto'
                        : 'bg-[#18181d] border border-slate-800 text-slate-200 mr-auto'
                    }`}
                  >
                    <div className="text-[10px] opacity-70 mb-1 font-bold">
                      {msg.sender === 'user' ? 'You' : 'SmartPDF AI'} • {msg.timestamp}
                    </div>
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <Link
                  to="/ai-chat"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" /> Open Chat Studio
                </Link>

                <button
                  onClick={() => setViewChatModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
