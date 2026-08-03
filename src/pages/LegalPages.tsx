import React from 'react';
import {
  ShieldCheck,
  FileText,
  Cookie,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Cpu,
  Globe,
  Mail,
  Database,
  Activity,
  Eye,
  Trash2,
  UserCheck,
  Server,
  Key,
  HardDrive
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy - SmartPDF AI"
        description="SmartPDF AI Privacy Policy. Learn how we handle document security, volatile RAM auto-deletion, Google Analytics (GA4), Microsoft Clarity, Firebase Authentication, cookies, and GDPR & CCPA rights."
        path="/privacy"
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> GDPR & CCPA Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" /> Zero Permanent File Storage
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" /> smartpdfai.tech
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              At <strong className="text-slate-200">SmartPDF AI</strong> (<a href="https://smartpdfai.tech" className="text-red-400 hover:underline">https://smartpdfai.tech</a>), we treat user privacy and document security as our top priorities. This Privacy Policy details how we collect, process, store, protect, and handle your information when you use our PDF editing tools, AI document chat, and web services.
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
              className="inline-flex items-center gap-1.5 text-red-400 font-semibold hover:text-red-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> mmridanga@gmail.com
            </a>
          </div>
        </div>

        {/* Quick Summary Highlights Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Auto RAM Purge</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Uploaded files are kept in volatile RAM and automatically purged within 1 hour or immediately upon completion.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">No Model Training</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Your uploaded document content is never used to train or fine-tune public AI models.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Analytics & UX</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Anonymized usage analytics via Google Analytics 4 (GA4) & Microsoft Clarity to improve platform stability.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">GDPR & CCPA Rights</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Full control over your account data with right to access, delete, export, or opt-out anytime.
            </p>
          </div>
        </div>

        {/* Detailed Sections Container */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10">
          
          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Info className="w-4 h-4 text-red-500" />
              <h2>1. Introduction & Scope</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                SmartPDF AI ("SmartPDF", "we", "us", or "our") operates the website located at <a href="https://smartpdfai.tech" className="text-red-400 hover:underline">https://smartpdfai.tech</a>. This Privacy Policy outlines our standards and protocols regarding the collection, processing, storage, disclosure, and protection of personal and non-personal data when you access or interact with our platform.
              </p>
              <p>
                By accessing or using SmartPDF AI, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy. If you do not agree with any part of this policy, please refrain from uploading documents or using our web application.
              </p>
            </div>
          </section>

          {/* Section 2: File Processing & Auto Deletion */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              <h2>2. Document Processing & Ephemeral RAM Auto-Deletion</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                We understand that documents uploaded to our suite (such as legal contracts, financial spreadsheets, personal IDs, and confidential business presentations) require strict privacy safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">Client-Side First Processing:</strong> For core operations (including PDF merging, splitting, page rotation, image extraction, and page reorganization), tasks run directly inside your browser using client-side WebAssembly technology. In these cases, your files never leave your local computer or mobile device.
                </li>
                <li>
                  <strong className="text-white">Server-Side Volatile RAM Buffers:</strong> For tasks requiring server processing (such as OCR text recognition, complex file conversions, or AI Document Chat), uploaded documents are loaded into volatile RAM memory buffers during active task execution.
                </li>
                <li>
                  <strong className="text-white">Automated Deletion Guarantee:</strong> Files and processed outputs are held temporarily in volatile memory and are <strong className="text-emerald-400">automatically purged within 1 hour</strong> or immediately upon session completion. We do not maintain permanent storage drives or archive backups of your uploaded documents.
                </li>
                <li>
                  <strong className="text-white">No Public AI Model Training:</strong> Your uploaded document content and text prompts sent to our AI tools are <strong className="text-emerald-400">never used to train, retrain, or improve public foundational AI models</strong>.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Data We Collect */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Database className="w-4 h-4 text-red-500" />
              <h2>3. Information We Collect</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                We collect information in three categories to deliver and improve our services:
              </p>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs">A. Information Provided Voluntarily</h3>
                <p>
                  When you register an account, sign in via OAuth, subscribe to Pro features, or contact our support team, we may collect your email address, full name, profile picture URL, billing status, and support correspondence.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs">B. Automatically Collected Technical Data</h3>
                <p>
                  When you visit our website, our servers and analytics providers automatically record standard technical data, including IP address, operating system, browser type and version, referrer URL, pages visited, date and time stamps, and error diagnostic logs.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs">C. Local Browser State</h3>
                <p>
                  We store non-sensitive application state in your browser's local storage (such as UI theme preferences, selected tools history, and workspace layout configurations). This data remains entirely on your local machine.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Google Analytics 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <h2>4. Google Analytics 4 (GA4) Usage</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                SmartPDF AI integrates <strong>Google Analytics 4</strong> (Measurement ID: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-red-400 font-mono">G-SCDQ6X3ZC3</code>) to measure website traffic, page view trends, device distribution, and tool engagement metrics.
              </p>
              <p>
                Google Analytics 4 uses cookies and device identifiers to collect anonymized interaction data. It does not record personal identity or document contents. You can opt out of Google Analytics tracking by enabling "Do Not Track" in your browser, using Google's Opt-out Browser Add-on, or declining non-essential cookies in our Cookie Consent banner.
              </p>
            </div>
          </section>

          {/* Section 5: Microsoft Clarity */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Eye className="w-4 h-4 text-red-500" />
              <h2>5. Microsoft Clarity UX Telemetry</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                We use <strong>Microsoft Clarity</strong> (Project ID: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-red-400 font-mono">xwjp8x03ar</code>) to capture anonymized visual behavior telemetry, such as aggregate heatmaps, scroll depth tracking, and anonymous session replays.
              </p>
              <p>
                Microsoft Clarity helps our engineering team spot usability friction, rage clicks, broken buttons, and rendering glitches across various mobile and desktop browsers. All text entry fields and sensitive file content are automatically masked and redacted prior to transmission. For details on Microsoft’s data handling practices, please review the <a href="https://privacy.microsoft.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Microsoft Privacy Statement</a>.
              </p>
            </div>
          </section>

          {/* Section 6: Firebase Authentication */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Key className="w-4 h-4 text-red-500" />
              <h2>6. Firebase Authentication & Account Security</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                User account authentication and secure token management are powered by <strong>Firebase Authentication</strong> (a Google Cloud service).
              </p>
              <p>
                When you sign up or log in (via email/password or Google Single Sign-On), Firebase securely manages authentication tokens, password hashes (using industry-standard bcrypt/scrypt algorithms), and profile details in Google Cloud Firestore database infrastructure complying with ISO 27001, SOC 2, and GDPR standards.
              </p>
            </div>
          </section>

          {/* Section 7: Cookies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Cookie className="w-4 h-4 text-red-500" />
              <h2>7. Cookies & Tracking Technologies</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                Cookies are small text files placed on your device to enhance navigation and remember preferences:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-white text-xs">Essential Cookies</span>
                  <p className="text-[11px] text-slate-400">
                    Required for core security, session authentication tokens, and preventing cross-site forgery.
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-white text-xs">Analytics Cookies</span>
                  <p className="text-[11px] text-slate-400">
                    Set by Google Analytics and Microsoft Clarity to track pageviews and UX performance.
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-white text-xs">Preference Cookies</span>
                  <p className="text-[11px] text-slate-400">
                    Remembers dark mode theme settings, recently used tool shortcuts, and cookie banner consent status.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Third-Party Services */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-red-500" />
              <h2>8. Third-Party Service Providers</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                We partner with trusted third-party cloud infrastructure providers who adhere to strict data security standards:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-white">Google Cloud & Firebase:</strong> Authentication, encrypted database storage, and hosting nodes.</li>
                <li><strong className="text-white">Google Analytics 4:</strong> Aggregate traffic metrics and conversion analysis.</li>
                <li><strong className="text-white">Microsoft Clarity:</strong> Visual heatmaps and session interaction analysis.</li>
                <li><strong className="text-white">Google Gemini AI API:</strong> AI document reasoning and natural language processing.</li>
                <li><strong className="text-white">Vercel:</strong> Edge network hosting and global content distribution.</li>
              </ul>
            </div>
          </section>

          {/* Section 9: GDPR Rights */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2>9. European Union GDPR Rights</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                If you reside within the European Economic Area (EEA) or the United Kingdom, you hold specific statutory rights under the General Data Protection Regulation (GDPR):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-0.5">Right to Access (Art. 15)</strong>
                  Request a copy of the personal data we hold about your account.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-0.5">Right to Rectification (Art. 16)</strong>
                  Request correction of inaccurate or incomplete personal profile details.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-0.5">Right to Erasure (Art. 17)</strong>
                  Request immediate deletion ("Right to be Forgotten") of your account and personal history records.
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-0.5">Right to Data Portability (Art. 20)</strong>
                  Export your registered user profile data in a structured, machine-readable JSON format.
                </div>
              </div>
              <p>
                To exercise any GDPR rights, please email our Data Protection team at <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a>.
              </p>
            </div>
          </section>

          {/* Section 10: CCPA Rights */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h2>10. California Privacy Rights (CCPA / CPRA)</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                California residents hold additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Right to Know:</strong> Request details on the categories and specific pieces of personal information collected.</li>
                <li><strong className="text-white">Right to Delete:</strong> Request deletion of personal information collected directly from you.</li>
                <li><strong className="text-white">No Sale of Personal Information:</strong> SmartPDF AI <strong className="text-emerald-400">DOES NOT SELL, RENT, OR TRADE</strong> your personal information or uploaded document data to third parties.</li>
                <li><strong className="text-white">Non-Discrimination:</strong> You will never receive discriminatory treatment or diminished service quality for exercising your CCPA privacy rights.</li>
              </ul>
            </div>
          </section>

          {/* Section 11: Security & Encryption */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-red-500" />
              <h2>11. Data Security & Encryption Standards</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                We enforce military-grade security controls to safeguard all data traversing our platform:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-white">Transit Encryption:</strong> All browser-to-server network traffic is encrypted via 256-bit SSL/TLS protocol over HTTPS.</li>
                <li><strong className="text-white">At-Rest Encryption:</strong> Database records and authentication tokens are encrypted using AES-256 server-side keys.</li>
                <li><strong className="text-white">Infrastructure Isolation:</strong> Server nodes operate within sandboxed container environments isolated from unauthorized external access.</li>
              </ul>
            </div>
          </section>

          {/* Section 12: Children's Privacy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2>12. Children's Privacy</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <p>
                SmartPDF AI is intended for general commercial, enterprise, and productivity usage. We do not knowingly collect or solicit personal information from children under 13 years of age (or under 16 in the European Union). If we learn that we have inadvertently collected personal data from a minor without parental consent, we will immediately purge that information.
              </p>
            </div>
          </section>

          {/* Section 13: Policy Updates & Contact Us */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Mail className="w-4 h-4 text-red-500" />
              <h2>13. Contact Us & Policy Updates</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                We may update this Privacy Policy periodically to reflect technological changes, regulatory requirements, or platform updates. Any modifications will be posted on this page with an updated "Last Updated" date.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm">Have Privacy Questions or Data Requests?</h3>
                <p className="text-slate-400">
                  For any privacy inquiries, GDPR/CCPA data access requests, or account deletion assistance, please contact our dedicated Privacy Officer:
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4 text-red-400" />
                    <span>Email: <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a></span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4 text-red-400" />
                    <span>Website: <a href="https://smartpdfai.tech" className="text-red-400 hover:underline">https://smartpdfai.tech</a></span>
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

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Terms of Service - SmartPDF AI"
        description="SmartPDF commercial SaaS terms of service and acceptable usage guidelines."
      />
      <div className="max-w-4xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" /> User Agreement
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: August 1, 2026</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">1. Service Acceptance</h2>
            <p>
              By accessing or using SmartPDF tools, AI document processing services, or team workspaces, you agree to be bound by these commercial Terms of Service and all applicable federal and international laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">2. Permitted Use & Content Restrictions</h2>
            <p>
              You agree not to upload malware, copyrighted media without authorization, or illegal material. SmartPDF reserves the right to terminate accounts that attempt automated abuse or denial-of-service vector exploitation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">3. Commercial Subscription & SLA</h2>
            <p>
              Pro and Enterprise subscriptions are billed according to chosen monthly or annual billing periods. SmartPDF guarantees a 99.9% uptime Service Level Agreement (SLA) for paid workspace tiers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const CookiesPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Cookie Policy - SmartPDF AI"
        description="Overview of cookies, local storage session keys, and browser tracking used on SmartPDF."
      />
      <div className="max-w-4xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Cookie className="w-3.5 h-3.5" /> Cookie Usage
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: August 1, 2026</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">1. What Are Cookies</h2>
            <p>
              Cookies are small data files stored on your device that allow SmartPDF to maintain session authentication, remember file conversion preferences, and collect anonymous system performance telemetry.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">2. Essential Cookies</h2>
            <p>
              These cookies are strictly required for core security features, authentication tokens, and keeping temporary batch jobs synchronized.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">3. Analytics & Performance Cookies</h2>
            <p>
              We utilize Google Analytics and Microsoft Clarity to track conversion speeds, rage click patterns, and error occurrences to continuously refine platform usability.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const Disclaimer: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Disclaimer - SmartPDF AI"
        description="Legal disclaimer regarding AI output accuracy, document formatting, and password unlocking responsibility."
      />
      <div className="max-w-4xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Legal Notice
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Disclaimer</h1>
          <p className="text-xs text-slate-400">Effective Date: August 1, 2026</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">1. AI Model Outputs</h2>
            <p>
              AI-generated responses from our PDF Chat and Assistant tools are generated via LLMs. While highly accurate, users should independently verify critical financial, legal, or medical data contained in summaries before taking formal action.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">2. PDF Password Removal Responsibility</h2>
            <p>
              The Unlock PDF tool is intended solely for documents to which you possess rightful ownership or authorized permission. SmartPDF disclaims liability for unauthorized password removal or copyright infringement.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="About Us - SmartPDF AI Platform"
        description="Learn about the engineering mission behind SmartPDF - modern, secure, AI-native PDF tools."
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <Info className="w-3.5 h-3.5" /> Company Mission
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Reimagining Documents with AI</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            SmartPDF was created to combine lightning-fast WebAssembly PDF conversion utilities with Gemini AI document intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Client-Side Speed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merging, splitting, and page rotation happen inside your browser using WebAssembly for instant processing.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Zero-Trace Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ephemeral RAM purge ensures your sensitive business documents are never leaked or stored permanently.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Global Workspace Tiers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for individual creators, enterprise legal teams, and cloud collaborative teams around the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: 'General Support', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Contact Us - SmartPDF AI Support & Enterprise Sales"
        description="Get in touch with SmartPDF customer support, report bugs, or inquire about Enterprise SLA plans."
      />
      <div className="max-w-3xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" /> 24/7 Global Customer Support
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Contact Us</h1>
          <p className="text-xs text-slate-400">Have questions or feedback? Our team responds within 2 business hours.</p>
        </div>

        {submitted ? (
          <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Thank you for reaching out!</h3>
            <p className="text-xs text-slate-300">Your message has been logged. A support specialist will contact you shortly at {formData.email}.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Category</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="General Support">General Technical Support</option>
                <option value="Enterprise Sales">Enterprise License & Billing</option>
                <option value="Bug Report">Report a Feature Bug</option>
                <option value="Privacy Inquiry">Privacy or Security Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe how we can assist you..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
            >
              Submit Support Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
