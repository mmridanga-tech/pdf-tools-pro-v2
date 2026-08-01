import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  getRecentFiles,
  removeRecentFile,
  clearRecentFiles,
  getTotalStorageUsedBytes,
  getActivityLogs,
  RecentFileRecord,
  getFavoriteTools,
} from '../utils/storageUtils';
import { PDF_TOOLS } from '../utils/toolsData';
import { ToolCard } from '../components/ToolCard';
import { formatBytes } from '../utils/fileUtils';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  History,
  Star,
  HardDrive,
  User,
  Trash2,
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Lock,
  Layers,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, updateProfile, sendEmailVerification } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'favorites' | 'account'>('overview');
  const [historyFiles, setHistoryFiles] = useState<RecentFileRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState(getActivityLogs());
  const [searchHistory, setSearchHistory] = useState('');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'size-desc'>('newest');
  const [storageBytes, setStorageBytes] = useState(0);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');

  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    const list = getRecentFiles();
    setHistoryFiles(list);
    setStorageBytes(getTotalStorageUsedBytes());
    setActivityLogs(getActivityLogs());
  };

  const handleRemoveHistory = (id: string) => {
    removeRecentFile(id);
    refreshHistory();
    toast.success('History item deleted');
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all processing history?')) {
      clearRecentFiles();
      refreshHistory();
      toast.success('All processing history cleared.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, company, jobTitle });
    toast.success('Profile settings updated successfully!');
  };

  // Filtered and Sorted History
  const filteredHistory = historyFiles
    .filter((file) => {
      const matchSearch =
        file.name.toLowerCase().includes(searchHistory.toLowerCase()) ||
        file.toolName.toLowerCase().includes(searchHistory.toLowerCase());
      const matchTool = filterTool === 'all' || file.toolId === filterTool;
      return matchSearch && matchTool;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
      if (sortOrder === 'size-desc') return b.size - a.size;
      return 0;
    });

  const favoriteIds = getFavoriteTools();
  const favoriteTools = PDF_TOOLS.filter((t) => favoriteIds.includes(t.id));

  const MAX_STORAGE_LIMIT = user?.plan === 'enterprise' ? 107374182400 : user?.plan === 'pro' ? 21474836480 : 2147483648; // 2GB free, 20GB pro, 100GB enterprise
  const storagePercentage = Math.min(100, Math.round((storageBytes / MAX_STORAGE_LIMIT) * 100));

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10">
      <SEO
        title="User Dashboard & File History - SmartPDF"
        description="Manage your recent PDF processing jobs, storage metrics, account settings, and favorite tools."
        path="/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Greeting & Header */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm">
                  {user?.plan} Plan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Quick Storage & Plan Status */}
          <div className="flex items-center gap-4 bg-[#18181d] border border-slate-800 rounded-2xl p-4 min-w-[280px]">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Cloud Storage</span>
                <span className="text-red-400">{storagePercentage}% Used</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, storagePercentage)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {formatBytes(storageBytes)} / {formatBytes(MAX_STORAGE_LIMIT)}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            File History ({historyFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Star className="w-4 h-4" />
            Starred Tools ({favoriteTools.length})
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'account'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            Account Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Processing Files */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-extrabold text-white">Recent PDF Processing Jobs</h2>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Full History <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {historyFiles.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm font-semibold">No recent file activity found</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Start using PDF Tools like Merge, Compress, or Split to log history here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {historyFiles.slice(0, 5).map((file) => (
                    <div
                      key={file.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-400 font-extrabold text-xs">
                          PDF
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="text-slate-500">{file.toolName}</span>
                            <span>•</span>
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span>{new Date(file.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-extrabold text-white">Activity Stream</h2>
                </div>
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#18181d] border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{log.action}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.toolName}</p>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Shortcuts Banner */}
              <div className="bg-gradient-to-br from-red-950/40 via-[#121215] to-[#121215] border border-red-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
                    AI Platform Capabilities
                  </span>
                  <h3 className="text-xl font-black text-white mb-2">Chat with PDF & AI Assistant</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Ask questions directly against uploaded PDFs, extract key tables, generate flashcards, or summarize technical research in seconds.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/ai-chat"
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    Launch AI Chat
                  </Link>
                  <Link
                    to="/ai-assistant"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
                  >
                    Launch AI Assistant
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FILE HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Full Processing History</h2>
                <p className="text-xs text-slate-400">Search, filter, or remove past job executions.</p>
              </div>

              {historyFiles.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Clear All History
                </button>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search history by name..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                className="py-2.5 px-3 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="all">All Tools</option>
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
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="size-desc">Sort by: File Size (Largest)</option>
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm font-bold">No records matching search query</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Document Name</th>
                      <th className="p-3.5">Tool Used</th>
                      <th className="p-3.5">File Size</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-white max-w-xs truncate">{item.name}</td>
                        <td className="p-3.5 text-slate-300 font-semibold">{item.toolName}</td>
                        <td className="p-3.5 text-slate-400">{formatBytes(item.size)}</td>
                        <td className="p-3.5 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <Link
                            to={`/${item.toolId}`}
                            className="p-2 text-slate-400 hover:text-red-400 inline-block transition-colors"
                            title="Reopen Tool"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveHistory(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 inline-block transition-colors cursor-pointer"
                            title="Delete Item"
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

        {/* TAB 3: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Your Starred Favorite Tools</h2>
              <p className="text-xs text-slate-400">Quick shortcut access to your most used utilities.</p>
            </div>

            {favoriteTools.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <Star className="w-10 h-10 mx-auto text-amber-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No starred tools yet</p>
                <p className="text-xs text-slate-600 mt-1">Star tools on the home page for quick access here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOUNT SETTINGS */}
        {activeTab === 'account' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Account & Profile Settings</h2>
              <p className="text-xs text-slate-400">Update personal profile and workspace details.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-3 bg-[#18181d]/50 border border-slate-800/80 rounded-2xl text-slate-400 text-sm cursor-not-allowed"
                  />
                  {user?.emailVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 whitespace-nowrap">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sendEmailVerification();
                        toast.success('Verification link sent!');
                      }}
                      className="px-3 py-2 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 hover:bg-amber-500/30 whitespace-nowrap cursor-pointer"
                    >
                      Verify Email
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Company / Team</label>
                  <input
                    type="text"
                    placeholder="Apex Systems"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="Document Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
