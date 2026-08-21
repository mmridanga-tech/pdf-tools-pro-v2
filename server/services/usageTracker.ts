import crypto from 'crypto';
import { checkAndIncrementDailyUsageTransaction, writeAiUsageLog } from './firestore';

export interface UsageRecord {
  uid: string;
  workspaceId?: string;
  endpoint: string;
  timestamp: number;
  durationMs: number;
  status: 'success' | 'error';
  httpStatus?: number;
  model?: string;
  errorCategory?: 'auth' | 'quota' | 'rate_limit' | 'gemini_error' | 'validation' | 'internal';
  tokenUsage?: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  };
}

export interface RateLimitEvent {
  id: string;
  endpoint: string;
  uid?: string;
  ipHash: string;
  timestamp: number;
  reason: 'per_minute_burst' | 'daily_quota_exceeded' | 'ip_burst';
  retryAfterSec?: number;
}

export interface SecurityEvent {
  id: string;
  type: 'auth_failure' | 'unauthorized_access' | 'rate_limit_block' | 'account_deletion' | 'data_export';
  uid?: string;
  endpoint: string;
  timestamp: number;
  details?: string;
}

export interface SystemAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  category: 'error_rate' | 'latency' | 'quota' | 'rate_limit' | 'connectivity';
}

export interface UserUsageState {
  uid: string;
  dailyCount: number;
  lastResetTimestamp: number;
  perMinuteTimestamps: number[];
}

export const PRICING_CONFIG = {
  inputCostPerMillion: Number(process.env.GEMINI_INPUT_COST_PER_MILLION || 0.075),
  outputCostPerMillion: Number(process.env.GEMINI_OUTPUT_COST_PER_MILLION || 0.30),
};

class TelemetryStore {
  private userUsage: Map<string, UserUsageState> = new Map();
  private ipUsage: Map<string, number[]> = new Map();
  private auditLogs: UsageRecord[] = [];
  private rateLimitLogs: RateLimitEvent[] = [];
  private securityLogs: SecurityEvent[] = [];
  private startTime = Date.now();

  public alertThresholds = {
    errorRatePercent: 5.0,
    avgLatencyMs: 1500,
    highRateLimitPerHour: 20,
  };

  private getTodayKeyTimestamp(): number {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  public hashIp(ip: string): string {
    if (!ip) return 'unknown';
    const hash = crypto.createHash('sha256').update(ip + 'smartpdf_salt').digest('hex');
    return `ip_${hash.substring(0, 10)}`;
  }

  public getUserUsageState(uid: string): UserUsageState {
    const todayMidnight = this.getTodayKeyTimestamp();
    let state = this.userUsage.get(uid);

    if (!state || state.lastResetTimestamp < todayMidnight) {
      state = {
        uid,
        dailyCount: 0,
        lastResetTimestamp: todayMidnight,
        perMinuteTimestamps: [],
      };
      this.userUsage.set(uid, state);
    }

    const now = Date.now();
    state.perMinuteTimestamps = state.perMinuteTimestamps.filter((ts) => now - ts < 60000);

    return state;
  }

  public checkPerMinuteLimit(uid: string, ip: string, maxPerMin = 10): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const ipHash = this.hashIp(ip);

    const uState = this.getUserUsageState(uid);
    if (uState.perMinuteTimestamps.length >= maxPerMin) {
      const oldest = uState.perMinuteTimestamps[0];
      const waitSec = Math.ceil((60000 - (now - oldest)) / 1000);
      this.recordRateLimitEvent({
        id: `rl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        endpoint: '/api/gemini/*',
        uid,
        ipHash,
        timestamp: now,
        reason: 'per_minute_burst',
        retryAfterSec: Math.max(1, waitSec),
      });
      return { allowed: false, retryAfterSec: Math.max(1, waitSec) };
    }

    let ipLogs = this.ipUsage.get(ipHash) || [];
    ipLogs = ipLogs.filter((ts) => now - ts < 60000);
    this.ipUsage.set(ipHash, ipLogs);

    if (ipLogs.length >= 20) {
      const oldest = ipLogs[0];
      const waitSec = Math.ceil((60000 - (now - oldest)) / 1000);
      this.recordRateLimitEvent({
        id: `rl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        endpoint: '/api/gemini/*',
        uid,
        ipHash,
        timestamp: now,
        reason: 'ip_burst',
        retryAfterSec: Math.max(1, waitSec),
      });
      return { allowed: false, retryAfterSec: Math.max(1, waitSec) };
    }

    return { allowed: true };
  }

  public recordBurstRequest(uid: string, ip: string): void {
    const now = Date.now();
    const ipHash = this.hashIp(ip);
    const uState = this.getUserUsageState(uid);
    uState.perMinuteTimestamps.push(now);

    let ipLogs = this.ipUsage.get(ipHash) || [];
    ipLogs.push(now);
    this.ipUsage.set(ipHash, ipLogs);
  }

  public async checkAndIncrementDailyQuota(
    uid: string,
    dailyLimit: number
  ): Promise<{ allowed: boolean; currentCount: number; limit: number; remaining: number }> {
    const res = await checkAndIncrementDailyUsageTransaction(uid, dailyLimit);
    return {
      allowed: res.allowed,
      currentCount: res.currentCount,
      limit: res.limit,
      remaining: Math.max(0, res.limit - res.currentCount),
    };
  }

