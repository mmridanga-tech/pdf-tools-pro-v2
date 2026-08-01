/**
 * SmartPDF AI v1.4 - Cloud Workspace & Drive Storage Manager
 * Handles Google Drive, OneDrive, and Dropbox integration:
 * - File import & export
 * - Folder browsing & folder picking
 * - Auto-save configurations
 * - Cloud sync status management ('Syncing...' | 'Synced' | 'Offline' | 'Failed')
 */

export type CloudProviderId = 'gdrive' | 'onedrive' | 'dropbox';

export type SyncStatusType = 'Syncing...' | 'Synced' | 'Offline' | 'Failed';

export interface CloudDriveFolder {
  id: string;
  name: string;
  provider: CloudProviderId;
  parentId?: string;
  itemCount: number;
  path: string;
}

export interface CloudDriveFile {
  id: string;
  name: string;
  provider: CloudProviderId;
  folderId: string;
  size: number;
  updatedAt: number;
  mimeType: string;
  downloadUrl?: string;
  contentSample?: string;
}

export interface CloudAccountInfo {
  provider: CloudProviderId;
  name: string;
  connected: boolean;
  email?: string;
  usedBytes: number;
  totalBytes: number;
  autoSaveEnabled: boolean;
  defaultFolderId: string;
}

// LocalStorage Keys
const CLOUD_ACCOUNTS_KEY = 'smartpdf_cloud_accounts';
const SYNC_STATUS_KEY = 'smartpdf_sync_status';
const AUTO_SAVE_KEY = 'smartpdf_auto_save_settings';
const MOCK_DRIVE_FILES_KEY = 'smartpdf_mock_drive_files';

// Default Providers Configuration
const DEFAULT_ACCOUNTS: Record<CloudProviderId, CloudAccountInfo> = {
  gdrive: {
    provider: 'gdrive',
    name: 'Google Drive',
    connected: true,
    email: 'alex.vance@gmail.com',
    usedBytes: 15248234291, // ~14.2 GB
    totalBytes: 16106127360, // 15 GB
    autoSaveEnabled: true,
    defaultFolderId: 'folder_gdrive_root',
  },
  onedrive: {
    provider: 'onedrive',
    name: 'Microsoft OneDrive',
    connected: true,
    email: 'alex.vance@outlook.com',
    usedBytes: 5368709120, // 5 GB
    totalBytes: 107374182400, // 100 GB
    autoSaveEnabled: true,
    defaultFolderId: 'folder_onedrive_root',
  },
  dropbox: {
    provider: 'dropbox',
    name: 'Dropbox Pro',
    connected: false,
    email: undefined,
    usedBytes: 0,
    totalBytes: 2147483648000, // 2 TB
    autoSaveEnabled: false,
    defaultFolderId: 'folder_dropbox_root',
  },
};

// Initial Drive Folders
export const INITIAL_CLOUD_FOLDERS: CloudDriveFolder[] = [
  // Google Drive
  { id: 'folder_gdrive_root', name: 'My Drive', provider: 'gdrive', itemCount: 6, path: '/My Drive' },
  { id: 'folder_gdrive_finance', name: 'Finance & Invoices', provider: 'gdrive', parentId: 'folder_gdrive_root', itemCount: 3, path: '/My Drive/Finance & Invoices' },
  { id: 'folder_gdrive_legal', name: 'Legal & Contracts', provider: 'gdrive', parentId: 'folder_gdrive_root', itemCount: 2, path: '/My Drive/Legal & Contracts' },
  { id: 'folder_gdrive_scans', name: 'Scanned Documents', provider: 'gdrive', parentId: 'folder_gdrive_root', itemCount: 1, path: '/My Drive/Scanned Documents' },

  // OneDrive
  { id: 'folder_onedrive_root', name: 'OneDrive Root', provider: 'onedrive', itemCount: 4, path: '/OneDrive Root' },
  { id: 'folder_onedrive_work', name: 'Work Projects', provider: 'onedrive', parentId: 'folder_onedrive_root', itemCount: 2, path: '/OneDrive Root/Work Projects' },
  { id: 'folder_onedrive_reports', name: 'Audit Reports', provider: 'onedrive', parentId: 'folder_onedrive_root', itemCount: 2, path: '/OneDrive Root/Audit Reports' },

  // Dropbox
  { id: 'folder_dropbox_root', name: 'Dropbox Home', provider: 'dropbox', itemCount: 3, path: '/Dropbox Home' },
  { id: 'folder_dropbox_shared', name: 'Shared Team Folder', provider: 'dropbox', parentId: 'folder_dropbox_root', itemCount: 3, path: '/Dropbox Home/Shared Team Folder' },
];

