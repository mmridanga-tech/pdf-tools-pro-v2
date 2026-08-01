import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import {
  Cloud,
  CheckCircle2,
  HardDrive,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Folder,
  FileText,
  Search,
  UploadCloud,
  DownloadCloud,
  Check,
  X,
  Plus,
  Radio,
  Clock,
  Sparkles,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CloudProviderId,
  SyncStatusType,
  CloudDriveFile,
  CloudDriveFolder,
  INITIAL_CLOUD_FOLDERS,
  getCloudAccounts,
  updateCloudAccount,
  getSyncStatus,
  setSyncStatus,
  triggerCloudSync,
  getCloudFiles,
  saveCloudFile,
  deleteCloudFile,
  createDummyFileFromCloudDrive,
  CloudAccountInfo,
} from '../utils/cloudDriveUtils';
import { CloudDrivePickerModal } from '../components/CloudDrivePickerModal';
import { getRecentFiles, getSavedAiChats, getSavedAiAnalysisList, getSavedAnalyzerReports } from '../utils/storageUtils';

export const CloudStoragePage: React.FC = () => {
  const toast = useToast();

  // Cloud Account State
  const [accounts, setAccounts] = useState<Record<CloudProviderId, CloudAccountInfo>>(getCloudAccounts());
  const [syncStatus, setSyncStatusState] = useState<SyncStatusType>(getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  // Cloud Files & Folders
  const [files, setFiles] = useState<CloudDriveFile[]>(getCloudFiles());
  const [folders, setFolders] = useState<CloudDriveFolder[]>(INITIAL_CLOUD_FOLDERS);
  const [activeProviderTab, setActiveProviderTab] = useState<CloudProviderId>('gdrive');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder_gdrive_root');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMimeFilter, setSelectedMimeFilter] = useState<'all' | 'pdf' | 'doc' | 'txt'>('all');

  // New Folder Modal
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Drive Picker Modal
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'import' | 'export'>('import');

  // Stats
  const recentFiles = getRecentFiles();
  const savedChats = getSavedAiChats();
  const savedAnalysis = getSavedAiAnalysisList();
  const analyzerReports = getSavedAnalyzerReports();

  useEffect(() => {
    setFiles(getCloudFiles());
  }, []);

  // Sync handler
  const handleSyncNow = async () => {
    setIsSyncing(true);
    const newStatus = await triggerCloudSync((st) => setSyncStatusState(st));
    setIsSyncing(false);
    toast.success(`Cloud workspace synced! Status: ${newStatus}`);
  };

  // Connect/Disconnect Provider
  const toggleConnect = (id: CloudProviderId) => {
    const acc = accounts[id];
    const newConnected = !acc.connected;
    const updated = updateCloudAccount(id, {
      connected: newConnected,
      email: newConnected ? `alex.vance@${id === 'gdrive' ? 'gmail.com' : id === 'onedrive' ? 'outlook.com' : 'dropbox.com'}` : undefined,
    });
    setAccounts(updated);
    if (newConnected) {
      toast.success(`Connected to ${acc.name}!`);
    } else {
      toast.info(`Disconnected from ${acc.name}`);
    }
  };

  // Toggle Auto Save
  const toggleAutoSave = (id: CloudProviderId) => {
    const acc = accounts[id];
    const updated = updateCloudAccount(id, { autoSaveEnabled: !acc.autoSaveEnabled });
    setAccounts(updated);
    toast.success(`Auto-save ${!acc.autoSaveEnabled ? 'enabled' : 'disabled'} for ${acc.name}`);
  };

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (f.provider !== activeProviderTab) return false;
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedMimeFilter === 'pdf' && !f.name.toLowerCase().endsWith('.pdf')) return false;
      if (selectedMimeFilter === 'txt' && !f.name.toLowerCase().endsWith('.txt')) return false;
      return true;
    });
  }, [files, activeProviderTab, searchQuery, selectedMimeFilter]);

  // Folders for active provider
  const providerFolders = useMemo(() => {
    return folders.filter((f) => f.provider === activeProviderTab);
  }, [folders, activeProviderTab]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: CloudDriveFolder = {
      id: 'folder_' + Math.random().toString(36).substring(2, 9),
      name: newFolderName.trim(),
      provider: activeProviderTab,
      parentId: selectedFolderId,
      itemCount: 0,
      path: `/${accounts[activeProviderTab].name}/${newFolderName.trim()}`,
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
    toast.success(`Folder "${newFolder.name}" created in ${accounts[activeProviderTab].name}`);
  };

  const handleDeleteFile = (id: string, name: string) => {
    const updated = deleteCloudFile(id);
    setFiles(updated);
    toast.info(`Deleted "${name}" from Cloud Workspace`);
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'Syncing...':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
          </span>
        );
      case 'Synced':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Workspace Synced
          </span>
        );
      case 'Offline':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-500/10 text-slate-400 border border-slate-500/30 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Offline Mode
          </span>
        );
      case 'Failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Sync Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 text-slate-100">
      <SEO
        title="Cloud Workspace & Multi-Drive Integration - SmartPDF Pro"
        description="Connect Google Drive, OneDrive, and Dropbox to import, export, and auto-save PDFs, AI chats, and document analysis."
        path="/cloud-storage"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header & Sync Status */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                <Cloud className="w-4 h-4" /> Cloud Workspace v1.4
              </div>
              {getSyncStatusBadge()}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Multi-Cloud Drive Storage
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Import documents directly from Google Drive, OneDrive, and Dropbox. Auto-save AI Chats, AI Analysis, and processed PDFs across all your cloud drives in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Drives...' : 'Sync Workspace Now'}</span>
            </button>

            <button
              onClick={() => {
                setPickerMode('import');
                setPickerModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4 text-red-400" />
              <span>Import Drive Files</span>
            </button>
          </div>
        </div>

        {/* Storage Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Documents</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{files.length + recentFiles.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{files.length} Cloud • {recentFiles.length} Local</p>
            </div>
          </div>

          <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Cloud Drive Usage</p>
              <h3 className="text-2xl font-black text-white mt-0.5">21.3 GB</h3>
              <p className="text-[10px] text-slate-400 mt-1">Across 3 Cloud Providers</p>
            </div>
          </div>

          <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Saved AI Chats</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{savedChats.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Auto-saved to Cloud
              </p>
            </div>
          </div>

          <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">AI Analysis Reports</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{savedAnalysis.length + analyzerReports.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Auto-saved to Cloud
              </p>
            </div>
          </div>
        </div>

        {/* Cloud Providers Grid (Google Drive, OneDrive, Dropbox) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Cloud className="w-5 h-5 text-red-500" /> Connected Cloud Providers
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              3 Drives Configured
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'gdrive' as CloudProviderId,
                name: 'Google Drive',
                badge: 'Google Workspace',
                icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965327.png',
                description: 'Sync files directly with Google Workspace Drive & shared team folders.',
                defaultStorage: '14.2 GB / 15 GB',
                percentage: 94,
              },
              {
                id: 'onedrive' as CloudProviderId,
                name: 'Microsoft OneDrive',
                badge: 'Office 365',
                icon: 'https://cdn-icons-png.flaticon.com/512/732/732223.png',
                description: 'Native integration with SharePoint, Teams, and Office 365 documents.',
                defaultStorage: '5.0 GB / 100 GB',
                percentage: 5,
              },
              {
                id: 'dropbox' as CloudProviderId,
                name: 'Dropbox Pro',
                badge: 'Dropbox Teams',
                icon: 'https://cdn-icons-png.flaticon.com/512/174/174845.png',
                description: 'Automated PDF export pipelines and team paper sync.',
                defaultStorage: '0 GB / 2 TB',
                percentage: 0,
              },
            ].map((p) => {
              const acc = accounts[p.id];
              return (
                <div
                  key={p.id}
                  className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#18181d] border border-slate-800 flex items-center justify-center p-2 shrink-0">
                          <Cloud className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">{p.name}</h3>
                          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                            {p.badge}
                          </span>
                        </div>
                      </div>

                      {acc.connected ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-500 border border-slate-700">
                          Disconnected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

                    {acc.connected && (
                      <div className="space-y-2 bg-[#18181d] p-3.5 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span>Usage</span>
                          <span>{p.defaultStorage}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${p.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 truncate">
                            Account: {acc.email || 'alex.vance@smartpdf.com'}
                          </span>
                          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acc.autoSaveEnabled}
                              onChange={() => toggleAutoSave(p.id)}
                              className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                            />
                            <span>Auto-Save</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleConnect(p.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex-1 ${
                        acc.connected
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                      }`}
                    >
                      {acc.connected ? 'Disconnect' : 'Connect Account'}
                    </button>

                    {acc.connected && (
                      <button
                        onClick={() => {
                          setActiveProviderTab(p.id);
                          setPickerMode('import');
                          setPickerModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        title="Browse Drive Files"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                        <span>Browse</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cloud Workspace Browser & File Manager */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-red-500" /> Cloud Workspace File Manager
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Browse, search, rename, and export files directly inside your connected cloud drive folders.
              </p>
            </div>

            {/* Provider Tabs */}
            <div className="flex items-center gap-2 bg-[#18181d] p-1.5 rounded-2xl border border-slate-800">
              {(['gdrive', 'onedrive', 'dropbox'] as CloudProviderId[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveProviderTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                    activeProviderTab === tab
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{accounts[tab].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search drive files & documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181d] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
              <div className="flex items-center gap-1 bg-[#18181d] p-1 rounded-xl border border-slate-800 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setSelectedMimeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMimeFilter === 'all' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedMimeFilter('pdf')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMimeFilter === 'pdf' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                >
                  PDFs
                </button>
                <button
                  onClick={() => setSelectedMimeFilter('txt')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMimeFilter === 'txt' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                >
                  Text / Analysis
                </button>
              </div>

              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-red-400" />
                <span>New Folder</span>
              </button>
            </div>
          </div>

          {/* New Folder Modal Input */}
          {isNewFolderOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-[#18181d] border border-slate-800 flex items-center gap-3"
            >
              <Folder className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                type="text"
                placeholder="Folder Name (e.g. Q3 Taxes & Receipts)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1 bg-[#121215] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleCreateFolder}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Create Folder
              </button>
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Cloud Folders Grid */}
          {providerFolders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Folders in {accounts[activeProviderTab].name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {providerFolders.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl bg-[#16161b] border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Folder className="w-5 h-5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                          {f.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{f.path}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cloud Files List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Files ({filteredFiles.length})
            </h3>

            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center bg-[#16161b] rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No cloud files matching your search or filter in {accounts[activeProviderTab].name}.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 bg-[#16161b] rounded-3xl border border-slate-800/80 overflow-hidden">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1c1c22] transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{file.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Updated {new Date(file.updatedAt).toLocaleDateString()} • {accounts[file.provider].name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          const dummy = await createDummyFileFromCloudDrive(file);
                          toast.success(`Imported "${file.name}" to active workspace`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <DownloadCloud className="w-3.5 h-3.5 text-red-400" />
                        <span>Import</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Drive Picker Modal */}
      <CloudDrivePickerModal
        isOpen={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        mode={pickerMode}
        onFilesImported={(files) => {
          setFiles(getCloudFiles());
          toast.success(`Imported ${files.length} file(s) into SmartPDF workspace!`);
        }}
      />
    </div>
  );
};
