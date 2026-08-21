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
  HardDrive,
  Scale,
  Ban,
  HelpCircle,
  Sparkles,
  Gavel,
  Clock,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Headphones,
  Copy,
  Check
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
                You may also exercise your data portability and erasure rights automatically at any time directly through your <a href="/settings" className="text-red-400 hover:underline">Platform Settings &rarr; Data Rights</a> panel, or email our Data Protection team at <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a>.
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
        title="Terms and Conditions - SmartPDF AI"
        description="SmartPDF AI Terms and Conditions. Comprehensive user agreement, user responsibilities, acceptable use policy, AI content disclaimer, file processing policy, limitation of liability, and governing law."
        path="/terms"
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <Scale className="w-3.5 h-3.5" /> User Agreement
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <FileText className="w-3.5 h-3.5" /> Terms & Conditions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" /> smartpdfai.tech
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms & Conditions</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Welcome to <strong className="text-slate-200">SmartPDF AI</strong> (<a href="https://smartpdfai.tech" className="text-red-400 hover:underline">https://smartpdfai.tech</a>). These Terms & Conditions govern your access to and use of our online PDF conversion utilities, AI document chat assistant, team workspaces, and web services.
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

        {/* High-Level Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Binding Agreement</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              By using our website, you accept these terms in full and agree to comply with all rules.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Ban className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Acceptable Use</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Strictly prohibits uploading malware, unauthorized copyrighted media, or automated abuse.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">AI Disclaimer</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              AI summaries are for assistance only. Users should verify critical legal/financial outputs.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Zero Disk Storage</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Files are processed in volatile RAM buffers and automatically purged within 1 hour.
            </p>
          </div>
        </div>

        {/* Detailed Terms Container */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10">
          
          {/* Section 1: Acceptance of Terms */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                By accessing, browsing, creating an account, or utilizing any services provided at <a href="https://smartpdfai.tech" className="text-red-400 hover:underline">https://smartpdfai.tech</a>, you confirm that you have read, understood, and agreed to be legally bound by these Terms & Conditions ("Terms"), as well as our <a href="/privacy" className="text-red-400 hover:underline">Privacy Policy</a> and <a href="/cookies" className="text-red-400 hover:underline">Cookie Policy</a>.
              </p>
              <p>
                If you do not agree to these Terms, you must immediately discontinue using our website and services. You represent that you are at least 18 years old (or the legal age of majority in your jurisdiction) and possess the legal capacity to enter into binding agreements.
              </p>
            </div>
          </section>

          {/* Section 2: Description of Services */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-red-500" />
              <h2>2. Description of Services</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                SmartPDF AI provides a web-based productivity platform featuring:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">PDF Document Utilities:</strong> Merging, splitting, compressing, rotating, watermarking, page numbering, unlocking, and file type conversions (PDF to Word, Word to PDF, Image to PDF, PDF to Image).</li>
                <li><strong className="text-white">AI Document Chat & OCR:</strong> Natural language document search, AI PDF summarization, and OCR text extraction powered by Gemini AI and computer vision models.</li>
                <li><strong className="text-white">Client & Server Processing Tiers:</strong> Client-side browser processing via WebAssembly alongside server-side volatile RAM execution.</li>
                <li><strong className="text-white">Team Workspaces & Cloud Storage:</strong> Collaborative document management and cloud workspace tools for Pro and Enterprise subscribers.</li>
              </ul>
              <p>
                We reserve the right to modify, update, enhance, or discontinue any feature of the platform at any time without prior notice.
              </p>
            </div>
          </section>

          {/* Section 3: User Responsibilities */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <UserCheck className="w-4 h-4 text-red-500" />
              <h2>3. User Account & Responsibilities</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                To access premium workspace features, you may register an account using Firebase Authentication or OAuth providers. You agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Provide accurate, current, and complete account information during registration.</li>
                <li>Maintain the confidentiality of your login credentials and authentication tokens.</li>
                <li>Accept full responsibility for all activities that occur under your registered user account.</li>
                <li>Promptly notify us at <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a> if you discover any unauthorized account access or security breach.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Acceptable Use Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Ban className="w-4 h-4 text-red-500" />
              <h2>4. Acceptable Use Policy (AUP)</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                You agree to use SmartPDF AI strictly for lawful productivity purposes. You are <strong className="text-red-400">STRICTLY PROHIBITED</strong> from:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white text-xs block">Malware & Attacks</strong>
                  <p className="text-[11px] text-slate-400">
                    Uploading files containing computer viruses, trojans, ransomware, spyware, or malicious payloads.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white text-xs block">Automated Abuse</strong>
                  <p className="text-[11px] text-slate-400">
                    Executing automated scrapers, bots, or denial-of-service (DDoS) vectors intended to overload our infrastructure.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white text-xs block">Unauthorized Password Unlocking</strong>
                  <p className="text-[11px] text-slate-400">
                    Using our PDF Unlock tool on documents for which you do not possess rightful ownership or explicit legal authorization.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white text-xs block">Reverse Engineering</strong>
                  <p className="text-[11px] text-slate-400">
                    Attempting to decompile, reverse engineer, or extract proprietary WebAssembly binaries and server code.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <h2>5. Intellectual Property Rights</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong className="text-white">SmartPDF AI Ownership:</strong> All intellectual property rights in the SmartPDF AI platform—including software code, WebAssembly modules, algorithms, UI designs, logos, graphics, brand names, and documentation—are the exclusive property of SmartPDF AI and its licensors.
              </p>
              <p>
                <strong className="text-white">Your Content Ownership:</strong> You retain full, unencumbered ownership, title, and copyright over all documents, text, images, and files you upload to or process using SmartPDF AI. We claim no ownership over your files or document outputs.
              </p>
            </div>
          </section>

          {/* Section 6: AI-Generated Content Disclaimer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2>6. AI-Generated Content Disclaimer</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                SmartPDF AI integrates advanced generative AI models (such as Google Gemini AI) to summarize documents, extract insights, and answer questions regarding uploaded PDFs:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Informational Purpose Only:</strong> AI chat outputs, document summaries, citations, and translations are generated automatically and provided for general informational and assistance purposes.</li>
                <li><strong className="text-white">No Professional Advice:</strong> AI answers do not constitute formal legal, financial, medical, accounting, or professional advice.</li>
                <li><strong className="text-white">User Verification Duty:</strong> Large language models may occasionally produce incomplete, inaccurate, or hallucinated responses. You are responsible for independently verifying critical data before relying on AI outputs for business or legal decisions.</li>
              </ul>
            </div>
          </section>

          {/* Section 7: File Upload & Processing Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              <h2>7. File Upload & Ephemeral RAM Processing Policy</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                We maintain strict technical protocols regarding user document privacy:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Client-side tasks (e.g., merge, split, rotate) run in your browser session without uploading files to our servers whenever possible.</li>
                <li>Server-side processing tasks (e.g., OCR, AI Chat) load files into volatile RAM memory buffers and <strong className="text-emerald-400">automatically purge files within 1 hour</strong> or immediately after processing completes.</li>
                <li>We do not store permanent copies of processed documents on long-term disk drives.</li>
                <li>Your uploaded document content is <strong className="text-emerald-400">never used to train public foundational AI models</strong>.</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Commercial Subscriptions & Billing */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-red-500" />
              <h2>8. Commercial Subscriptions, Billing & Cancellation</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                SmartPDF AI offers free usage tiers alongside paid Pro and Enterprise subscriptions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong className="text-white">Billing Cycles:</strong> Paid subscriptions are billed in advance on a monthly or annual recurring basis.</li>
                <li><strong className="text-white">Payment Processing:</strong> Transactions are handled by PCI-DSS compliant third-party payment gateways. SmartPDF AI does not store raw credit card numbers.</li>
                <li><strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time via your Account Settings. Cancellation takes effect at the end of the current paid billing period.</li>
                <li><strong className="text-white">Refund Policy:</strong> Payments are non-refundable, except where required by mandatory consumer protection law.</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Limitation of Liability */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2>9. Limitation of Liability & Warranty Disclaimer</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                THE WEBSITE AND SERVICES ARE PROVIDED ON AN <strong className="text-white">"AS IS"</strong> AND <strong className="text-white">"AS AVAILABLE"</strong> BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SMARTPDF AI, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
              </p>
              <p>
                IN NO EVENT SHALL SMARTPDF AI'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS EXCEED THE GREATER OF $100 USD OR THE AMOUNT PAID BY YOU TO SMARTPDF AI IN THE PRECEDING TWELVE (12) MONTHS.
              </p>
            </div>
          </section>

          {/* Section 10: Account Termination */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Ban className="w-4 h-4 text-red-500" />
              <h2>10. Account Termination & Service Suspension</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                We reserve the right to suspend or terminate your account access immediately, without prior notice or liability, if you breach these Terms, engage in illegal activity, attempt to exploit platform security vulnerabilities, or cause harm to our system infrastructure or other users.
              </p>
              <p>
                Upon termination, your right to access premium features will cease immediately.
              </p>
            </div>
          </section>

          {/* Section 11: Governing Law */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base border-b border-slate-800 pb-2">
              <Gavel className="w-4 h-4 text-red-500" />
              <h2>11. Governing Law & Dispute Resolution</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without giving effect to any choice or conflict of law provisions.
              </p>
              <p>
                In the event of any legal dispute or claim arising under these Terms, you agree to first contact us at <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a> to attempt an informal, good-faith resolution prior to initiating formal legal proceedings.
              </p>
            </div>
          </section>

          {/* Section 12: Contact Us & Inquiries */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Mail className="w-4 h-4 text-red-500" />
              <h2>12. Contact Information & Legal Inquiries</h2>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                If you have any questions, feedback, or legal inquiries regarding these Terms & Conditions, please contact our support and legal department:
              </p>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm">SmartPDF AI Legal Support</h3>
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
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: 'General Technical Support',
    message: ''
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('mmridanga@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      question: "What is your expected response time for support inquiries?",
      answer: "Our support team actively reviews tickets and responds within 24 to 48 hours (Monday through Friday). Enterprise SLA subscribers receive priority handling within 2 business hours."
    },
    {
      question: "How are my uploaded PDF files processed and protected?",
      answer: "Security and privacy are built into our architecture. Client-side tools (like merge, split, rotate) operate directly in your browser session. For server-side tasks (OCR, AI PDF Chat), files are held in volatile RAM buffers and automatically purged within 1 hour. We never store files permanently or train AI models on your document content."
    },
    {
      question: "Where can I review your legal policies and compliance details?",
      answer: "You can view our complete Privacy Policy, Terms & Conditions, and Cookie Policy directly on our website. All services comply with GDPR and CCPA privacy standards."
    },
    {
      question: "How can I manage or cancel my Pro account subscription?",
      answer: "You can manage your plan, view invoices, or cancel recurring billing anytime from your Account Settings. You can also reach out directly to mmridanga@gmail.com for billing support."
    },
    {
      question: "Do you offer team seats or custom Enterprise licensing?",
      answer: "Yes! We offer custom team workspace licenses, higher document rate limits, and dedicated support SLAs for businesses and legal teams. Please select 'Enterprise License & Billing' in the form above."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Contact Us - SmartPDF AI Support & Inquiries"
        description="Get in touch with the SmartPDF AI customer support team. Send inquiries, bug reports, or feature requests with guaranteed 24–48 hour response time."
        path="/contact"
      />

      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <Headphones className="w-3.5 h-3.5" /> 24/7 Global Help & Support Center
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">SmartPDF AI</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Have questions about our PDF conversion suite, Gemini AI document analysis, billing, or enterprise team workspaces? Our technical support team is ready to assist you.
          </p>
        </div>

        {/* Top Info Grid: Response Time, Direct Email, Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Direct Email Card */}
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Direct Contact</span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-400">Support Email</h3>
              <p className="text-sm font-bold text-white mt-0.5 break-all">mmridanga@gmail.com</p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleCopyEmail}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copiedEmail ? 'Email Copied!' : 'Copy Email'}
              </button>
              <a
                href="mailto:mmridanga@gmail.com"
                className="py-2 px-3 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-xs font-semibold text-red-400 flex items-center justify-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Mail
              </a>
            </div>
          </div>

          {/* Guaranteed Response Time Card */}
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Queue Active
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-400">Guaranteed Response Window</h3>
              <p className="text-xl font-black text-white mt-0.5">24 – 48 Hours</p>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Tickets are processed in order of arrival. Enterprise customers receive priority 2-hour response times.
            </p>
          </div>

          {/* Useful Navigation Links Card */}
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Helpful Pages</span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-400">Legal & Information</h3>
              <p className="text-xs font-bold text-white mt-0.5">Quick Platform Policies</p>
            </div>
            <div className="flex flex-col gap-1.5 pt-1 text-xs">
              <a href="/about" className="inline-flex items-center justify-between text-slate-300 hover:text-red-400 transition-colors">
                <span>• About Us</span> <ArrowRight className="w-3 h-3 text-slate-500" />
              </a>
              <a href="/privacy" className="inline-flex items-center justify-between text-slate-300 hover:text-red-400 transition-colors">
                <span>• Privacy Policy</span> <ArrowRight className="w-3 h-3 text-slate-500" />
              </a>
              <a href="/terms" className="inline-flex items-center justify-between text-slate-300 hover:text-red-400 transition-colors">
                <span>• Terms & Conditions</span> <ArrowRight className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Main Contact Form Container */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="space-y-2 border-b border-slate-800/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" /> Send Us a Message
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill out the support form below and our team will get back to you at <strong className="text-slate-300">mmridanga@gmail.com</strong>.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
              Avg. Wait: <strong className="text-white">&lt; 24h</strong>
            </div>
          </div>

          {submitted ? (
            <div className="p-8 sm:p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Your Message Has Been Delivered!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Our support team has logged your ticket and will follow up with you at <strong className="text-emerald-400">{formData.email}</strong> within 24–48 hours.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Technical Support', message: '' });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all cursor-pointer inline-flex items-center gap-2"
              >
                Send Another Inquiry <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. jane@company.com"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Subject Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition-all cursor-pointer"
                >
                  <option value="General Technical Support">General Technical Support</option>
                  <option value="Bug Report / Feature Glitch">Bug Report / Feature Glitch</option>
                  <option value="Enterprise License & Billing">Enterprise License & Billing</option>
                  <option value="Billing & Refund Request">Billing & Refund Request</option>
                  <option value="Privacy or Security Inquiry">Privacy or Security Inquiry</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Your Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your request or question in detail..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 resize-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-[11px] text-slate-400">
                  By submitting this form, you agree to our <a href="/terms" className="text-red-400 hover:underline">Terms</a> and <a href="/privacy" className="text-red-400 hover:underline">Privacy Policy</a>.
                </p>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FAQ Section */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="space-y-1 border-b border-slate-800/80 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Need Quick Answers?</h2>
            <p className="text-xs text-slate-400">
              Check out answers to common questions regarding support response times, security, and subscriptions.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-800/80 rounded-2xl bg-slate-900/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Quick Navigation Links Bar */}
        <div className="bg-[#121215] border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <strong className="text-white">SmartPDF AI Platform</strong> — Enterprise Productivity & AI Suite
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <a href="/about" className="hover:text-red-400 transition-colors">About Us</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-red-400 transition-colors">Terms & Conditions</a>
            <span>•</span>
            <a href="mailto:mmridanga@gmail.com" className="text-red-400 hover:underline">mmridanga@gmail.com</a>
          </div>
        </div>

      </div>
    </div>
  );
};
