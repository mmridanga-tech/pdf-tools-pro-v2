import React from 'react';
import { ShieldCheck, FileText, Cookie, AlertTriangle, Info, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy - SmartPDF AI"
        description="SmartPDF privacy policy detailing file memory purge, data protection, and GDPR compliance."
      />
      <div className="max-w-4xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Privacy & Security Commitment
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: August 1, 2026 | Version 2.4</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> 1. Ephemeral Memory File Processing
            </h2>
            <p>
              SmartPDF operates under an automated <strong>ephemeral memory architecture</strong>. Documents uploaded for PDF merging, compression, OCR, conversion, or AI analysis are held strictly in temporary RAM during execution. Files are automatically purged from active RAM buffers within <strong>1 hour</strong> or immediately upon session destruction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> 2. AI Chat & Document Analysis Privacy
            </h2>
            <p>
              When using our AI PDF Chat or AI Document Assistant powered by Gemini AI, document text chunks are processed in secure server memory solely for generating answer citations. Your uploaded document content is <strong>never used to train public foundational models</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> 3. Data Encryption Standards
            </h2>
            <p>
              All network transmissions between your web browser and SmartPDF nodes utilize 256-bit SSL/TLS encryption. Data at rest (if retained in cloud sync by Pro users) uses AES-256 server-side encryption with user-isolated key access controls.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> 4. GDPR & CCPA Compliance
            </h2>
            <p>
              Under European Union GDPR and California CCPA regulations, you hold full rights to inspect, export, or request the immediate deletion of your workspace data and history log records by navigating to Workspace Settings or contacting privacy@smartpdf.ai.
            </p>
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
