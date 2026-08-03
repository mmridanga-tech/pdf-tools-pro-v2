import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Users,
  DollarSign,
  Cpu,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Server,
  Zap,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

const USER_ANALYTICS_DATA = [
  { month: 'Jan', activeUsers: 4200, revenue: 8400, operations: 120000 },
  { month: 'Feb', activeUsers: 5800, revenue: 11200, operations: 185000 },
  { month: 'Mar', activeUsers: 7400, revenue: 14800, operations: 240000 },
  { month: 'Apr', activeUsers: 9200, revenue: 18400, operations: 310000 },
  { month: 'May', activeUsers: 11500, revenue: 230000, operations: 450000 },
  { month: 'Jun', activeUsers: 14800, revenue: 29600, operations: 620000 },
  { month: 'Jul', activeUsers: 18900, revenue: 37800, operations: 890000 },
];

export const AdminPanel: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'support' | 'health'>('overview');

  const [supportTickets, setSupportTickets] = useState([
    {
      id: 'TCK-881',
      user: 'David Miller',
      subject: 'OCR precision issue on scanned French PDF',
      status: 'Open',
      priority: 'High',
      date: '10 mins ago',
    },
    {
      id: 'TCK-880',
      user: 'Rachel Green',
      subject: 'Need VAT invoice for Enterprise plan renewal',
      status: 'Pending',
      priority: 'Medium',
      date: '1 hour ago',
    },
    {
      id: 'TCK-879',
      user: 'Alex Rivera',
      subject: 'API rate limit expansion request',
      status: 'Resolved',
      priority: 'Low',
      date: 'Yesterday',
    },
  ]);

  const handleResolveTicket = (id: string) => {
    setSupportTickets(
      supportTickets.map((t) => (t.id === id ? { ...t, status: 'Resolved' } : t))
    );
    toast.success(`Ticket ${id} marked as resolved!`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10">
      <SEO
        title="Admin Control Panel - SmartPDF Pro"
        description="Global system telemetry, user analytics, processing statistics, error logs, and system health monitors."
        path="/admin"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Server className="w-3.5 h-3.5" /> System Command Center
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin & Telemetry Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/content-generator"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-950/40"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>SEO Content Studio</span>
            </a>

            <button
              onClick={() => toast.success('Telemetry data refreshed!')}
              className="px-4 py-2.5 bg-[#18181d] hover:bg-[#22222b] text-slate-300 hover:text-white border border-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Monthly Active Users</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">18,920</p>
            <span className="text-xs font-bold text-emerald-400">+27.4% vs last month</span>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">MRR Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">$37,800</p>
            <span className="text-xs font-bold text-emerald-400">+18.2% MRR growth</span>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total PDF Operations</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">1,240,890</p>
            <span className="text-xs font-bold text-slate-400">99.94% Success Rate</span>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">System Health</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400">Operational</p>
            <span className="text-xs font-bold text-slate-400">Avg Latency: 120ms</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 mb-8 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics & Revenue
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Server & API Health
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-extrabold text-white mb-4">Active Users Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USER_ANALYTICS_DATA}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181d', borderColor: '#27272a', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="activeUsers" stroke="#ef4444" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-extrabold text-white mb-4">Operations Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={USER_ANALYTICS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181d', borderColor: '#27272a', borderRadius: '12px' }}
                    />
                    <Bar dataKey="operations" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">User</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Operations</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { name: user?.name || 'Administrator', email: user?.email || 'admin@smartpdf.com', plan: 'Enterprise', ops: '4,210', status: 'Active' },
                    { name: 'Sarah Chen', email: 'sarah@apex.io', plan: 'Pro', ops: '1,890', status: 'Active' },
                    { name: 'Michael Ross', email: 'm.ross@lawfirm.com', plan: 'Pro', ops: '980', status: 'Active' },
                    { name: 'Emma Watson', email: 'emma@university.edu', plan: 'Free', ops: '120', status: 'Active' },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {u.name}
                        <span className="block text-[11px] font-normal text-slate-500">{u.email}</span>
                      </td>
                      <td className="p-4 font-bold text-red-400">{u.plan}</td>
                      <td className="p-4 text-slate-300">{u.ops}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 font-mono text-xs">
            <h3 className="text-lg font-extrabold text-white font-sans mb-2">Live Error & Telemetry Logs</h3>
            {[
              { time: '04:22:18', level: 'INFO', msg: 'Gemini 3.6 Flash endpoint invoked for document chat.' },
              { time: '04:18:04', level: 'WARN', msg: 'Tesseract OCR worker thread delayed by 420ms on image PDF.' },
              { time: '03:55:12', level: 'INFO', msg: 'Client merged 12 pages in memory via pdf-lib in 110ms.' },
              { time: '03:12:00', level: 'INFO', msg: 'Stripe webhook received for subscription renewal.' },
            ].map((log, idx) => (
              <div key={idx} className="p-3 bg-[#18181d] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{log.time}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SUPPORT */}
        {activeTab === 'support' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-white">Support Ticket Queue</h3>
            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div key={t.id} className="p-4 bg-[#18181d] border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs">{t.id}:</span>
                      <span className="font-bold text-slate-200 text-xs">{t.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Submitted by {t.user} • {t.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {t.status}
                    </span>
                    {t.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolveTicket(t.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HEALTH */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Gemini AI API Service', status: '99.98% Healthy', latency: '180ms', color: 'text-emerald-400' },
              { name: 'Client PDF-Lib Engine', status: 'Operational', latency: '12ms', color: 'text-emerald-400' },
              { name: 'Cloud Storage S3/GCS', status: 'Operational', latency: '45ms', color: 'text-emerald-400' },
            ].map((srv, i) => (
              <div key={i} className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400">{srv.name}</p>
                <p className={`text-xl font-black ${srv.color}`}>{srv.status}</p>
                <p className="text-xs text-slate-500">Latency: {srv.latency}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
