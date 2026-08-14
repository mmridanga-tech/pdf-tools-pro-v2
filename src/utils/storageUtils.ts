/**
 * SmartPDF AI v1.4 - Phase 12 Workspace Cloud Persistence & Storage Utility
 * Provides authenticated-user Firestore synchronization with offline-first local caching,
 * real-time listeners across devices, and localStorage fallback for guest users.
 *
 * Supported collections under users/{uid}/:
 *  - recentFiles
 *  - aiChats
 *  - aiAnalysis
 *  - analyzerReports
 */

import { auth, db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';

export interface RecentFileRecord {
  id: string;
  name: string;
  size: number;
  toolId: string;
  toolName: string;
  timestamp: number;
  status: 'completed' | 'processed';
  folder?: string;
  tags?: string[];
  isFavorite?: boolean;
  notes?: string;
  uid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SavedAiChat {
  id: string;
  title: string;
  docName: string;
  pageCount: number;
  timestamp: number;
  messages: ChatMessageItem[];
  folder?: string;
  tags?: string[];
  isFavorite?: boolean;
  uid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedAiAnalysis {
  id: string;
  title: string;
  docName: string;
  actionType: 'summarize' | 'translate' | 'keyPoints' | 'quiz' | 'explain' | 'actionItems' | string;
  content: string;
  timestamp: number;
  folder?: string;
  tags?: string[];
  isFavorite?: boolean;
  uid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskItem {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ActionItem {
  task: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExtractedEntities {
  personNames: string[];
  organizations: string[];
  dates: string[];
  amounts: string[];
  phoneNumbers: string[];
  emails: string[];
  addresses: string[];
  ids: string[];
}

export interface SavedAnalyzerReport {
  id: string;
  title: string;
  documentType:
    | 'Invoice'
    | 'Resume'
    | 'Contract'
    | 'Agreement'
    | 'Bank Statement'
    | 'Aadhaar'
    | 'PAN'
    | 'Passport'
    | 'Report'
    | 'Medical Record'
    | 'Unknown'
    | string;
  confidenceScore: number;
  executiveSummary: string;
  entities: ExtractedEntities;
  risks: RiskItem[];
  actionItems: ActionItem[];
  timestamp: number;
  folder?: string;
  tags?: string[];
  isFavorite?: boolean;
  uid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  toolName: string;
  timestamp: number;
  user: string;
}

// Local Storage Base Keys
const RECENT_FILES_KEY = 'pdf_tools_recent_files';
const FAVORITES_KEY = 'pdf_tools_favorite_tools';
const ACTIVITY_KEY = 'pdf_tools_activity_logs';
const SAVED_CHATS_KEY = 'smartpdf_ai_chats';
const SAVED_ANALYSIS_KEY = 'smartpdf_ai_analysis';
const SAVED_ANALYZER_KEY = 'smartpdf_analyzer_reports';
const THEME_KEY = 'smartpdf_theme_preference';

export const WORKSPACE_SYNC_EVENT = 'smartpdf-workspace-sync';

// Default Folders
export const DEFAULT_WORKSPACE_FOLDERS = ['General', 'Invoices', 'Contracts', 'Personal', 'Work', 'Finance'];

// Helper to determine storage key scoped to current user if logged in
function getStorageKey(baseKey: string): string {
  const uid = auth.currentUser?.uid;
  return uid ? `${baseKey}_${uid}` : baseKey;
}

// Dispatch event for UI reactivity across components
function notifyWorkspaceUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKSPACE_SYNC_EVENT));
  }
}

// ==========================================
// 1. Theme Persistence
// ==========================================

export function getThemePreference(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

export function setThemePreference(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
    }
  } catch {}
}

// ==========================================
// 2. Document History Records
// ==========================================

const INITIAL_MOCK_FILES: RecentFileRecord[] = [
  {
    id: 'doc_1',
    name: 'Q3_Financial_Statement_2026.pdf',
    size: 2450000,
    toolId: 'document-analyzer',
    toolName: 'Document Analyzer',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'processed',
    folder: 'Finance',
    tags: ['Verified', 'Q3', 'Audited'],
    isFavorite: true,
    notes: 'Approved by accounting department.',
  },
  {
    id: 'doc_2',
    name: 'GlobalTech_Master_Service_Agreement.pdf',
    size: 4890000,
    toolId: 'document-analyzer',
    toolName: 'Document Analyzer',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'processed',
    folder: 'Contracts',
    tags: ['Urgent', 'Legal'],
    isFavorite: true,
    notes: 'Missing counterparty signature.',
  },
  {
    id: 'doc_3',
    name: 'Enterprise_Cloud_Invoice_INV8891.pdf',
    size: 1200000,
    toolId: 'pdf-to-word',
    toolName: 'PDF to Word',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    status: 'completed',
    folder: 'Invoices',
    tags: ['Paid'],
    isFavorite: false,
  },
  {
    id: 'doc_4',
    name: 'Sarah_Jenkins_Executive_Resume.pdf',
    size: 850000,
    toolId: 'ocr-pdf',
    toolName: 'OCR PDF',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    status: 'completed',
    folder: 'Work',
    tags: ['Hiring', 'VP Procurement'],
    isFavorite: false,
  },
];

export function getRecentFiles(): RecentFileRecord[] {
  const key = getStorageKey(RECENT_FILES_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    // If user is guest, check fallback
    if (key !== RECENT_FILES_KEY) {
      const fallback = localStorage.getItem(RECENT_FILES_KEY);
      if (fallback) return JSON.parse(fallback);
    }
  } catch {}

  // Initialize with initial mock files if guest
  if (!auth.currentUser) {
    try {
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(INITIAL_MOCK_FILES));
    } catch {}
    return INITIAL_MOCK_FILES;
  }
  return [];
}

