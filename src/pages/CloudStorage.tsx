import React, { useState } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';

interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  userAccount?: string;
  storageUsed?: string;
}

export const CloudStoragePage: React.FC = () => {
  const toast = useToast();

  const [providers, setProviders] = useState<CloudProvider[]>([
    {
      id: 'gdrive',
      name: 'Google Drive',
      icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965327.png',
      description: 'Sync files directly with Google Workspace Drive folders.',
      connected: true,
      userAccount: 'alex.vance@gmail.com',
      storageUsed: '14.2 GB / 15 GB',
    },
    {
      id: 'dropbox',
      name: 'Dropbox Pro',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174845.png',
      description: 'Automated document exports and shared team folders.',
      connected: false,
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      icon: 'https://cdn-icons-png.flaticon.com/512/732/732223.png',
      description: 'Native integration with Office 365 and SharePoint.',
      connected: false,
    },
  ]);

  const toggleConnect = (id: string) => {
    setProviders(
      providers.map((p) => {
        if (p.id === id) {
          const nextState = !p.connected;
          if (nextState) {
            toast.success(`Connected to ${p.name}!`);
            return {
              ...p,
              connected: true,
              userAccount: 'alex.vance@smartpdf.com',
              storageUsed: '2.1 GB / 100 GB',
            };
          } else {
            toast.success(`Disconnected from ${p.name}`);
            return { ...p, connected: false, userAccount: undefined, storageUsed: undefined };
          }
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12">
      <SEO
        title="Cloud Storage Connectors - SmartPDF Pro"
        description="Connect Google Drive, Dropbox, and OneDrive to import and export PDF files directly."
        path="/cloud-storage"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Cloud className="w-4 h-4" /> Multi-Cloud Storage Sync
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Connect Cloud Storage Drives
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Import PDFs directly from your cloud drives and save converted documents back automatically.
          </p>
        </div>

        {/* Cloud Providers Grid */}
        <div className="space-y-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#18181d] border border-slate-800 flex items-center justify-center p-3 shrink-0">
                  <Cloud className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{p.name}</h3>
                    {p.connected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                  {p.userAccount && (
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      Account: {p.userAccount} • Usage: {p.storageUsed}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleConnect(p.id)}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  p.connected
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                }`}
              >
                {p.connected ? 'Disconnect Account' : 'Connect Account'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
