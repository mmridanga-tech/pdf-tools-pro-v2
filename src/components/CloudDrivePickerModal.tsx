import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cloud,
  Folder,
  FileText,
  Search,
  CheckCircle2,
  FolderPlus,
  ArrowLeft,
  UploadCloud,
  DownloadCloud,
  HardDrive,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CloudProviderId,
  CloudDriveFile,
  CloudDriveFolder,
  INITIAL_CLOUD_FOLDERS,
  getCloudFiles,
  getCloudAccounts,
  createDummyFileFromCloudDrive,
  saveCloudFile,
  CloudAccountInfo,
} from '../utils/cloudDriveUtils';
import { useToast } from '../context/ToastContext';

interface CloudDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  exportItemName?: string;
  exportItemContent?: string;
  onFilesImported?: (files: File[]) => void;
  onExportSuccess?: (provider: CloudProviderId, folderName: string) => void;
}

export const CloudDrivePickerModal: React.FC<CloudDrivePickerModalProps> = ({
  isOpen,
  onClose,
  mode,
  exportItemName = 'Exported_Document.pdf',
  exportItemContent = '',
  onFilesImported,
  onExportSuccess,
}) => {
  const toast = useToast();
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderId>('gdrive');
  const [currentFolderId, setCurrentFolderId] = useState<string>('folder_gdrive_root');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<CloudDriveFolder[]>(INITIAL_CLOUD_FOLDERS);
  const [isProcessing, setIsProcessing] = useState(false);

  const accounts: Record<CloudProviderId, CloudAccountInfo> = getCloudAccounts();
  const allFiles = getCloudFiles();

  // Reset folder when provider changes
  const handleSelectProvider = (prov: CloudProviderId) => {
    setSelectedProvider(prov);
    setSelectedFileIds([]);
    const defaultFolder =
      prov === 'gdrive'
        ? 'folder_gdrive_root'
        : prov === 'onedrive'
        ? 'folder_onedrive_root'
        : 'folder_dropbox_root';
    setCurrentFolderId(defaultFolder);
  };

  // Filter folders for current provider and folder level
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const availableFolders = useMemo(() => {
    return folders.filter((f) => f.provider === selectedProvider);
  }, [folders, selectedProvider]);

  const currentSubFolders = useMemo(() => {
    return availableFolders.filter((f) => {
      if (searchQuery) return f.name.toLowerCase().includes(searchQuery.toLowerCase());
      return f.parentId === currentFolderId;
    });
  }, [availableFolders, currentFolderId, searchQuery]);

  const currentFiles = useMemo(() => {
    return allFiles.filter((file) => {
      if (file.provider !== selectedProvider) return false;
      if (searchQuery) {
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return file.folderId === currentFolderId;
    });
  }, [allFiles, selectedProvider, currentFolderId, searchQuery]);

  const handleToggleSelectFile = (id: string) => {
    if (selectedFileIds.includes(id)) {
      setSelectedFileIds(selectedFileIds.filter((item) => item !== id));
    } else {
      setSelectedFileIds([...selectedFileIds, id]);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: CloudDriveFolder = {
      id: 'folder_' + Math.random().toString(36).substring(2, 9),
      name: newFolderName.trim(),
      provider: selectedProvider,
      parentId: currentFolderId,
      itemCount: 0,
      path: `${currentFolder?.path || ''}/${newFolderName.trim()}`,
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
    toast.success(`Created folder "${newFolder.name}" in ${selectedProvider.toUpperCase()}`);
  };

  const handleImportSelected = async () => {
    if (selectedFileIds.length === 0) return;
    setIsProcessing(true);
    try {
      const selectedRecords = allFiles.filter((f) => selectedFileIds.includes(f.id));
      const fileObjects = await Promise.all(
        selectedRecords.map((rec) => createDummyFileFromCloudDrive(rec))
      );

      if (onFilesImported) {
        onFilesImported(fileObjects);
      }
      toast.success(
        `Successfully imported ${fileObjects.length} file(s) from ${accounts[selectedProvider].name}`
      );
      onClose();
    } catch (err) {
      toast.error('Failed to import files from cloud drive');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToFolder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      saveCloudFile({
        name: exportItemName,
        provider: selectedProvider,
        folderId: currentFolderId,
        size: exportItemContent.length || 1024 * 120,
        mimeType: exportItemName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
        contentSample: exportItemContent.slice(0, 300) || 'Exported document from SmartPDF AI.',
      });

      if (onExportSuccess) {
        onExportSuccess(selectedProvider, currentFolder?.name || 'Root Folder');
      }
      toast.success(
        `Saved "${exportItemName}" to ${currentFolder?.name || 'Cloud Drive'}`
      );
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  const currentAccount = accounts[selectedProvider];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#121215] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#16161b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                {mode === 'import' ? <DownloadCloud className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  {mode === 'import' ? 'Import from Cloud Workspace' : 'Export & Save to Cloud Drive'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'import'
                    ? 'Browse Drive, OneDrive, and Dropbox files to import directly into SmartPDF AI'
                    : `Save "${exportItemName}" directly to your cloud drive folder`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cloud Provider Tabs */}
          <div className="px-6 py-3 bg-[#141418] border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {[
                { id: 'gdrive' as CloudProviderId, name: 'Google Drive', icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965327.png' },
                { id: 'onedrive' as CloudProviderId, name: 'OneDrive', icon: 'https://cdn-icons-png.flaticon.com/512/732/732223.png' },
                { id: 'dropbox' as CloudProviderId, name: 'Dropbox', icon: 'https://cdn-icons-png.flaticon.com/512/174/174845.png' },
              ].map((p) => {
                const isAccConnected = accounts[p.id]?.connected;
                const isSelected = selectedProvider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProvider(p.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{p.name}</span>
                    {isAccConnected ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">(Disconnected)</span>
                    )}
                  </button>
                );
              })}
            </div>

            {currentAccount?.connected && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account: {currentAccount.email}</span>
              </div>
            )}
          </div>

          {/* Account Not Connected Banner */}
          {!currentAccount?.connected ? (
            <div className="p-12 text-center flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {currentAccount?.name} Account Disconnected
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Please connect your account in the Cloud Storage settings to access folders and files.
              </p>
              <button
                onClick={() => {
                  toast.success(`Connected to ${currentAccount?.name}!`);
                  accounts[selectedProvider].connected = true;
                  handleSelectProvider(selectedProvider);
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Connect {currentAccount?.name}
              </button>
            </div>
          ) : (
            <>
              {/* Folder Navigation & Toolbar */}
              <div className="px-6 py-3 border-b border-slate-800 bg-[#121215] flex flex-wrap items-center justify-between gap-3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 overflow-x-auto py-1">
                  <button
                    onClick={() => {
                      const rootFolder =
                        selectedProvider === 'gdrive'
                          ? 'folder_gdrive_root'
                          : selectedProvider === 'onedrive'
                          ? 'folder_onedrive_root'
                          : 'folder_dropbox_root';
                      setCurrentFolderId(rootFolder);
                    }}
                    className="hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-red-400" />
                    <span>{currentAccount.name}</span>
                  </button>

                  {currentFolder && currentFolder.parentId && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="text-slate-100 font-bold">{currentFolder.name}</span>
                    </>
                  )}
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search cloud files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#18181d] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <button
                    onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                    title="Create Folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">New Folder</span>
                  </button>
                </div>
              </div>

              {/* Create Folder Drawer Input */}
              {isCreatingFolder && (
                <div className="px-6 py-3 bg-[#18181d] border-b border-slate-800 flex items-center gap-3">
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Folder name (e.g. Legal Contracts)"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    className="flex-1 bg-[#121215] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              )}

              {/* Drive Content Explorer */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[280px] max-h-[420px]">
                {/* Subfolders */}
                {currentSubFolders.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                      Folders
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentSubFolders.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setCurrentFolderId(f.id)}
                          className="p-3 rounded-2xl bg-[#16161b] hover:bg-[#1c1c22] border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Folder className="w-5 h-5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                                {f.name}
                              </p>
                              <p className="text-[10px] text-slate-500">{f.itemCount} item(s)</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Section */}
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Files ({currentFiles.length})
                  </h4>

                  {currentFiles.length === 0 ? (
                    <div className="p-8 text-center bg-[#16161b] rounded-2xl border border-dashed border-slate-800/80 text-slate-500 text-xs">
                      No files in this folder. You can upload or save files here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentFiles.map((file) => {
                        const isSelected = selectedFileIds.includes(file.id);
                        return (
                          <div
                            key={file.id}
                            onClick={() => mode === 'import' && handleToggleSelectFile(file.id)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                              isSelected
                                ? 'bg-red-500/10 border-red-500/50 text-white'
                                : 'bg-[#16161b] border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • Updated{' '}
                                  {new Date(file.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {mode === 'import' && (
                              <div className="shrink-0">
                                {isSelected ? (
                                  <CheckCircle2 className="w-5 h-5 text-red-500" />
                                ) : (
                                  <div className="w-5 h-5 rounded-md border border-slate-700" />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-[#16161b] flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-medium">
                  {mode === 'import'
                    ? `${selectedFileIds.length} file(s) selected`
                    : `Destination: ${currentAccount.name} → ${currentFolder?.name || 'Root'}`}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  {mode === 'import' ? (
                    <button
                      onClick={handleImportSelected}
                      disabled={selectedFileIds.length === 0 || isProcessing}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <DownloadCloud className="w-4 h-4" /> Import {selectedFileIds.length} File(s)
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleExportToFolder}
                      disabled={isProcessing}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" /> Save to {currentAccount.name}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
