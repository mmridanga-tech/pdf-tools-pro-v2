export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'images-to-pdf'
  | 'ocr'
  | 'watermark'
  | 'protect'
  | 'rotate'
  | 'ai-chat'
  | 'ai-analyzer'
  | 'admin-seo'
  | 'telemetry';

export interface ToolDefinition {
  id: ToolId;
  title: string;
  shortDesc: string;
  category: 'organize' | 'convert' | 'security' | 'ai' | 'admin';
  icon: string;
  badge?: string;
  isPro?: boolean;
}

export interface UserSession {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  token: string;
  dailyAiLimit: number;
  dailyAiUsed: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  citations?: string[];
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

export interface DocumentAnalysisReport {
  documentType: string;
  confidenceScore: number;
  executiveSummary: string;
  entities: {
    personNames?: string[];
    organizations?: string[];
    dates?: string[];
    amounts?: string[];
    phoneNumbers?: string[];
    emails?: string[];
    addresses?: string[];
    ids?: string[];
  };
  risks: RiskItem[];
  actionItems: ActionItem[];
}

export interface SystemHealthData {
  status: string;
  version: string;
  uptimeSeconds: number;
  services: {
    api: { status: string; avgLatencyMs: number; errorRatePercent: number; totalRequestsHandled: number };
    firebase: { status: string };
    firestore: { status: string };
    gemini: { status: string; model: string };
  };
}

export interface WorkspaceTelemetryData {
  workspaceId: string;
  systemHealth: {
    apiStatus: string;
    firebaseStatus: string;
    firestoreStatus: string;
    geminiStatus: string;
    uptimeSeconds: number;
  };
  requestsToday: number;
  requestsThisMonth: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgLatencyMs: number;
  quotaLimit: number;
  activeMembersCount: number;
  tokenMetrics: {
    totalPromptTokens: number;
    totalResponseTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
  endpointBreakdown: Array<{
    endpoint: string;
    count: number;
    avgLatencyMs: number;
    errorRate: number;
    tokens: number;
    percentage: number;
  }>;
  security: {
    rateLimitsPastHour: number;
    rateLimitEvents: Array<any>;
    securityEvents: Array<any>;
  };
  memberUsage: Array<{
    uid: string;
    name: string;
    email: string;
    requests: number;
    role: string;
  }>;
}

export interface SeoArticleSection {
  heading: string;
  paragraphs: string[];
  listItems?: string[];
  callout?: {
    type: string;
    title: string;
    text: string;
  };
}

export interface SeoArticlePackage {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl: string;
  subtitle: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  featuredImage: string;
  keywords: string[];
  relatedSlugs: string[];
  faqs: Array<{ question: string; answer: string }>;
  toolCta: { title: string; description: string; buttonText: string; link: string };
  sections: SeoArticleSection[];
}