  public recordRateLimitEvent(event: RateLimitEvent): void {
    this.rateLimitLogs.unshift(event);
    if (this.rateLimitLogs.length > 200) {
      this.rateLimitLogs.pop();
    }
  }

  public recordSecurityEvent(event: SecurityEvent): void {
    this.securityLogs.unshift(event);
    if (this.securityLogs.length > 200) {
      this.securityLogs.pop();
    }
  }

  public async logExecution(record: UsageRecord): Promise<void> {
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }

    try {
      await writeAiUsageLog({
        uid: record.uid,
        endpoint: record.endpoint,
        timestamp: record.timestamp,
        durationMs: record.durationMs,
        status: record.status,
      });
    } catch (err) {
      console.warn('Telemetry firestore write log warning:', err);
    }
  }

  public getRecentLogs(): UsageRecord[] {
    return [...this.auditLogs];
  }

  public getRateLimitEvents(): RateLimitEvent[] {
    return [...this.rateLimitLogs];
  }

  public getSecurityEvents(): SecurityEvent[] {
    return [...this.securityLogs];
  }

  public getSystemMetrics() {
    const now = Date.now();
    const totalRequests = this.auditLogs.length;
    const successfulRequests = this.auditLogs.filter((l) => l.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 99.9;

    const totalDuration = this.auditLogs.reduce((acc, l) => acc + (l.durationMs || 0), 0);
    const avgLatencyMs = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 135;

    let totalPromptTokens = 0;
    let totalResponseTokens = 0;

    const endpointCounts: Record<string, { count: number; totalDuration: number; errors: number; tokens: number }> = {};
    const workspaceCounts: Record<string, number> = {};

    for (const log of this.auditLogs) {
      const ep = log.endpoint || 'unknown';
      if (!endpointCounts[ep]) {
        endpointCounts[ep] = { count: 0, totalDuration: 0, errors: 0, tokens: 0 };
      }
      endpointCounts[ep].count++;
      endpointCounts[ep].totalDuration += log.durationMs || 0;
      if (log.status === 'error') endpointCounts[ep].errors++;

      const pTokens = log.tokenUsage?.promptTokens || Math.round((log.durationMs || 150) * 4.5);
      const rTokens = log.tokenUsage?.responseTokens || Math.round((log.durationMs || 150) * 1.8);
      const logTotalTokens = log.tokenUsage?.totalTokens || pTokens + rTokens;

      totalPromptTokens += pTokens;
      totalResponseTokens += rTokens;
      endpointCounts[ep].tokens += logTotalTokens;

      const ws = log.workspaceId || 'personal';
      workspaceCounts[ws] = (workspaceCounts[ws] || 0) + 1;
    }

    const totalTokens = totalPromptTokens + totalResponseTokens;

    const estimatedCostUSD =
      (totalPromptTokens / 1_000_000) * PRICING_CONFIG.inputCostPerMillion +
      (totalResponseTokens / 1_000_000) * PRICING_CONFIG.outputCostPerMillion;

    const rateLimitsPastHour = this.rateLimitLogs.filter((r) => now - r.timestamp < 3600000).length;

    const alerts: SystemAlert[] = [];

    if (totalRequests >= 5 && successRate < 100 - this.alertThresholds.errorRatePercent) {
      alerts.push({
        id: 'alt_error_rate',
        level: 'critical',
        title: 'Elevated API Error Rate',
        message: `Error rate is currently at ${(100 - successRate).toFixed(1)}%, exceeding the ${this.alertThresholds.errorRatePercent}% threshold.`,
        timestamp: now,
        category: 'error_rate',
      });
    }

    if (totalRequests >= 5 && avgLatencyMs > this.alertThresholds.avgLatencyMs) {
      alerts.push({
        id: 'alt_latency',
        level: 'warning',
        title: 'High Server Latency Detected',
        message: `Average API latency is ${avgLatencyMs}ms (threshold: ${this.alertThresholds.avgLatencyMs}ms).`,
        timestamp: now,
        category: 'latency',
      });
    }

    if (rateLimitsPastHour >= this.alertThresholds.highRateLimitPerHour) {
      alerts.push({
        id: 'alt_rate_limit',
        level: 'warning',
        title: 'Frequent Rate-Limit Events',
        message: `${rateLimitsPastHour} requests were rate-limited in the past hour.`,
        timestamp: now,
        category: 'rate_limit',
      });
    }

    const endpointBreakdown = Object.entries(endpointCounts).map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgLatencyMs: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
      errorRate: data.count > 0 ? Math.round((data.errors / data.count) * 100) : 0,
      tokens: data.tokens,
      percentage: totalRequests > 0 ? Math.round((data.count / totalRequests) * 100) : 0,
    }));

    return {
      uptimeSeconds: Math.floor((now - this.startTime) / 1000),
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: Math.round(successRate * 10) / 10,
      avgLatencyMs,
      tokenMetrics: {
        totalPromptTokens,
        totalResponseTokens,
        totalTokens,
        estimatedCostUSD: Number(estimatedCostUSD.toFixed(5)),
        pricingConfig: PRICING_CONFIG,
      },
      rateLimitsPastHour,
      activeAlerts: alerts,
      endpointBreakdown,
      workspaceUsage: workspaceCounts,
    };
  }
}

export const telemetryStore = new TelemetryStore();
export const usageTracker = telemetryStore;
