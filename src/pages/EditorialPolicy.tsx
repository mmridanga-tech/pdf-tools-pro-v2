import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  RefreshCcw,
  UserCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  Award,
  Lock,
  Search,
  Scale,
  Shield,
  FileText,
  Mail,
  User,
  Zap,
  Globe,
  HelpCircle
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const EditorialPolicy: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const canonicalUrl = 'https://smartpdfai.tech/editorial-policy';

  // Rich JSON-LD Structured Data for E-E-A-T
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: 'Editorial Policy & Integrity Standards - SmartPDF AI',
        description:
          'Learn about SmartPDF AI editorial policy, fact-checking rigor, human review standards, content accuracy, and commitment to original technical journalism.',
        publisher: {
          '@type': 'Organization',
          name: 'SmartPDF AI',
          url: 'https://smartpdfai.tech',
          logo: 'https://smartpdfai.tech/logo.png',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://smartpdfai.tech',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Editorial Policy',
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const pillars = [
    {
      id: 'accuracy',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: 'Factual Accuracy & Standards',
      description:
        'Every guide, benchmark, and technical article is rigorously validated against official PDF specifications (ISO 32000-2) and verified on production web software.',
      details: [
        'Multi-stage verification against technical documentation and W3C web standards.',
        'Zero tolerance for unverified benchmarks or misleading software claims.',
        'Direct testing of client-side WebAssembly and PDF rendering engines prior to writing.',
      ],
    },
    {
      id: 'fact-checking',
      icon: <Search className="w-6 h-6 text-blue-400" />,
      title: 'Independent Fact-Checking',
      description:
        'Our dedicated technical auditors re-run every step in our tutorials and cross-check security claims to guarantee 100% precision.',
      details: [
        'Dedicated peer testing by experienced document software engineers.',
        'Verification of security assertions, such as client-side local memory processing.',
        'Independent comparison with industry standard tooling and PDF libraries.',
      ],
    },
    {
      id: 'regular-updates',
      icon: <RefreshCcw className="w-6 h-6 text-amber-400" />,
      title: 'Continuous Content Audits',
      description:
        'We continuously monitor changes in web technologies, browser updates, and PDF standards to keep every article and tool guide accurate and current.',
      details: [
        'Quarterly audits of all published articles, tutorials, and tool documentations.',
        'Immediate revisions whenever browser APIs (e.g. WebAssembly, PDF.js) change.',
        'Clear versioning and updated timestamps on all technical content.',
      ],
    },
    {
      id: 'human-review',
      icon: <UserCheck className="w-6 h-6 text-purple-400" />,
      title: '100% Human Expert Oversight',
      description:
        'All published material is researched, written, structured, and thoroughly reviewed by human subject-matter experts and senior software engineers.',
      details: [
        'No unreviewed automated content or raw machine-generated output.',
        'Human editors refine tone, verify citations, and enforce clarity.',
        'Lead technical oversight provided by qualified software engineers.',
      ],
    },
    {
      id: 'original-content',
      icon: <FileCheck className="w-6 h-6 text-red-400" />,
      title: 'Plagiarism-Free Originality',
      description:
        'We produce authentic, original technical guides based on hands-on software development, real performance metrics, and genuine user workflows.',
      details: [
        'Proprietary performance benchmarks and original code demonstrations.',
        'Strict plagiarism checks prior to publication.',
        'Clear distinction between editorial advice and promotional information.',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Who writes and reviews content on SmartPDF AI?',
      answer:
        'Content on SmartPDF AI is authored and reviewed by experienced software engineers, document management specialists, and cybersecurity advocates led by Chief Editor and Lead Engineer Mridanga Mondal. Every piece undergoes peer technical review before publication.',
    },
    {
      question: 'How often is technical content updated?',
      answer:
        'We perform quarterly content audits and update technical guides immediately whenever there are updates to browser capabilities, PDF/A ISO standards, or our client-side processing architecture.',
    },
    {
      question: 'How do you ensure impartiality in software comparisons?',
      answer:
        'Our software reviews and tool benchmarks rely on reproducible objective metrics—such as processing speed, memory efficiency, output file size, and security models—measured in controlled environments without third-party influence.',
    },
    {
      question: 'How can readers report an inaccuracy or request an update?',
      answer:
        'We welcome reader feedback and corrections. If you spot a technical error or outdated step in any guide, please contact our editorial team directly at mmridanga@gmail.com. Corrections are reviewed and published within 24–48 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Editorial Policy & Standards - SmartPDF AI"
        description="SmartPDF AI Editorial Policy. Learn how we ensure technical accuracy, independent fact-checking, regular updates, human expert review, and original content across all our PDF tools and articles."
        path="/editorial-policy"
        jsonLdSchema={jsonLdSchema}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-bold">Editorial Policy</span>
        </nav>

        {/* Hero Header Banner */}
        <section className="bg-[#121215] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden" id="editorial-hero">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5" /> E-E-A-T Certified Standards
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Fact-Checked
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide">
              <UserCheck className="w-3.5 h-3.5" /> Human Reviewed
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Editorial Policy & Editorial Integrity
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              At <strong className="text-white">SmartPDF AI</strong>, we hold our content to the highest standards of technical precision, transparency, and journalistic ethics. Whether you are reading a guide on PDF compression algorithms or evaluating client-side encryption protocols, our goal is to provide accurate, reliable, and trustworthy information.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Effective Date: <strong>August 3, 2026</strong></span>
              <span className="mx-1">•</span>
              <span>Updated: <strong>August 3, 2026</strong></span>
            </div>
            <Link
              to="/author/mridanga-mondal"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-red-400 transition-colors font-semibold"
            >
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>Lead Editor: Mridanga Mondal</span>
            </Link>
          </div>
        </section>

        {/* Quick E-E-A-T Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="editorial-highlights">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Accuracy First</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every technical statement is verified against official PDF ISO specifications and browser standards.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Peer Fact-Checking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Senior software engineers double-test steps in real browser environments before publication.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Quarterly Audits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All guides and articles undergo regular re-verification to eliminate stale information.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Human Expert Oversight</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              100% human-edited and approved content with zero unverified automated output.
            </p>
          </div>
        </section>

        {/* Five Core Pillars of Editorial Quality */}
        <section className="space-y-8" id="editorial-pillars">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Our Guiding Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">The 5 Pillars of Our Editorial Policy</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              These mandatory guidelines define how our editorial staff, software contributors, and technical reviewers produce and maintain content on SmartPDF AI.
            </p>
          </div>

          <div className="space-y-6">
            {pillars.map((pillar, idx) => (
              <div
                key={pillar.id}
                className="bg-[#121215] border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-red-500/30 transition-colors shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Pillar 0{idx + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{pillar.title}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>

                <div className="pt-2">
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                    {pillar.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Guidelines Section */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8" id="detailed-editorial-standards">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-400" />
              <span>Editorial Independence & Corrections Policy</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              SmartPDF AI operates with complete editorial independence. Advertisers, partners, or third-party vendors do not have input into our editorial decisions, testing methodologies, or tool reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Editorial Independence Guarantee</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never accept monetary payment or gifts in exchange for favorable reviews, higher ratings, or biased comparisons. Our recommendations are driven purely by benchmark metrics, user security, and client-side performance.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-amber-400" />
                <span>Prompt Corrections Protocol</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a factual or technical error is identified in an article or guide, we correct it immediately and provide a transparent revision note explaining what was updated and why.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-linking Policy Navigation Hub */}
        <section className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400" />
                <span>Explore Related Governance Policies</span>
              </h2>
              <p className="text-xs text-slate-400">Learn how we evaluate tools and use AI ethically.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/review-process"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>Our Review Process</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              </Link>
              <Link
                to="/ai-content-policy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>AI Content Policy</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <Link to="/about" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">About SmartPDF AI</span>
              <span className="text-[10px] text-slate-400">Our mission & team</span>
            </Link>
            <Link to="/author/mridanga-mondal" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Editorial Director</span>
              <span className="text-[10px] text-slate-400">Mridanga Mondal</span>
            </Link>
            <Link to="/privacy" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Privacy Policy</span>
              <span className="text-[10px] text-slate-400">RAM security & data</span>
            </Link>
            <Link to="/contact" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Contact Editors</span>
              <span className="text-[10px] text-slate-400">Report errors & feedback</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6" id="editorial-faqs">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Editorial Policy FAQs</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Tools Quick Access Footer Bar */}
        <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Test Our Client-Side PDF Tools
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link to="/merge-pdf-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white transition-colors">
              Merge PDF Online
            </Link>
            <Link to="/compress-pdf-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white transition-colors">
              Compress PDF Online
            </Link>
            <Link to="/pdf-to-word-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white transition-colors">
              PDF to Word Online
            </Link>
            <Link to="/chat-pdf" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white transition-colors">
              AI Chat PDF
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
