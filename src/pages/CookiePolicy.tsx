import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cookie,
  ShieldCheck,
  HardDrive,
  Database,
  Layers,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  Mail,
  Globe,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Cookie Policy & Local Storage Disclosures - SmartPDF AI"
        description="Comprehensive details on cookies, localStorage, IndexedDB, and Cache Storage technologies used by SmartPDF AI to provide secure PDF conversion and AI tools."
        path="/cookies"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">Cookie Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Cookie className="w-3.5 h-3.5" /> Storage Transparency
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> GDPR & ePrivacy Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" /> smartpdfai.tech
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Cookie Policy</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              This Cookie Policy explains how <strong className="text-slate-200">SmartPDF AI</strong> utilizes browser cookies, client-side Local Storage, IndexedDB, and Cache Storage to deliver fast, secure document utilities and measure platform performance.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <span>Effective Date: <strong>August 3, 2026</strong></span>
              <span className="mx-2">•</span>
              <span>Last Updated: <strong>August 3, 2026</strong></span>
            </div>
            <a
              href="mailto:mmridanga@gmail.com"
              className="inline-flex items-center gap-1.5 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> mmridanga@gmail.com
            </a>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cookie className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">HTTP Cookies</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Small text tokens used by analytics providers (Google Analytics 4 & Microsoft Clarity) to measure traffic.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Local Storage</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Client-side key-value pairs that store your dark/light theme, recent file history, and banner dismissals.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">IndexedDB</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Used by Firebase Auth SDK for offline session cache to keep you logged in safely across tabs.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Cache Storage</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              PWA Service Worker caches HTML/JS/CSS assets (<code className="text-emerald-400">smartpdf-ai-static-v2</code>) for instant loading.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-10">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Cookie className="w-4 h-4 text-amber-400" />
              <h2>1. What Are Cookies and Web Storage Technologies?</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                When you access SmartPDF AI, our web application interacts with your browser's storage mechanisms. These technologies are essential to keep your account session secure, prevent cross-site request forgery, remember interface preferences, and analyze anonymized UX traffic.
              </p>
              <p>
                Unlike traditional advertising websites, <strong className="text-white">SmartPDF AI does NOT use third-party advertising cookies, cross-site tracker pixels, or data brokerage trackers</strong>.
              </p>
            </div>
          </section>

          {/* Section 2: Detailed Table of Storage Items */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <h2>2. Storage Inventory & Purpose Breakdown</h2>
            </div>
            <div className="text-xs text-slate-300 space-y-3">
              <p>
                The following table provides a complete, transparent inventory of every storage item set by SmartPDF AI:
              </p>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-bold">Storage Type</th>
                      <th className="p-3 font-bold">Key / Cookie Name</th>
                      <th className="p-3 font-bold">Category</th>
                      <th className="p-3 font-bold">Purpose</th>
                      <th className="p-3 font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-emerald-400">LocalStorage</td>
                      <td className="p-3 font-mono text-white">smartpdf_theme</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">Preferences</span></td>
                      <td className="p-3">Stores your selected color mode (Dark, Light, System).</td>
                      <td className="p-3 text-slate-400">Persistent</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-emerald-400">LocalStorage</td>
                      <td className="p-3 font-mono text-white">smartpdf_recent_files</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">Preferences</span></td>
                      <td className="p-3">Maintains client-side history of converted file names and timestamps.</td>
                      <td className="p-3 text-slate-400">Persistent</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-emerald-400">LocalStorage</td>
                      <td className="p-3 font-mono text-white">cookie_consent_status</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 text-[10px] font-bold">Essential</span></td>
                      <td className="p-3">Remembers your cookie banner preference and acceptance.</td>
                      <td className="p-3 text-slate-400">1 Year</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-purple-400">IndexedDB</td>
                      <td className="p-3 font-mono text-white">firebaseLocalStorageDb</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 text-[10px] font-bold">Essential</span></td>
                      <td className="p-3">Encrypted Firebase Auth session tokens for secure user login state.</td>
                      <td className="p-3 text-slate-400">Session / Auth</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-blue-400">CacheStorage</td>
                      <td className="p-3 font-mono text-white">smartpdf-ai-static-v2</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 text-[10px] font-bold">Performance</span></td>
                      <td className="p-3">Service Worker offline application shell (HTML, CSS, JS, icons).</td>
                      <td className="p-3 text-slate-400">Until version update</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-amber-400">HTTP Cookie</td>
                      <td className="p-3 font-mono text-white">_ga, _ga_SCDQ6X3ZC3</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">Analytics</span></td>
                      <td className="p-3">Google Analytics 4 anonymous session distinction and pageview counters.</td>
                      <td className="p-3 text-slate-400">2 Years</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-amber-400">HTTP Cookie</td>
                      <td className="p-3 font-mono text-white">_clck, _clsk, MUID</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">Analytics</span></td>
                      <td className="p-3">Microsoft Clarity anonymized heatmap and scroll-depth telemetry.</td>
                      <td className="p-3 text-slate-400">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Classification Details */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2>3. Cookie Classifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="font-bold text-white text-sm">Strictly Necessary</span>
                <p className="text-slate-400 leading-relaxed">
                  These storage items are strictly required for security, user authentication, and page routing. They cannot be disabled without preventing the platform from functioning.
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="font-bold text-white text-sm">Functional Preferences</span>
                <p className="text-slate-400 leading-relaxed">
                  These store your UI configuration, theme choices, and recent tool logs in your browser's private localStorage so you do not have to reconfigure them each visit.
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="font-bold text-white text-sm">Analytics & UX Telemetry</span>
                <p className="text-slate-400 leading-relaxed">
                  These cookies help us detect rage-clicks, broken buttons, slow load times, and high-traffic pages so our engineering team can improve platform performance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Managing and Disabling Cookies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <h2>4. How to Manage or Clear Cookies in Your Browser</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                You have the full right to accept, reject, or clear cookies and local storage keys at any time through your web browser settings:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies &rarr; See all site data and permissions.</li>
                <li><strong className="text-white">Mozilla Firefox:</strong> Settings &rarr; Privacy & Security &rarr; Cookies and Site Data &rarr; Clear Data.</li>
                <li><strong className="text-white">Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data.</li>
                <li><strong className="text-white">Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies and site data.</li>
              </ul>
              <p className="text-slate-400">
                Note: Disabling strictly necessary session tokens in IndexedDB will prevent you from staying logged into your SmartPDF account across browser sessions.
              </p>
            </div>
          </section>

          {/* Section 5: Policy Updates & Contact */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Mail className="w-4 h-4 text-amber-400" />
              <h2>5. Contact Us Regarding Cookie Settings</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                If you have questions about our use of cookies, Local Storage, or browser telemetry, please contact:
              </p>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm">SmartPDF AI Privacy & Compliance Desk</h3>
                <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Email: <a href="mailto:mmridanga@gmail.com" className="text-amber-400 hover:underline">mmridanga@gmail.com</a></span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Website: <a href="https://smartpdfai.tech" className="text-amber-400 hover:underline">https://smartpdfai.tech</a></span>
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