// Initial Cloud Files
export const INITIAL_CLOUD_FILES: CloudDriveFile[] = [
  {
    id: 'cloud_file_1',
    name: 'Q3_Financial_Statement_2026.pdf',
    provider: 'gdrive',
    folderId: 'folder_gdrive_finance',
    size: 2450000,
    updatedAt: Date.now() - 3600000 * 4,
    mimeType: 'application/pdf',
    contentSample: 'Sample PDF document containing financial statistics and balance sheets for Q3 2026.',
  },
  {
    id: 'cloud_file_2',
    name: 'Enterprise_Master_Service_Agreement.pdf',
    provider: 'gdrive',
    folderId: 'folder_gdrive_legal',
    size: 4890000,
    updatedAt: Date.now() - 3600000 * 24,
    mimeType: 'application/pdf',
    contentSample: 'Master Service Agreement between Acme Corp and SmartPDF AI Services.',
  },
  {
    id: 'cloud_file_3',
    name: 'Cloud_Infrastructure_Invoice_INV990.pdf',
    provider: 'gdrive',
    folderId: 'folder_gdrive_finance',
    size: 1120000,
    updatedAt: Date.now() - 3600000 * 48,
    mimeType: 'application/pdf',
    contentSample: 'Monthly invoice for cloud server hosting and API usage.',
  },
  {
    id: 'cloud_file_4',
    name: 'Quarterly_Audit_Report_2026.pdf',
    provider: 'onedrive',
    folderId: 'folder_onedrive_reports',
    size: 3400000,
    updatedAt: Date.now() - 3600000 * 12,
    mimeType: 'application/pdf',
    contentSample: 'Internal compliance audit report and executive summary.',
  },
  {
    id: 'cloud_file_5',
    name: 'Product_Roadmap_Q4_Presentation.pdf',
    provider: 'onedrive',
    folderId: 'folder_onedrive_work',
    size: 5800000,
    updatedAt: Date.now() - 3600000 * 36,
    mimeType: 'application/pdf',
    contentSample: 'Q4 Product release milestones and technical engineering roadmap.',
  },
  {
    id: 'cloud_file_6',
    name: 'Team_Onboarding_Handbook_2026.pdf',
    provider: 'dropbox',
    folderId: 'folder_dropbox_shared',
    size: 2900000,
    updatedAt: Date.now() - 3600000 * 72,
    mimeType: 'application/pdf',
    contentSample: 'Employee handbook detailing company policies and workspace setup.',
  },
];

// ==========================================
// 1. Account Persistence & Connectors
// ==========================================

