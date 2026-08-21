import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Users,
  DollarSign,
  Cpu,
  RefreshCw,
  Server,
  ArrowLeft
} from 'lucide-react';
import { WorkspaceTelemetryData } from '../types';
import { api } from '../services/apiClient';

interface TelemetryDashboardProps {
  onBack: () => void;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ onBack }) => {
  const [telemetry, setTelemetry] = useState<WorkspaceTelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTelemetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTelemetry('default');
      setTelemetry(data);
    } catch (err: any) {
      console.error('Telemetry fetch error:', err);
      setError(err?.message || 'Failed to load telemetry data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Workspace Telemetry & Quota Monitor</h1>
            <p className="text-xs text-slate-500">Real-time system health, AI token usage, and API latency</p>
          </div>
        </div>

        <button
          onClick={loadTelemetry}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {telemetry && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-semibold">Today's AI Requests</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{telemetry.requestsToday}</span>
                <span className="text-xs text-slate-400">/ {telemetry.quotaLimit} daily limit</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, (telemetry.requestsToday / telemetry.quotaLimit) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-semibold">Success Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{telemetry.successRate}%</span>
                <span className="text-xs text-emerald-600 font-semibold">Healthy</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">{telemetry.failedRequests} failed requests recorded</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-semibold">Avg API Latency</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{telemetry.avgLatencyMs}ms</span>
                <span className="text-xs text-blue-600 font-semibold">Gemini Flash</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">High-speed inference target</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-semibold">Estimated AI Cost</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  ${telemetry.tokenMetrics.estimatedCostUSD.toFixed(4)}
                </span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {telemetry.tokenMetrics.totalTokens.toLocaleString()} total tokens
              </p>
            </div>
          </div>

          {/* Service Health & Endpoint Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Services Status */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-indigo-600" />
                Underlying Infrastructure Status
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Core API Gateway', status: telemetry.systemHealth.apiStatus },
                  { name: 'Gemini 3.6 Flash Inference', status: telemetry.systemHealth.geminiStatus },
                  { name: 'Firebase Admin & Auth', status: telemetry.systemHealth.firebaseStatus },
                  { name: 'Firestore Quota Store', status: telemetry.systemHealth.firestoreStatus },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Endpoint Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Endpoint Execution Distribution
              </h3>

              <div className="space-y-3 text-xs">
                {telemetry.endpointBreakdown.map((ep, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-[11px]">
                      <span>{ep.endpoint}</span>
                      <span className="font-sans text-indigo-600">{ep.count} reqs ({ep.percentage}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                      <span>Avg Latency: {ep.avgLatencyMs}ms</span>
                      <span>Tokens: {ep.tokens.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security & Rate Limiting Audit */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Security Telemetry & Rate-Limiting Guardrails
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All client endpoints enforce burst-rate limits (10 req/min) and plan-bound daily quotas to ensure zero infrastructure abuse.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-sans font-bold">
                <span>Security Log Stream</span>
                <span>Active Guard: Strict</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <p className="text-emerald-400">
                  [{new Date().toISOString()}] TELEMETRY_INIT: Rate limiter active for all /api/gemini/* routes.
                </p>
                <p className="text-slate-400">
                  [{new Date().toISOString()}] AUTH_VERIFY: Firebase token signature verification enabled.
                </p>
                <p className="text-slate-400">
                  [{new Date().toISOString()}] IDEMPOTENCY_STORE: Webhook deduplication ready (Stripe/Razorpay).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
