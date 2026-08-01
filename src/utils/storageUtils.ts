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

export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
  } catch {
    // Ignore storage errors
  }
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
