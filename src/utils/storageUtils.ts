/**
 * Local Storage Management for Recent Activity and Favorite Tools
 */

export interface RecentFileRecord {
  id: string;
  name: string;
  size: number;
  toolId: string;
  toolName: string;
  timestamp: number;
  status: 'completed' | 'processed';
}

const RECENT_FILES_KEY = 'pdf_tools_recent_files';
const FAVORITES_KEY = 'pdf_tools_favorite_tools';

export function getRecentFiles(): RecentFileRecord[] {
  try {
    const data = localStorage.getItem(RECENT_FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecentFile(record: Omit<RecentFileRecord, 'id' | 'timestamp'>): void {
  try {
    const list = getRecentFiles();
    const newRecord: RecentFileRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    const updated = [newRecord, ...list.filter((f) => f.name !== record.name)].slice(0, 10);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function removeRecentFile(id: string): RecentFileRecord[] {
  try {
    const list = getRecentFiles();
    const updated = list.filter((f) => f.id !== id);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getRecentFiles();
  }
}

export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
  } catch {}
}

export function getTotalStorageUsedBytes(): number {
  const list = getRecentFiles();
  return list.reduce((acc, curr) => acc + (curr.size || 0), 0);
}

export interface ActivityLog {
  id: string;
  action: string;
  toolName: string;
  timestamp: number;
  user: string;
}

const ACTIVITY_KEY = 'pdf_tools_activity_logs';

export function getActivityLogs(): ActivityLog[] {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [
    { id: '1', action: 'Merged 3 PDF files', toolName: 'Merge PDF', timestamp: Date.now() - 3600000, user: 'You' },
    { id: '2', action: 'Compressed Q3_Report.pdf (-45%)', toolName: 'Compress PDF', timestamp: Date.now() - 86400000, user: 'You' },
    { id: '3', action: 'Converted Agreement.pdf to Word', toolName: 'PDF to Word', timestamp: Date.now() - 172800000, user: 'You' },
  ];
}

export function addActivityLog(action: string, toolName: string, userName = 'You'): void {
  try {
    const logs = getActivityLogs();
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      toolName,
      timestamp: Date.now(),
      user: userName,
    };
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify([newLog, ...logs].slice(0, 30)));
  } catch {}
}

export function clearActivityLogs(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {}
}


export function getFavoriteTools(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : ['merge-pdf', 'compress-pdf', 'pdf-to-word'];
  } catch {
    return ['merge-pdf', 'compress-pdf', 'pdf-to-word'];
  }
}

export function toggleFavoriteTool(toolId: string): string[] {
  try {
    const favorites = getFavoriteTools();
    let updated: string[];
    if (favorites.includes(toolId)) {
      updated = favorites.filter((id) => id !== toolId);
    } else {
      updated = [...favorites, toolId];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getFavoriteTools();
  }
}
