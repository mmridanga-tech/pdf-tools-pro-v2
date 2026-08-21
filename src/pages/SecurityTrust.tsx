import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Server,
  Key,
  Users,
  EyeOff,
  Clock,
  CheckCircle2,
  FileCheck,
  Mail,
  Globe,
  ArrowLeft,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const SecurityTrust: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Security & Trust Center - SmartPDF AI"
        description="Learn how SmartPDF AI safeguards your documents with client-side WebAssembly, ephemeral RAM buffers, Firebase Auth, and strict multi-tenant isolation."
        path="/security"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">Security & Trust Center</span>
        </div>

        {/* Header Hero */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Security Architecture
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <EyeOff className="w-3.5 h-3.5" /> Zero-Trace Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" /> smartpdfai.tech
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Security & Trust Center</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              We engineer SmartPDF AI with a defense-in-depth approach. Here is an open, verified breakdown of how we protect your document files, cryptographic sessions, and AI operations.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <span>Security Baseline: <strong>v2.6 Enterprise</strong></span>
              <span className="mx-2">•</span>
              <span>Last Audited: <strong>August 2026</strong></span>
            </div>
            <a
              href="mailto:mmridanga@gmail.com"
              className="inline-flex items-center gap-1.5 text-red-400 font-semibold hover:text-red-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Security Desk: mmridanga@gmail.com
            </a>
          </div>
        </div>

        {/* Key Security Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Client-Side WebAssembly</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard PDF operations (Merge, Split, Rotate, Delete Pages) execute locally in your web browser. Your files never leave your device.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Ephemeral RAM Buffers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When server-side processing is necessary (OCR, AI Chat), files live only in volatile server memory buffers and are purged within 1 hour or immediately upon completion.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No AI Model Training</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your document contents and chat prompts are never used to train public foundation AI models. Data transmitted to Gemini API is ephemeral.
            </p>
          </div>
        </div>

        {/* Detailed Architecture Breakdown */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-10">
          
          {/* Section 1: Data Encryption */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-red-500" />
              <h2>1. Cryptographic Protection & Encryption Standards</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <strong className="text-white text-xs block">Data In Transit (HTTPS / TLS 1.3)</strong>
                  <p className="text-slate-400 text-[11px]">
                    All network communication between your browser and SmartPDF servers is encrypted using modern TLS 1.3 with 256-bit AES cipher suites, enforcing HTTPS everywhere with HSTS headers.
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <strong className="text-white text-xs block">Data At Rest (AES-256)</strong>
                  <p className="text-slate-400 text-[11px]">
                    User profile metadata, subscription records, and Firestore databases are encrypted at rest using server-managed AES-256 cryptographic keys hosted on Google Cloud infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Identity & Authentication */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Key className="w-4 h-4 text-red-500" />
              <h2>2. Identity Management & Authentication Isolation</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                Authentication is handled through Google Cloud Firebase Authentication. SmartPDF AI never stores raw plaintext passwords on our application servers.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Password Hashing:</strong> Passwords are hashed client-side/Google-side using state-of-the-art scrypt/bcrypt algorithms with per-user salt.</li>
                <li><strong className="text-white">JWT Tokens:</strong> Authenticated sessions rely on short-lived JSON Web Tokens (JWT) verified cryptographically on every backend API route.</li>
                <li><strong className="text-white">Firestore Security Rules:</strong> All database queries are filtered with strict UID-level matching rules (<code className="text-red-400 font-mono">request.auth.uid == userId</code>), strictly preventing unauthorized cross-user data access (IDOR protection).</li>
              </ul>
            </div>
          </section>

          {/* Section 3: AI Security & Gemini API Guardrails */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-purple-400" />
              <h2>3. AI Infrastructure & Secret Key Security</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                SmartPDF AI uses a full-stack proxy architecture to ensure absolute protection of API secrets and document payloads:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Server-Side Proxy:</strong> The Google Gemini API key resides solely in secure server-side environment variables and is never transmitted or exposed to the client browser.</li>
                <li><strong className="text-white">Atomic Quota Metering:</strong> AI calls are gated by atomic server transactions to prevent quota manipulation or denial-of-service abuse.</li>
                <li><strong className="text-white">Input Validation & Sanitization:</strong> All uploaded document text is stripped of executable injection payloads and bounded to safe token context windows before LLM analysis.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Team Workspaces & Access Control */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2>4. Team Workspace Isolation & Role-Based Access (RBAC)</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                For collaborative teams, SmartPDF AI enforces strict multi-tenant tenancy boundaries:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white text-xs block mb-0.5">Workspace Owner</strong>
                  Full control, subscription management, and workspace deletion rights.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white text-xs block mb-0.5">Workspace Admin</strong>
                  Member invitations, role assignments, and team document management.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white text-xs block mb-0.5">Member</strong>
                  Document conversion, team AI chat usage, and file sharing.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white text-xs block mb-0.5">Viewer</strong>
                  Read-only access to shared team documents and reports.
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: PWA & Caching Isolation */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2>5. Progressive Web App (PWA) Cache Boundaries</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                SmartPDF AI operates an advanced Service Worker (<code className="text-emerald-400">/sw.js</code>) configured with strict caching rules:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Static Assets Only:</strong> The Service Worker only caches public static application shell files (HTML, JavaScript, CSS, icons, fonts).</li>
                <li><strong className="text-white">No Private API Caching:</strong> All calls to <code className="text-red-400">/api/*</code>, Firebase APIs, and user document endpoints bypass the Service Worker cache completely and are handled purely over live network connections.</li>
                <li><strong className="text-white">No Sensitive Payload Persistence:</strong> User documents, PDF binaries, and AI chat responses are never written to the Service Worker Cache Storage.</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Responsible Disclosure */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <h2>6. Vulnerability Reporting & Responsible Disclosure</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                We welcome independent security researchers and developers to audit and report potential vulnerabilities responsibly:
              </p>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm">Security Vulnerability Intake</h3>
                <p className="text-slate-400">
                  If you believe you have found a security vulnerability in SmartPDF AI, please notify our lead security engineer immediately:
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4 text-red-400" />
                    <span>Security Email: <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a></span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4 text-red-400" />
                    <span>Domain: <a href="https://smartpdfai.tech" className="text-red-400 hover:underline">smartpdfai.tech</a></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
