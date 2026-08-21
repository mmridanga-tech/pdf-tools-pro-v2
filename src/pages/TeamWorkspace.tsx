import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  BarChart3,
  Server,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Folder,
  Tag,
  ArrowRight,
  LogOut,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import {
  TeamWorkspace as ITeamWorkspace,
  WorkspaceMember,
  WorkspaceInvitation,
  SharedWorkspaceFile,
  WorkspaceAuditLog,
  TeamTelemetryData,
  getCachedUserWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  createTeamWorkspace,
  updateTeamWorkspace,
  deleteTeamWorkspace,
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
  createWorkspaceInvitation,
  getWorkspaceInvitations,
  cancelWorkspaceInvitation,
  getWorkspaceSharedFiles,
  shareFileToWorkspace,
  removeSharedWorkspaceFile,
  getWorkspaceAuditLogs,
  fetchTeamTelemetry,
  subscribeToWorkspaceMembers,
  subscribeToWorkspaceFiles,
  TEAM_WORKSPACE_SYNC_EVENT,
} from '../services/teamWorkspaceService';

export const TeamWorkspace: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Workspaces list & Active selection
  const [workspaces, setWorkspaces] = useState<ITeamWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<ITeamWorkspace | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'files' | 'telemetry' | 'activity'>('members');
  const [isLoading, setIsLoading] = useState(false);

  // Data states for the active workspace
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedWorkspaceFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<WorkspaceAuditLog[]>([]);
  const [telemetry, setTelemetry] = useState<TeamTelemetryData | null>(null);

  // Modals & form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Load workspaces
  const loadWorkspaces = useCallback(() => {
    const list = getCachedUserWorkspaces();
    setWorkspaces(list);

    const activeId = getActiveWorkspaceId();
    let current = list.find((w) => w.id === activeId);
    if (!current && list.length > 0) {
      current = list[0];
      setActiveWorkspaceId(current.id);
    }
    setActiveWorkspace(current || null);
    if (current) {
      setRenameValue(current.name);
    }
  }, []);

  // Load active workspace subcollections
  const loadWorkspaceDetails = useCallback(async (wsId: string) => {
    if (!wsId) return;
    setIsLoading(true);
    try {
      const [membersData, invitesData, filesData, logsData, telemetryData] = await Promise.all([
        getWorkspaceMembers(wsId),
        getWorkspaceInvitations(wsId),
        getWorkspaceSharedFiles(wsId),
        getWorkspaceAuditLogs(wsId),
        fetchTeamTelemetry(wsId),
      ]);

      setMembers(membersData);
      setInvitations(invitesData);
      setSharedFiles(filesData);
      setAuditLogs(logsData);
      setTelemetry(telemetryData);
    } catch (err) {
      console.warn('Error loading workspace details:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
    const handleSync = () => loadWorkspaces();
    window.addEventListener(TEAM_WORKSPACE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(TEAM_WORKSPACE_SYNC_EVENT, handleSync);
  }, [loadWorkspaces]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      loadWorkspaceDetails(activeWorkspace.id);

      // Subscribe to live real-time updates
      const unsubMembers = subscribeToWorkspaceMembers(activeWorkspace.id, (m) => setMembers(m));
      const unsubFiles = subscribeToWorkspaceFiles(activeWorkspace.id, (f) => setSharedFiles(f));

      return () => {
        unsubMembers();
        unsubFiles();
      };
    }
  }, [activeWorkspace?.id, loadWorkspaceDetails]);

  // Handler: Switch Workspace
  const handleSelectWorkspace = (ws: ITeamWorkspace) => {
    setActiveWorkspaceId(ws.id);
    setActiveWorkspace(ws);
    setRenameValue(ws.name);
    toast.success(`Switched to workspace: ${ws.name}`);
  };

  // Handler: Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      const created = await createTeamWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowCreateModal(false);
      loadWorkspaces();
      toast.success(`Team Workspace "${created.name}" created successfully!`);
    } catch (err: any) {
      toast.error('Failed to create workspace: ' + err.message);
    }
  };

  // Handler: Rename Workspace
  const handleSaveRename = async () => {
    if (!activeWorkspace || !renameValue.trim()) return;
    try {
      await updateTeamWorkspace(activeWorkspace.id, { name: renameValue.trim() });
      setActiveWorkspace({ ...activeWorkspace, name: renameValue.trim() });
      setIsRenaming(false);
      toast.success('Workspace renamed successfully');
    } catch (err: any) {
      toast.error('Failed to rename workspace: ' + err.message);
    }
  };

  // Handler: Delete Workspace
  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${activeWorkspace.name}"?`)) return;

    try {
      await deleteTeamWorkspace(activeWorkspace.id);
      loadWorkspaces();
      toast.success('Workspace deleted');
    } catch (err: any) {
      toast.error('Failed to delete workspace: ' + err.message);
    }
  };

  // Handler: Leave Workspace
  const handleLeaveWorkspace = async () => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Are you sure you want to leave "${activeWorkspace.name}"?`)) return;

    try {
      await leaveWorkspace(activeWorkspace.id);
      loadWorkspaces();
      toast.success('You have left the workspace');
    } catch (err: any) {
      toast.error('Failed to leave workspace: ' + err.message);
    }
  };

  // Handler: Send Invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail) return;

    try {
      const inv = await createWorkspaceInvitation(activeWorkspace.id, inviteEmail, inviteRole);
      setInvitations([inv, ...invitations]);
      setInviteEmail('');
      setShowInviteModal(false);
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole.toUpperCase()}`);
    } catch (err: any) {
      toast.error('Failed to send invitation: ' + err.message);
    }
  };

  // Handler: Cancel Invitation
  const handleCancelInvite = async (inviteId: string) => {
    if (!activeWorkspace) return;
    try {
      await cancelWorkspaceInvitation(activeWorkspace.id, inviteId);
      setInvitations(invitations.filter((i) => i.id !== inviteId));
      toast.success('Invitation cancelled');
    } catch (err: any) {
      toast.error('Failed to cancel invitation: ' + err.message);
    }
  };

  // Handler: Role Change
  const handleRoleChange = async (memberUid: string, newRole: 'admin' | 'member') => {
    if (!activeWorkspace) return;
    try {
      await updateWorkspaceMemberRole(activeWorkspace.id, memberUid, newRole);
      setMembers(members.map((m) => (m.uid === memberUid ? { ...m, role: newRole } : m)));
      toast.success('Member role updated');
    } catch (err: any) {
      toast.error('Failed to update role: ' + err.message);
    }
  };

  // Handler: Remove Member
  const handleRemoveMember = async (memberUid: string, name: string) => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Remove ${name} from this workspace?`)) return;

    try {
      await removeWorkspaceMember(activeWorkspace.id, memberUid);
      setMembers(members.filter((m) => m.uid !== memberUid));
      toast.success('Member removed');
    } catch (err: any) {
      toast.error('Failed to remove member: ' + err.message);
    }
  };

  // Handler: Remove Shared File
  const handleRemoveFile = async (fileId: string) => {
    if (!activeWorkspace) return;
    try {
      await removeSharedWorkspaceFile(activeWorkspace.id, fileId);
      setSharedFiles(sharedFiles.filter((f) => f.id !== fileId));
      toast.success('File removed from shared workspace');
    } catch (err: any) {
      toast.error('Failed to remove file: ' + err.message);
    }
  };

  const isOwner = activeWorkspace?.ownerUid === user?.id || activeWorkspace?.myRole === 'owner';
  const isAdmin = isOwner || activeWorkspace?.myRole === 'admin';

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-8 text-slate-100">
      <SEO
        title="Team Workspaces & Telemetry - SmartPDF Pro"
        description="Collaborate with team members, manage enterprise workspace permissions, and monitor real-time AI telemetry."
        path="/team"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP BAR: WORKSPACE SWITCHER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-inner">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Team Workspace Hub</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {activeWorkspace ? activeWorkspace.name : 'Select or Create Workspace'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Workspace Select Dropdown */}
            {workspaces.length > 0 && (
              <div className="relative">
                <select
                  value={activeWorkspace?.id || ''}
                  onChange={(e) => {
                    const ws = workspaces.find((w) => w.id === e.target.value);
                    if (ws) handleSelectWorkspace(ws);
                  }}
                  className="px-4 py-2.5 bg-[#121215] border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer shadow-lg"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      🏢 {w.name} ({w.plan.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 text-red-400" /> New Workspace
            </button>

            {isAdmin && activeWorkspace && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Invite Member
              </button>
            )}
          </div>
        </div>

        {/* WORKSPACE HEADER CARD */}
        {activeWorkspace && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {isRenaming ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="px-3 py-1.5 bg-[#18181d] border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-red-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveRename}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsRenaming(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">{activeWorkspace.name}</h2>
                      {isAdmin && (
                        <button
                          onClick={() => setIsRenaming(true)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                          title="Rename Workspace"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                    {activeWorkspace.plan} Plan
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
                  <span>Owner: {activeWorkspace.ownerEmail || 'admin@smartpdf.ai'}</span>
                  <span>•</span>
                  <span>{members.length} Active Members</span>
                  <span>•</span>
                  <span>{sharedFiles.length} Shared Documents</span>
                  <span>•</span>
                  <span>Your Role: <strong className="text-white uppercase">{activeWorkspace.myRole || (isOwner ? 'Owner' : 'Member')}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isOwner ? (
                  <button
                    onClick={handleDeleteWorkspace}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveWorkspace}
                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Leave Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-4 h-4" /> Members & Roles ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-4 h-4" /> Shared Files ({sharedFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Team AI Telemetry
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" /> Security Audit Log
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: MEMBERS & INVITATIONS */}
        {/* ==================================================== */}
        {activeTab === 'members' && (
          <div className="space-y-8">
            {/* Active Members Table */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" /> Active Workspace Members ({members.length})
                </h3>
                <span className="text-xs text-slate-500">Zero-Trust Role Enforced</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 rounded-l-2xl">Member</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Workspace Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 rounded-r-2xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {members.map((member) => (
                      <tr key={member.uid} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-3">
                          <img
                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`}
                            alt={member.displayName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 bg-slate-800"
                          />
                          <div>
                            <div>{member.displayName || member.email.split('@')[0]}</div>
                            <span className="text-[10px] text-slate-500 font-normal">Joined {member.joinedAt ? member.joinedAt.split('T')[0] : 'Recently'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 font-mono">{member.email}</td>
                        <td className="p-4">
                          {isAdmin && member.role !== 'owner' ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.uid, e.target.value as any)}
                              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                member.role === 'owner'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : member.role === 'admin'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {member.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {isAdmin && member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.uid, member.displayName || member.email)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove member"
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

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-500" /> Pending Invitations ({invitations.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4 rounded-l-2xl">Invited Email</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4">Invited By</th>
                        <th className="p-4">Expires In</th>
                        <th className="p-4 rounded-r-2xl text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{inv.email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {inv.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{inv.invitedByName}</td>
                          <td className="p-4 text-slate-400">
                            {Math.max(0, Math.ceil((inv.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} days
                          </td>
                          <td className="p-4 text-right">
                            {isAdmin && (
                              <button
                                onClick={() => handleCancelInvite(inv.id)}
                                className="px-3 py-1 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Revoke
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
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: SHARED FILES */}
        {/* ==================================================== */}
        {activeTab === 'files' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" /> Team Shared Documents ({sharedFiles.length})
                </h3>
                <p className="text-xs text-slate-400">Documents shared with your workspace members for collaborative AI analysis.</p>
              </div>
            </div>

            {sharedFiles.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">No shared files yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Files processed in your workspace can be shared with team members from the Dashboard.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181d] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 rounded-l-2xl">Document Name</th>
                      <th className="p-4">Shared By</th>
                      <th className="p-4">Folder & Tags</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Shared Date</th>
                      <th className="p-4 rounded-r-2xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sharedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div>{file.name}</div>
                            {file.notes && <div className="text-[10px] text-slate-500 font-normal">{file.notes}</div>}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{file.sharedByName}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                              <Folder className="w-2.5 h-2.5" /> {file.folder || 'General'}
                            </span>
                            {file.tags?.map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded-md text-[9px] bg-red-500/10 text-red-400 border border-red-500/20">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</td>
                        <td className="p-4 text-slate-400">{new Date(file.timestamp).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toast.success(`Accessing ${file.name}...`)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TEAM AI TELEMETRY */}
        {/* ==================================================== */}
        {activeTab === 'telemetry' && telemetry && (
          <div className="space-y-6">
            {/* Top Telemetry KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Requests Today</span>
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{telemetry.requestsToday}</div>
                <p className="text-[11px] text-slate-400 mt-1">Quota: {telemetry.requestsToday} / {telemetry.quotaLimit} daily</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (telemetry.requestsToday / telemetry.quotaLimit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-400">{telemetry.successRate}%</div>
                <p className="text-[11px] text-slate-400 mt-1">Zero persistent errors</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${telemetry.successRate}%` }} />
                </div>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Latency</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{telemetry.avgLatencyMs} <span className="text-sm font-normal text-slate-400">ms</span></div>
                <p className="text-[11px] text-slate-400 mt-1">Gemini 2.5 Flash API</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Team Seats</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{members.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Unlimited Enterprise tier</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint Breakdown */}
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-red-500" /> AI API Operations Breakdown
                </h4>
                <div className="space-y-3">
                  {telemetry.endpointBreakdown.map((ep, idx) => (
                    <div key={idx} className="p-3.5 bg-[#18181d] border border-slate-800/80 rounded-2xl">
                      <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                        <span className="font-mono text-slate-300">{ep.endpoint}</span>
                        <span>{ep.count} reqs ({ep.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${ep.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Member Quota Usage */}
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Member AI Quota Consumption
                </h4>
                <div className="space-y-3">
                  {telemetry.memberUsage.map((mu, idx) => (
                    <div key={idx} className="p-3.5 bg-[#18181d] border border-slate-800/80 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{mu.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{mu.email}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-red-400">{mu.requests}</span>
                        <span className="text-[10px] text-slate-400"> requests</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: AUDIT LOG */}
        {/* ==================================================== */}
        {activeTab === 'activity' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" /> Workspace Security & Audit Log
              </h3>
              <span className="text-xs text-slate-500">Immutable Cryptographic Audit Trail</span>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-[#18181d] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-white">{log.actorName}</span>
                    </div>
                    {log.details && <p className="text-xs text-slate-400">{log.details}</p>}
                    {log.target && <p className="text-[11px] text-slate-500 font-mono">Target: {log.target}</p>}
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL: CREATE WORKSPACE */}
      {/* ==================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Team Workspace</h3>
                <p className="text-xs text-slate-400">Establish a collaborative multi-user workspace container.</p>
              </div>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Legal Team"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: INVITE MEMBER */}
      {/* ==================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Invite Workspace Member</h3>
                <p className="text-xs text-slate-400">Send an invitation to join {activeWorkspace?.name}.</p>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Colleague Email</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@organization.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full py-3 px-3 bg-[#18181d] border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="member">Member (Can view, process, and share files)</option>
                  <option value="admin">Admin (Can manage members and workspace settings)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeamWorkspace;