export function saveRecentFile(
  record: Omit<RecentFileRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): RecentFileRecord {
  const list = getRecentFiles();
  const uid = auth.currentUser?.uid;
  const now = Date.now();
  const isoNow = new Date().toISOString();

  const newRecord: RecentFileRecord = {
    folder: 'General',
    tags: [],
    isFavorite: false,
    ...record,
    id: record.id || 'doc_' + Math.random().toString(36).substring(2, 9),
    timestamp: record.timestamp || now,
    uid: uid || undefined,
    createdAt: isoNow,
    updatedAt: isoNow,
  };

  const updated = [newRecord, ...list.filter((f) => f.id !== newRecord.id)].slice(0, 50);
  const key = getStorageKey(RECENT_FILES_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Persistence (Async background)
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'recentFiles', newRecord.id);
    setDoc(docRef, { ...newRecord, uid }, { merge: true }).catch((err) => {
      console.warn('RecentFile cloud sync warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return newRecord;
}

export function updateRecentFile(id: string, updates: Partial<RecentFileRecord>): RecentFileRecord[] {
  const list = getRecentFiles();
  const uid = auth.currentUser?.uid;
  const isoNow = new Date().toISOString();

  const updated = list.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: isoNow } : f));
  const key = getStorageKey(RECENT_FILES_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Update
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'recentFiles', id);
    setDoc(docRef, { ...updates, updatedAt: isoNow }, { merge: true }).catch((err) => {
      console.warn('RecentFile cloud update warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function removeRecentFile(id: string): RecentFileRecord[] {
  const list = getRecentFiles();
  const uid = auth.currentUser?.uid;

  const updated = list.filter((f) => f.id !== id);
  const key = getStorageKey(RECENT_FILES_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Delete
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'recentFiles', id);
    deleteDoc(docRef).catch((err) => {
      console.warn('RecentFile cloud delete warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function clearRecentFiles(): void {
  const key = getStorageKey(RECENT_FILES_KEY);
  try {
    localStorage.removeItem(key);
  } catch {}
  notifyWorkspaceUpdate();
}

export function getTotalStorageUsedBytes(): number {
  const list = getRecentFiles();
  return list.reduce((acc, curr) => acc + (curr.size || 0), 0);
}

// ==========================================
// 3. Saved AI Chats
// ==========================================

const INITIAL_MOCK_CHATS: SavedAiChat[] = [
  {
    id: 'chat_101',
    title: 'Q3 Financial PDF Breakdown',
    docName: 'Q3_Financial_Statement_2026.pdf',
    pageCount: 14,
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    folder: 'Finance',
    tags: ['Audited', 'Q3'],
    isFavorite: true,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'What was the net profit growth in Q3 compared to Q2?',
        timestamp: '10:14 AM',
      },
      {
        id: 'm2',
        sender: 'assistant',
        text: 'According to Page 4 of Q3_Financial_Statement_2026.pdf, Net Profit grew by 18.4% year-over-year to $12.4M, driven by Enterprise subscription renewals.',
        timestamp: '10:15 AM',
      },
    ],
  },
  {
    id: 'chat_102',
    title: 'Master Service Agreement Legal Q&A',
    docName: 'GlobalTech_Master_Service_Agreement.pdf',
    pageCount: 8,
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    folder: 'Contracts',
    tags: ['Legal'],
    isFavorite: false,
    messages: [
      {
        id: 'm3',
        sender: 'user',
        text: 'What are the termination clause notice requirements?',
        timestamp: '02:30 PM',
      },
      {
        id: 'm4',
        sender: 'assistant',
        text: 'Section 12.2 specifies that either party may terminate the agreement with 30 days written notice. Early termination penalties apply if cancelled before May 31, 2025.',
        timestamp: '02:31 PM',
      },
    ],
  },
];

export function getSavedAiChats(): SavedAiChat[] {
  const key = getStorageKey(SAVED_CHATS_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (key !== SAVED_CHATS_KEY) {
      const fallback = localStorage.getItem(SAVED_CHATS_KEY);
      if (fallback) return JSON.parse(fallback);
    }
  } catch {}

  if (!auth.currentUser) {
    try {
      localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(INITIAL_MOCK_CHATS));
    } catch {}
    return INITIAL_MOCK_CHATS;
  }
  return [];
}

export function saveAiChat(
  chat: Omit<SavedAiChat, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): SavedAiChat {
  const list = getSavedAiChats();
  const uid = auth.currentUser?.uid;
  const now = Date.now();
  const isoNow = new Date().toISOString();

  const newChat: SavedAiChat = {
    folder: 'General',
    tags: [],
    isFavorite: false,
    ...chat,
    id: chat.id || 'chat_' + Math.random().toString(36).substring(2, 9),
    timestamp: chat.timestamp || now,
    uid: uid || undefined,
    createdAt: isoNow,
    updatedAt: isoNow,
  };

  const updated = [newChat, ...list.filter((c) => c.id !== newChat.id)].slice(0, 40);
  const key = getStorageKey(SAVED_CHATS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Persistence
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiChats', newChat.id);
    setDoc(docRef, { ...newChat, uid }, { merge: true }).catch((err) => {
      console.warn('AiChat cloud sync warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return newChat;
}

export function updateAiChat(id: string, updates: Partial<SavedAiChat>): SavedAiChat[] {
  const list = getSavedAiChats();
  const uid = auth.currentUser?.uid;
  const isoNow = new Date().toISOString();

  const updated = list.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: isoNow } : c));
  const key = getStorageKey(SAVED_CHATS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Update
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiChats', id);
    setDoc(docRef, { ...updates, updatedAt: isoNow }, { merge: true }).catch((err) => {
      console.warn('AiChat cloud update warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function removeAiChat(id: string): SavedAiChat[] {
  const list = getSavedAiChats();
  const uid = auth.currentUser?.uid;

  const updated = list.filter((c) => c.id !== id);
  const key = getStorageKey(SAVED_CHATS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Delete
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiChats', id);
    deleteDoc(docRef).catch((err) => {
      console.warn('AiChat cloud delete warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function clearSavedAiChats(): void {
  const key = getStorageKey(SAVED_CHATS_KEY);
  try {
    localStorage.removeItem(key);
  } catch {}
  notifyWorkspaceUpdate();
}

// ==========================================
// 4. Saved AI Analysis
// ==========================================

const INITIAL_MOCK_ANALYSIS: SavedAiAnalysis[] = [
  {
    id: 'ans_201',
    title: 'Executive Summary - Q3 Performance',
    docName: 'Q3_Financial_Statement_2026.pdf',
    actionType: 'summarize',
    content:
      'Executive Summary:\n• Gross revenue expanded by 22% reaching $57.5M.\n• Operating margin improved to 31.2% following automated document processing cost reduction.\n• Key enterprise accounts added: Acme Corp and Horizon Logistics.',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    folder: 'Finance',
    tags: ['Executive', 'Q3'],
    isFavorite: true,
  },
  {
    id: 'ans_202',
    title: 'Key Terms & Clauses Extraction',
    docName: 'GlobalTech_Master_Service_Agreement.pdf',
    actionType: 'keyPoints',
    content:
      'Key Contract Clauses:\n1. Total Value: $120,000.00 payable in monthly installments.\n2. Liability Cap: Capped at $100,000.00.\n3. Governing Law: State of Texas arbitration.\n4. Pending Action: Signature required from counterparty CEO.',
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
    folder: 'Contracts',
    tags: ['Compliance'],
    isFavorite: false,
  },
];

export function getSavedAiAnalysisList(): SavedAiAnalysis[] {
  const key = getStorageKey(SAVED_ANALYSIS_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (key !== SAVED_ANALYSIS_KEY) {
      const fallback = localStorage.getItem(SAVED_ANALYSIS_KEY);
      if (fallback) return JSON.parse(fallback);
    }
  } catch {}

  if (!auth.currentUser) {
    try {
      localStorage.setItem(SAVED_ANALYSIS_KEY, JSON.stringify(INITIAL_MOCK_ANALYSIS));
    } catch {}
    return INITIAL_MOCK_ANALYSIS;
  }
  return [];
}

export function saveAiAnalysis(
  item: Omit<SavedAiAnalysis, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): SavedAiAnalysis {
  const list = getSavedAiAnalysisList();
  const uid = auth.currentUser?.uid;
  const now = Date.now();
  const isoNow = new Date().toISOString();

  const newItem: SavedAiAnalysis = {
    folder: 'General',
    tags: [],
    isFavorite: false,
    ...item,
    id: item.id || 'ans_' + Math.random().toString(36).substring(2, 9),
    timestamp: item.timestamp || now,
    uid: uid || undefined,
    createdAt: isoNow,
    updatedAt: isoNow,
  };

  const updated = [newItem, ...list.filter((a) => a.id !== newItem.id)].slice(0, 40);
  const key = getStorageKey(SAVED_ANALYSIS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Persistence
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiAnalysis', newItem.id);
    setDoc(docRef, { ...newItem, uid }, { merge: true }).catch((err) => {
      console.warn('AiAnalysis cloud sync warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return newItem;
}

export function updateAiAnalysis(id: string, updates: Partial<SavedAiAnalysis>): SavedAiAnalysis[] {
  const list = getSavedAiAnalysisList();
  const uid = auth.currentUser?.uid;
  const isoNow = new Date().toISOString();

  const updated = list.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: isoNow } : a));
  const key = getStorageKey(SAVED_ANALYSIS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Update
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiAnalysis', id);
    setDoc(docRef, { ...updates, updatedAt: isoNow }, { merge: true }).catch((err) => {
      console.warn('AiAnalysis cloud update warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function removeAiAnalysis(id: string): SavedAiAnalysis[] {
  const list = getSavedAiAnalysisList();
  const uid = auth.currentUser?.uid;

  const updated = list.filter((a) => a.id !== id);
  const key = getStorageKey(SAVED_ANALYSIS_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Delete
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'aiAnalysis', id);
    deleteDoc(docRef).catch((err) => {
      console.warn('AiAnalysis cloud delete warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function clearSavedAiAnalysisList(): void {
  const key = getStorageKey(SAVED_ANALYSIS_KEY);
  try {
    localStorage.removeItem(key);
  } catch {}
  notifyWorkspaceUpdate();
}

// ==========================================
// 5. Saved Document Analyzer Reports
// ==========================================

const INITIAL_MOCK_ANALYZER_REPORTS: SavedAnalyzerReport[] = [
  {
    id: 'rep_301',
    title: 'Invoice Audit Report #INV-2026-8891',
    documentType: 'Invoice',
    confidenceScore: 98,
    executiveSummary:
      'Invoice #INV-2026-8891 issued by Global Tech Solutions LLC for Acme Enterprises Corp totaling $62,603.13 due August 15, 2026. Wire payment details and itemized pricing confirmed.',
    entities: {
      personNames: ['Sarah Jenkins'],
      organizations: ['Global Tech Solutions LLC', 'Acme Enterprises Corp'],
      dates: ['July 15, 2026', 'August 15, 2026'],
      amounts: ['$45,000.00', '$12,500.00', '$57,500.00', '$62,603.13'],
      phoneNumbers: ['+1 (415) 555-0199'],
      emails: ['billing@globaltech.com', 's.jenkins@acme.com'],
      addresses: ['450 Innovation Way, Suite 800, San Francisco, CA 94105'],
      ids: ['INV-2026-8891', 'EIN: 94-3829102'],
    },
    risks: [
      {
        title: 'Missing Receipt Signature',
        description: 'Receipt signature line is unverified prior to disbursement.',
        severity: 'medium',
      },
    ],
    actionItems: [
      {
        task: 'Obtain VP Procurement signature confirmation before wire transfer.',
        priority: 'high',
      },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 1,
    folder: 'Invoices',
    tags: ['Verified', 'Audit'],
    isFavorite: true,
  },
  {
    id: 'rep_302',
    title: 'Master Service Contract Compliance Audit',
    documentType: 'Contract',
    confidenceScore: 94,
    executiveSummary:
      'Master Services Agreement between Apex Systems Inc. and Horizon Logistics Ltd. valued at $120,000.00 annually. Termination requires 30 days notice.',
    entities: {
      personNames: ['David Miller'],
      organizations: ['Apex Systems Inc.', 'Horizon Logistics Ltd.'],
      dates: ['June 1, 2024', 'May 31, 2025'],
      amounts: ['$120,000.00', '$10,000.00', '$100,000.00'],
      phoneNumbers: ['+1 512-555-0144'],
      emails: ['david@apexsystems.io'],
      addresses: ['220 Market St, Austin, TX 78701'],
      ids: ['MSA-2024-TX'],
    },
    risks: [
      {
        title: 'Pending Counterparty Signature',
        description: 'Client execution signature block is incomplete.',
        severity: 'high',
      },
    ],
    actionItems: [
      {
        task: 'Request counterparty signature from Horizon Logistics legal team.',
        priority: 'high',
      },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    folder: 'Contracts',
    tags: ['Risk Flag', 'Legal'],
    isFavorite: true,
  },
];

export function getSavedAnalyzerReports(): SavedAnalyzerReport[] {
  const key = getStorageKey(SAVED_ANALYZER_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (key !== SAVED_ANALYZER_KEY) {
      const fallback = localStorage.getItem(SAVED_ANALYZER_KEY);
      if (fallback) return JSON.parse(fallback);
    }
  } catch {}

  if (!auth.currentUser) {
    try {
      localStorage.setItem(SAVED_ANALYZER_KEY, JSON.stringify(INITIAL_MOCK_ANALYZER_REPORTS));
    } catch {}
    return INITIAL_MOCK_ANALYZER_REPORTS;
  }
  return [];
}

export function saveAnalyzerReport(
  report: Omit<SavedAnalyzerReport, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): SavedAnalyzerReport {
  const list = getSavedAnalyzerReports();
  const uid = auth.currentUser?.uid;
  const now = Date.now();
  const isoNow = new Date().toISOString();

  const newReport: SavedAnalyzerReport = {
    folder: 'General',
    tags: [],
    isFavorite: false,
    ...report,
    id: report.id || 'rep_' + Math.random().toString(36).substring(2, 9),
    timestamp: report.timestamp || now,
    uid: uid || undefined,
    createdAt: isoNow,
    updatedAt: isoNow,
  };

  const updated = [newReport, ...list.filter((r) => r.id !== newReport.id)].slice(0, 40);
  const key = getStorageKey(SAVED_ANALYZER_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Persistence
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'analyzerReports', newReport.id);
    setDoc(docRef, { ...newReport, uid }, { merge: true }).catch((err) => {
      console.warn('AnalyzerReport cloud sync warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return newReport;
}

export function updateAnalyzerReport(id: string, updates: Partial<SavedAnalyzerReport>): SavedAnalyzerReport[] {
  const list = getSavedAnalyzerReports();
  const uid = auth.currentUser?.uid;
  const isoNow = new Date().toISOString();

  const updated = list.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: isoNow } : r));
  const key = getStorageKey(SAVED_ANALYZER_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Update
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'analyzerReports', id);
    setDoc(docRef, { ...updates, updatedAt: isoNow }, { merge: true }).catch((err) => {
      console.warn('AnalyzerReport cloud update warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function removeAnalyzerReport(id: string): SavedAnalyzerReport[] {
  const list = getSavedAnalyzerReports();
  const uid = auth.currentUser?.uid;

  const updated = list.filter((r) => r.id !== id);
  const key = getStorageKey(SAVED_ANALYZER_KEY);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore Delete
  if (uid && db) {
    const docRef = doc(db, 'users', uid, 'analyzerReports', id);
    deleteDoc(docRef).catch((err) => {
      console.warn('AnalyzerReport cloud delete warning:', err);
    });
  }

  notifyWorkspaceUpdate();
  return updated;
}

export function clearSavedAnalyzerReports(): void {
  const key = getStorageKey(SAVED_ANALYZER_KEY);
  try {
    localStorage.removeItem(key);
  } catch {}
  notifyWorkspaceUpdate();
}

// ==========================================
// 6. Activity Logs & Favorite Tools
// ==========================================

export function getActivityLogs(): ActivityLog[] {
  const key = getStorageKey(ACTIVITY_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (key !== ACTIVITY_KEY) {
      const fallback = localStorage.getItem(ACTIVITY_KEY);
      if (fallback) return JSON.parse(fallback);
    }
  } catch {}
  return [
    {
      id: '1',
      action: 'Ran Enterprise Document Analyzer on Invoice #INV-8891',
      toolName: 'Document Analyzer',
      timestamp: Date.now() - 3600000,
      user: 'You',
    },
    {
      id: '2',
      action: 'Saved AI Chat "Q3 Financial PDF Breakdown"',
      toolName: 'AI PDF Chat',
      timestamp: Date.now() - 86400000,
      user: 'You',
    },
    {
      id: '3',
      action: 'Exported Executive Summary to DOCX',
      toolName: 'AI Assistant',
      timestamp: Date.now() - 172800000,
      user: 'You',
    },
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
    const key = getStorageKey(ACTIVITY_KEY);
    localStorage.setItem(key, JSON.stringify([newLog, ...logs].slice(0, 30)));
    notifyWorkspaceUpdate();
  } catch {}
}

export function getFavoriteTools(): string[] {
  const key = getStorageKey(FAVORITES_KEY);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch {}
  return ['document-analyzer', 'ai-chat', 'ai-assistant', 'merge-pdf', 'compress-pdf'];
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
    const key = getStorageKey(FAVORITES_KEY);
    localStorage.setItem(key, JSON.stringify(updated));
    notifyWorkspaceUpdate();
    return updated;
  } catch {
    return getFavoriteTools();
  }
}

// ==========================================
// 7. Live Real-Time Firestore Synchronization
// ==========================================

let activeUnsubscribers: Unsubscribe[] = [];

/**
 * Subscribes to all 4 workspace subcollections for the authenticated user.
 * Merges cloud data into local cache and notifies UI subscribers.
 * Returns an unsubscription callback to prevent listener leaks.
 */
export function subscribeToUserWorkspace(uid: string, onUpdate?: () => void): () => void {
  // Clean up any existing listeners first
  unsubscribeUserWorkspace();

  if (!uid || !db) {
    return () => {};
  }

  try {
    // 1. Recent Files Subcollection
    const recentFilesQuery = query(collection(db, 'users', uid, 'recentFiles'), orderBy('timestamp', 'desc'));
    const unsubsRecent = onSnapshot(
      recentFilesQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const files = snapshot.docs.map((d) => d.data() as RecentFileRecord);
          localStorage.setItem(`${RECENT_FILES_KEY}_${uid}`, JSON.stringify(files));
          if (onUpdate) onUpdate();
          notifyWorkspaceUpdate();
        }
      },
      (err) => {
        console.warn('Firestore recentFiles live sync notice:', err);
      }
    );
    activeUnsubscribers.push(unsubsRecent);

    // 2. Saved AI Chats Subcollection
    const chatsQuery = query(collection(db, 'users', uid, 'aiChats'), orderBy('timestamp', 'desc'));
    const unsubsChats = onSnapshot(
      chatsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const chats = snapshot.docs.map((d) => d.data() as SavedAiChat);
          localStorage.setItem(`${SAVED_CHATS_KEY}_${uid}`, JSON.stringify(chats));
          if (onUpdate) onUpdate();
          notifyWorkspaceUpdate();
        }
      },
      (err) => {
        console.warn('Firestore aiChats live sync notice:', err);
      }
    );
    activeUnsubscribers.push(unsubsChats);

    // 3. Saved AI Analysis Subcollection
    const analysisQuery = query(collection(db, 'users', uid, 'aiAnalysis'), orderBy('timestamp', 'desc'));
    const unsubsAnalysis = onSnapshot(
      analysisQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const analysisList = snapshot.docs.map((d) => d.data() as SavedAiAnalysis);
          localStorage.setItem(`${SAVED_ANALYSIS_KEY}_${uid}`, JSON.stringify(analysisList));
          if (onUpdate) onUpdate();
          notifyWorkspaceUpdate();
        }
      },
      (err) => {
        console.warn('Firestore aiAnalysis live sync notice:', err);
      }
    );
    activeUnsubscribers.push(unsubsAnalysis);

    // 4. Saved Analyzer Reports Subcollection
    const reportsQuery = query(collection(db, 'users', uid, 'analyzerReports'), orderBy('timestamp', 'desc'));
    const unsubsReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const reports = snapshot.docs.map((d) => d.data() as SavedAnalyzerReport);
          localStorage.setItem(`${SAVED_ANALYZER_KEY}_${uid}`, JSON.stringify(reports));
          if (onUpdate) onUpdate();
          notifyWorkspaceUpdate();
        }
      },
      (err) => {
        console.warn('Firestore analyzerReports live sync notice:', err);
      }
    );
    activeUnsubscribers.push(unsubsReports);
  } catch (err) {
    console.warn('Failed to attach workspace Firestore listeners:', err);
  }

  return () => {
    unsubscribeUserWorkspace();
  };
}

export function unsubscribeUserWorkspace(): void {
  if (activeUnsubscribers.length > 0) {
    activeUnsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
    activeUnsubscribers = [];
  }
}
