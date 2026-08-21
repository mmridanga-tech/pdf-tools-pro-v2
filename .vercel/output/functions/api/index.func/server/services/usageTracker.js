import crypto from 'crypto';
import { checkAndIncrementDailyUsageTransaction, writeAiUsageLog } from './firestore';
export const PRICING_CONFIG = {
    inputCostPerMillion: Number(process.env.GEMINI_INPUT_COST_PER_MILLION || 0.075),
    outputCostPerMillion: Number(process.env.GEMINI_OUTPUT_COST_PER_MILLION || 0.30),
};
class TelemetryStore {
    constructor() {
        Object.defineProperty(this, "userUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "ipUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "auditLogs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "rateLimitLogs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "securityLogs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Date.now()
        });
        Object.defineProperty(this, "alertThresholds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                errorRatePercent: 5.0,
                avgLatencyMs: 1500,
                highRateLimitPerHour: 20,
            }
        });
    }
    getTodayKeyTimestamp() {
        const now = new Date();
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    }
    hashIp(ip) {
        if (!ip)
            return 'unknown';
        const hash = crypto.createHash('sha256').update(ip + 'smartpdf_salt').digest('hex');
        return `ip_${hash.substring(0, 10)}`;
    }
    getUserUsageState(uid) {
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
    checkPerMinuteLimit(uid, ip, maxPerMin = 10) {
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
    recordBurstRequest(uid, ip) {
        const now = Date.now();
        const ipHash = this.hashIp(ip);
        const uState = this.getUserUsageState(uid);
        uState.perMinuteTimestamps.push(now);
        let ipLogs = this.ipUsage.get(ipHash) || [];
        ipLogs.push(now);
        this.ipUsage.set(ipHash, ipLogs);
    }
    async checkAndIncrementDailyQuota(uid, dailyLimit) {
        const res = await checkAndIncrementDailyUsageTransaction(uid, dailyLimit);
        return {
            allowed: res.allowed,
            currentCount: res.currentCount,
            limit: res.limit,
            remaining: Math.max(0, res.limit - res.currentCount),
        };
    }
    recordRateLimitEvent(event) {
        this.rateLimitLogs.unshift(event);
        if (this.rateLimitLogs.length > 200) {
            this.rateLimitLogs.pop();
        }
    }
    recordSecurityEvent(event) {
        this.securityLogs.unshift(event);
        if (this.securityLogs.length > 200) {
            this.securityLogs.pop();
        }
    }
    async logExecution(record) {
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
        }
        catch (err) {
            console.warn('Telemetry firestore write log warning:', err);
        }
    }
    getRecentLogs() {
        return [...this.auditLogs];
    }
    getRateLimitEvents() {
        return [...this.rateLimitLogs];
    }
    getSecurityEvents() {
        return [...this.securityLogs];
    }
    getSystemMetrics() {
        const now = Date.now();
        const totalRequests = this.auditLogs.length;
        const successfulRequests = this.auditLogs.filter((l) => l.status === 'success').length;
        const failedRequests = totalRequests - successfulRequests;
        const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 99.9;
        const totalDuration = this.auditLogs.reduce((acc, l) => acc + (l.durationMs || 0), 0);
        const avgLatencyMs = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 135;
        let totalPromptTokens = 0;
        let totalResponseTokens = 0;
        const endpointCounts = {};
        const workspaceCounts = {};
        for (const log of this.auditLogs) {
            const ep = log.endpoint || 'unknown';
            if (!endpointCounts[ep]) {
                endpointCounts[ep] = { count: 0, totalDuration: 0, errors: 0, tokens: 0 };
            }
            endpointCounts[ep].count++;
            endpointCounts[ep].totalDuration += log.durationMs || 0;
            if (log.status === 'error')
                endpointCounts[ep].errors++;
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
        const estimatedCostUSD = (totalPromptTokens / 1000000) * PRICING_CONFIG.inputCostPerMillion +
            (totalResponseTokens / 1000000) * PRICING_CONFIG.outputCostPerMillion;
        const rateLimitsPastHour = this.rateLimitLogs.filter((r) => now - r.timestamp < 3600000).length;
        const alerts = [];
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
//# sourceMappingURL=usageTracker.js.map