export function getCloudAccounts(): Record<CloudProviderId, CloudAccountInfo> {
  try {
    const stored = localStorage.getItem(CLOUD_ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_ACCOUNTS;
}

export function updateCloudAccount(provider: CloudProviderId, updates: Partial<CloudAccountInfo>): Record<CloudProviderId, CloudAccountInfo> {
  const current = getCloudAccounts();
  const updated = {
    ...current,
    [provider]: { ...current[provider], ...updates },
  };
  try {
    localStorage.setItem(CLOUD_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

// ==========================================
// 2. Sync Status Management
// ==========================================

export function getSyncStatus(): SyncStatusType {
  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    if (stored) return stored as SyncStatusType;
  } catch {}
  return 'Synced';
}

export function setSyncStatus(status: SyncStatusType): void {
  try {
    localStorage.setItem(SYNC_STATUS_KEY, status);
  } catch {}
}

// Trigger simulated sync cycle
export function triggerCloudSync(onUpdate?: (status: SyncStatusType) => void): Promise<SyncStatusType> {
  return new Promise((resolve) => {
    setSyncStatus('Syncing...');
    if (onUpdate) onUpdate('Syncing...');

    setTimeout(() => {
      const isOnline = navigator.onLine;
      const finalStatus: SyncStatusType = isOnline ? 'Synced' : 'Offline';
      setSyncStatus(finalStatus);
      if (onUpdate) onUpdate(finalStatus);
      resolve(finalStatus);
    }, 1200);
  });
}

// ==========================================
// 3. Drive Files & Folders Storage
// ==========================================

export function getCloudFiles(): CloudDriveFile[] {
  try {
    const stored = localStorage.getItem(MOCK_DRIVE_FILES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  try {
    localStorage.setItem(MOCK_DRIVE_FILES_KEY, JSON.stringify(INITIAL_CLOUD_FILES));
  } catch {}
  return INITIAL_CLOUD_FILES;
}

export function saveCloudFile(file: Omit<CloudDriveFile, 'id' | 'updatedAt'> & { id?: string; updatedAt?: number }): CloudDriveFile {
  const list = getCloudFiles();
  const newFile: CloudDriveFile = {
    ...file,
    id: file.id || 'cloud_' + Math.random().toString(36).substring(2, 9),
    updatedAt: file.updatedAt || Date.now(),
  };
  const updated = [newFile, ...list.filter((f) => f.id !== newFile.id)];
  try {
    localStorage.setItem(MOCK_DRIVE_FILES_KEY, JSON.stringify(updated));
  } catch {}
  return newFile;
}

export function deleteCloudFile(id: string): CloudDriveFile[] {
  const list = getCloudFiles();
  const updated = list.filter((f) => f.id !== id);
  try {
    localStorage.setItem(MOCK_DRIVE_FILES_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

// Helper to convert cloud drive item to a browser File object for processing
export async function createDummyFileFromCloudDrive(fileRecord: CloudDriveFile): Promise<File> {
  // Generate realistic text / PDF content string
  const content = fileRecord.contentSample || `%PDF-1.7\n1 0 obj\n<< /Title (${fileRecord.name}) /Author (SmartPDF AI) >>\nendobj\n...`;
  const blob = new Blob([content], { type: fileRecord.mimeType || 'application/pdf' });
  return new File([blob], fileRecord.name, { type: fileRecord.mimeType || 'application/pdf', lastModified: fileRecord.updatedAt });
}

// Auto Save helper to save AI Chat, AI Analysis, or Generated PDF directly to Cloud Workspace
export function autoSaveToCloudDrive(
  title: string,
  content: string,
  type: 'chat' | 'analysis' | 'pdf',
  provider: CloudProviderId = 'gdrive'
): CloudDriveFile {
  setSyncStatus('Syncing...');

  const fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${type === 'pdf' ? 'pdf' : 'txt'}`;
  const savedFile = saveCloudFile({
    name: fileName,
    provider,
    folderId: provider === 'gdrive' ? 'folder_gdrive_root' : provider === 'onedrive' ? 'folder_onedrive_root' : 'folder_dropbox_root',
    size: content.length,
    mimeType: type === 'pdf' ? 'application/pdf' : 'text/plain',
    contentSample: content.slice(0, 500),
  });

  setTimeout(() => {
    setSyncStatus('Synced');
  }, 800);

  return savedFile;
}
