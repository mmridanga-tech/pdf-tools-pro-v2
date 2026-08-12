export interface UsageRecord {
  uid: string;
  endpoint: string;
  timestamp: number;
  durationMs: number;
  status: 'success' | 'error';
  tokenUsage?: {
    promptTokens?: number;
    responseTokens?: number;
  };
}

export interface UserUsageState {
  uid: string;
  dailyCount: number;
  lastResetTimestamp: number;
  perMinuteTimestamps: number[];
}

/**
 * Server-side Usage Store Abstraction.
 * In-memory implementation designed for clean swap to Redis / Database in future phases.
 */
class UsageTrackerStore {
  private userUsage: Map<string, UserUsageState> = new Map();
  private ipUsage: Map<string, number[]> = new Map();
  private auditLogs: UsageRecord[] = [];

  private getTodayKeyTimestamp(): number {
    const now = new Date();
    // Midnight UTC timestamp
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  /**
   * Retrieve or initialize usage state for a UID
   */
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

    // Clean up per-minute timestamps older than 60 seconds
    const now = Date.now();
    state.perMinuteTimestamps = state.perMinuteTimestamps.filter((ts) => now - ts < 60000);

    return state;
  }

  /**
   * Check if request is allowed under per-minute rate limit (10 req/min)
   */
  public checkPerMinuteLimit(uid: string, ip: string, maxPerMin = 10): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();

    // 1. Check UID per-minute limit
    const uState = this.getUserUsageState(uid);
    if (uState.perMinuteTimestamps.length >= maxPerMin) {
      const oldest = uState.perMinuteTimestamps[0];
      const waitSec = Math.ceil((60000 - (now - oldest)) / 1000);
      return { allowed: false, retryAfterSec: Math.max(1, waitSec) };
    }

    // 2. Check IP per-minute limit (max 20 req/min per IP to prevent flood)
    let ipLogs = this.ipUsage.get(ip) || [];
    ipLogs = ipLogs.filter((ts) => now - ts < 60000);
    this.ipUsage.set(ip, ipLogs);

    if (ipLogs.length >= 20) {
      const oldest = ipLogs[0];
      const waitSec = Math.ceil((60000 - (now - oldest)) / 1000);
      return { allowed: false, retryAfterSec: Math.max(1, waitSec) };
    }

    return { allowed: true };
  }

  /**
   * Check if request is allowed under daily quota
   */
  public checkDailyQuota(uid: string, dailyLimit: number): { allowed: boolean; currentCount: number; limit: number } {
    const uState = this.getUserUsageState(uid);
    if (uState.dailyCount >= dailyLimit) {
      return { allowed: false, currentCount: uState.dailyCount, limit: dailyLimit };
    }
    return { allowed: true, currentCount: uState.dailyCount, limit: dailyLimit };
  }

  /**
   * Increment usage counters upon request execution
   */
  public incrementUsage(uid: string, ip: string): void {
    const now = Date.now();
    const uState = this.getUserUsageState(uid);
    uState.dailyCount += 1;
    uState.perMinuteTimestamps.push(now);

    let ipLogs = this.ipUsage.get(ip) || [];
    ipLogs.push(now);
    this.ipUsage.set(ip, ipLogs);
  }

  /**
   * Log completed AI request execution details for usage auditing
   */
  public logExecution(record: UsageRecord): void {
    this.auditLogs.push(record);
    // Keep max 1000 recent logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }
  }

  public getRecentLogs(): UsageRecord[] {
    return [...this.auditLogs];
  }
}

export const usageTracker = new UsageTrackerStore();
