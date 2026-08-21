import {
  ChatMessage,
  DocumentAnalysisReport,
  SystemHealthData,
  WorkspaceTelemetryData,
  SeoArticlePackage,
} from '../types';

export function getStoredAuthToken(): string {
  const token = localStorage.getItem('smartpdf_auth_token');
  if (token) return token;
  // Default session token for instant zero-friction preview & dev
  const defaultToken = 'mock_token_admin_admin@smartpdf.ai';
  localStorage.setItem('smartpdf_auth_token', defaultToken);
  return defaultToken;
}

export function setStoredAuthToken(token: string) {
  localStorage.setItem('smartpdf_auth_token', token);
}

export function getStoredUserEmail(): string {
  return localStorage.getItem('smartpdf_user_email') || 'admin@smartpdf.ai';
}

export function setStoredUserEmail(email: string) {
  localStorage.setItem('smartpdf_user_email', email);
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getStoredAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse response JSON' }));
  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealthData> {
    const res = await request('/api/health');
    return res.data;
  },

  // Gemini AI Document Chat
  async geminiChat(params: {
    message: string;
    pdfContext?: string;
    history?: ChatMessage[];
    mode?: 'chat' | 'summarize' | 'explain' | 'translate' | 'extractTables' | 'extractKeyPoints';
    targetLanguage?: string;
    workspaceId?: string;
  }): Promise<{ reply: string }> {
    const res = await request('/api/gemini/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  // Gemini AI Assistant
  async geminiAssistant(params: {
    action: 'summarize' | 'translate' | 'explain' | 'action_items' | 'custom';
    text?: string;
    prompt?: string;
    context?: string;
    targetLanguage?: string;
    workspaceId?: string;
  }): Promise<{ result: string; action: string }> {
    const res = await request('/api/gemini/assistant', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  // Gemini Enterprise Document Analyzer
  async geminiAnalyze(params: {
    textContext: string;
    workspaceId?: string;
  }): Promise<DocumentAnalysisReport> {
    const res = await request('/api/gemini/analyzer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  // Billing & Subscriptions
  async getBillingStatus() {
    return await request('/api/billing/status');
  },

  async createStripeCheckout(plan: 'pro' | 'enterprise') {
    return await request('/api/checkout/stripe', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async createRazorpayCheckout(plan: 'pro' | 'enterprise') {
    return await request('/api/checkout/razorpay', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async getCustomerPortalUrl() {
    return await request('/api/billing/portal', {
      method: 'POST',
    });
  },

  // Workspace Telemetry
  async getTelemetry(workspaceId = 'default'): Promise<WorkspaceTelemetryData> {
    const res = await request(`/api/workspace/telemetry?workspaceId=${workspaceId}`);
    return res.telemetry;
  },

  // Admin SEO Generator
  async generateSeoContent(params: {
    topicTitle: string;
    targetKeywords?: string;
    category?: string;
  }): Promise<SeoArticlePackage> {
    const res = await request('/api/admin/generate-content', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },

  // User GDPR / CCPA Data Portability & Account Management (Phase 15C)
  async exportUserData() {
    return await request('/api/user/export');
  },

  async deleteUserAccount() {
    return await request('/api/user/delete', {
      method: 'DELETE',
    });
  },
};
