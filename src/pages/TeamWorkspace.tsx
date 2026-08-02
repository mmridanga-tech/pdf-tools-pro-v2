import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import {
  Users,
  UserPlus,
  Shield,
  FileText,
  Activity,
  Plus,
  Mail,
  Trash2,
  CheckCircle2,
  Lock,
  Globe,
  MoreVertical,
  Building,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  status: 'Active' | 'Pending';
  joinedAt: string;
}

interface SharedFile {
  id: string;
  name: string;
  size: string;
  sharedBy: string;
  permission: 'Can Edit' | 'Read Only' | 'Admin';
  updatedAt: string;
}

export const TeamWorkspace: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [workspaceName, setWorkspaceName] = useState('Apex Systems Document Lab');
  const [activeTab, setActiveTab] = useState<'members' | 'files' | 'activity'>('members');

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'm1',
      name: user?.name || 'Workspace Owner',
      email: user?.email || 'owner@smartpdf.com',
      role: 'Owner',
      avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
      status: 'Active',
      joinedAt: '2026-01-10',
    },
    {
      id: 'm2',
      name: 'Sarah Chen',
      email: 'sarah.chen@apex.io',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'Active',
      joinedAt: '2026-02-01',
    },
    {
      id: 'm3',
      name: 'Michael Ross',
      email: 'm.ross@apex.io',
      role: 'Editor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      joinedAt: '2026-03-12',
    },
    {
      id: 'm4',
      name: 'Elena Rostova',
      email: 'elena@apex.io',
      role: 'Viewer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      status: 'Pending',
      joinedAt: '2026-03-28',
    },
  ]);

  const [sharedFiles] = useState<SharedFile[]>([
    {
      id: 'sf1',
      name: 'Q3_Financial_Audit_Merged.pdf',
      size: '14.2 MB',
      sharedBy: 'Sarah Chen',
      permission: 'Can Edit',
      updatedAt: '2 hours ago',
    },
    {
      id: 'sf2',
      name: 'Master_Service_Agreement_v4.pdf',
      size: '3.8 MB',
      sharedBy: user?.name || 'Workspace Owner',
      permission: 'Admin',
      updatedAt: 'Yesterday',
    },
    {
      id: 'sf3',
      name: 'Product_Roadmap_2026_Protected.pdf',
      size: '8.5 MB',
      sharedBy: 'Michael Ross',
      permission: 'Read Only',
      updatedAt: '3 days ago',
    },
  ]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: 'm_' + Math.random().toString(36).substring(2, 7),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`,
      status: 'Pending',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
    toast.success(`Invitation sent to ${inviteEmail}!`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast.success('Team member removed from workspace');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10">
      <SEO
        title="Team Workspace - SmartPDF Pro"
        description="Collaborate with team members, share encrypted PDF files, and manage workspace permissions."
        path="/team"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Header */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-lg">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="text-2xl font-black text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Shared Enterprise Workspace • {members.length} Members Active
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Invite Team Member
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 mb-8 pb-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Shared Files ({sharedFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Team Audit Log
          </button>
        </div>

        {/* TAB 1: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        {member.name}
                      </td>
                      <td className="p-4 text-slate-400">{member.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            member.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {member.role !== 'Owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SHARED FILES */}
        {activeTab === 'files' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">Document</th>
                    <th className="p-4">Shared By</th>
                    <th className="p-4">Permissions</th>
                    <th className="p-4">Last Modified</th>
                    <th className="p-4 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sharedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        {file.name}
                      </td>
                      <td className="p-4 text-slate-400">{file.sharedBy}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          {file.permission}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{file.updatedAt}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toast.success(`Opening ${file.name}...`)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Open File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOG */}
        {activeTab === 'activity' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-white">Workspace Security & Audit Log</h3>
            <div className="space-y-3">
              {[
                { user: 'Sarah Chen', action: 'Merged 4 PDF pages into Q3_Financial_Audit.pdf', time: '10 mins ago' },
                { user: user?.name || 'Workspace Owner', action: 'Added password protection to Master_Service_Agreement.pdf', time: '1 hour ago' },
                { user: 'Michael Ross', action: 'Ran AI Summarizer on Technical_Specs.pdf', time: '3 hours ago' },
                { user: 'Elena Rostova', action: 'Joined workspace via email invite', time: 'Yesterday' },
              ].map((log, i) => (
                <div key={i} className="p-3.5 bg-[#18181d] border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">{log.user}: </span>
                    <span className="text-slate-300 text-xs">{log.action}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Invite Team Member</h3>
            <p className="text-xs text-slate-400">
              Send an email invitation to grant access to this workspace.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@apex.io"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full py-3 px-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Admin">Admin (Full Editing & Workspace Settings)</option>
                  <option value="Editor">Editor (Can Upload, Edit, and Convert PDFs)</option>
                  <option value="Viewer">Viewer (Read-only access to files)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold cursor-pointer"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
