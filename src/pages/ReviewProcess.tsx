import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  SearchCheck,
  CheckCircle2,
  Workflow,
  Cpu,
  ShieldCheck,
  Zap,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  BookOpen,
  UserCheck,
  MonitorCheck,
  Sparkles,
  FileCode,
  Lock,
  Layers,
  HelpCircle,
  FileText,
  User
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const ReviewProcess: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const canonicalUrl = 'https://smartpdfai.tech/review-process';

  // JSON-LD Structured Data for Review Process Page
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: 'Our Review Process & Technical Testing Methodology - SmartPDF AI',
        description:
          'Discover how SmartPDF AI evaluates PDF tools, conducts rigorous expert testing, verifies client-side security, and enforces strict quality assurance.',
        publisher: {
          '@type': 'Organization',
          name: 'SmartPDF AI',
          url: 'https://smartpdfai.tech',
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
            name: 'Our Review Process',
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const workflowSteps = [
    {
      stepNumber: 1,
      title: 'Topic Identification & Technical Research',
      description:
        'Our editorial team identifies common document workflows, new ISO 32000-2 PDF specifications, and web browser API capabilities needing clear technical coverage.',
      icon: <Workflow className="w-5 h-5 text-red-400" />,
      details: [
        'Analyzing user pain points in PDF processing and security.',
        'Reviewing W3C WebAssembly and HTML5 canvas specs.',
        'Formulating objective test criteria for software benchmarks.',
      ],
    },
    {
      stepNumber: 2,
      title: 'Hands-On Tool & Algorithm Testing',
      description:
        'Before writing a single word, senior engineers run real PDF files through all featured tools, testing processing speed, output fidelity, and RAM usage.',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      details: [
        'Testing with diverse document samples: scanned images, forms, CAD drawings, large books.',
        'Measuring WebAssembly vs cloud API response times.',
        'Stress-testing memory bounds on mobile devices and lower-spec laptops.',
      ],
    },
    {
      stepNumber: 3,
      title: 'Expert Peer Review & Technical Pass',
      description:
        'Draft guides are submitted to lead document software engineers who check every code snippet, step-by-step instruction, and security claim.',
      icon: <UserCheck className="w-5 h-5 text-blue-400" />,
      details: [
        'Code snippet validation for PDF.js and pdf-lib implementations.',
        'Verification of client-side privacy assertions.',
        'Double-checking terminology against ISO PDF standards.',
      ],
    },
    {
      stepNumber: 4,
      title: 'Quality Assurance & Accessibility Audit',
      description:
        'Our QA team reviews screen readability, mobile responsiveness, WCAG 2.1 AA accessibility, and ensures all internal links function flawlessly.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      details: [
        'Readability scoring and clear typographic hierarchy.',
        'Dark mode visual contrast verification (WCAG AA).',
        'Cross-browser layout and touch target compliance.',
      ],
    },
    {
      stepNumber: 5,
      title: 'Publication & Continuous Monitoring',
      description:
        'Post-publication, our automated test scripts monitor tool availability, performance degradation, and link integrity on a 24/7 basis.',
      icon: <MonitorCheck className="w-5 h-5 text-purple-400" />,
      details: [
        '24/7 uptime monitoring of client-side web bundles.',
        'Immediate revisions when browser standards evolve.',
        'Incorporating reader feedback and technical error submissions.',
      ],
    },
  ];

  const reviewAspects = [
    {
      title: 'Expert Review Team',
      description:
        'Reviews are led by document processing engineers and cybersecurity specialists who bring deep expertise in PDF rendering, cryptography, and WebAssembly execution.',
      icon: <UserCheck className="w-5 h-5 text-red-400" />,
    },
    {
      title: 'Corrupt File & Stress Testing',
      description:
        'We test how PDF engines handle corrupted headers, missing fonts, locked streams, and heavy vector drawings without crashing browser tabs.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Security & Privacy Audits',
      description:
        'We inspect network traffic via DevTools to confirm 100% client-side local memory processing with zero server uploads for private tools.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Cross-Platform Testing Matrix',
      description:
        'Every tool is verified across major browsers (Chrome, Firefox, Safari, Edge) and operating systems (Windows, macOS, Linux, Android, iOS).',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
    },
  ];

  const faqs = [
    {
      question: 'What makes SmartPDF AI review process unique?',
      answer:
        'Unlike general review sites that rely on marketing materials, our team actually tests software against real PDF files using open network monitors to verify privacy, RAM consumption, and rendering fidelity.',
    },
    {
      question: 'How do you test client-side security claims?',
      answer:
        'We monitor Network DevTools frames, service worker calls, and memory dumps while executing tasks (e.g. PDF merging or unlocking) to guarantee zero byte transmissions leave the local browser RAM.',
    },
    {
      question: 'Can tool developers pay to pass your review process?',
      answer:
        'No. SmartPDF AI maintains absolute editorial independence. We do not accept payment, sponsored placements, or external influence for our tool evaluations or testing outcomes.',
    },
    {
      question: 'How can users suggest a tool or feature for review?',
      answer:
        'We encourage reader input! You can submit tool feature requests or report edge-case bugs by emailing our review team at mmridanga@gmail.com.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Our Review Process & Testing Standards - SmartPDF AI"
        description="Learn how SmartPDF AI tests PDF tools, conducts expert code reviews, evaluates WebAssembly performance, and enforces rigorous quality assurance."
        path="/review-process"
        jsonLdSchema={jsonLdSchema}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-bold">Our Review Process</span>
        </nav>

        {/* Hero Header Banner */}
        <section className="bg-[#121215] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden" id="review-hero">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
              <SearchCheck className="w-3.5 h-3.5" /> Rigorous QA Matrix
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide">
              <Cpu className="w-3.5 h-3.5" /> WebAssembly Tested
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-wide">
              <Lock className="w-3.5 h-3.5" /> Privacy Verified
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Our Technical Review & Testing Process
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              To deliver dependable PDF software tools and technical documentation, <strong className="text-white">SmartPDF AI</strong> uses a structured, multi-tier evaluation framework. Every feature and guide undergoes rigorous hands-on testing, expert code review, and continuous monitoring.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Version: <strong>2026.3 Specification Pass</strong></span>
            </div>
            <Link
              to="/author/mridanga-mondal"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-red-400 transition-colors font-semibold"
            >
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>QA Director: Mridanga Mondal</span>
            </Link>
          </div>
        </section>

        {/* 5-Step Content Creation Workflow */}
        <section className="space-y-8" id="workflow-steps">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Workflow className="w-3.5 h-3.5" />
              <span>Step-by-Step Methodology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Our 5-Stage Review Workflow</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              From initial research to long-term uptime monitoring, here is how we ensure maximum accuracy and security.
            </p>
          </div>

          <div className="space-y-6">
            {workflowSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-[#121215] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-base font-black flex items-center justify-center shrink-0">
                      0{step.stepNumber}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 hidden sm:block">
                    {step.icon}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>

                <div className="pt-2">
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Four Key Pillars of Technical Evaluation */}
        <section className="space-y-6" id="testing-aspects">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">How We Test Tools & Code</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Our hands-on technical testing procedures cover performance, cross-platform compatibility, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviewAspects.map((aspect, idx) => (
              <div key={idx} className="bg-[#121215] border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
                  {aspect.icon}
                </div>
                <h3 className="text-base font-bold text-white">{aspect.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{aspect.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-linking Policy Navigation Hub */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Explore Related Quality Standards</span>
              </h2>
              <p className="text-xs text-slate-400">Review our editorial policy and AI transparency guidelines.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/editorial-policy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>Editorial Policy</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
              <Link
                to="/ai-content-policy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>AI Content Policy</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <Link to="/about" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">About Us</span>
              <span className="text-[10px] text-slate-400">Our team & credentials</span>
            </Link>
            <Link to="/help" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Help Center</span>
              <span className="text-[10px] text-slate-400">Guides & troubleshooting</span>
            </Link>
            <Link to="/privacy" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Privacy Guarantee</span>
              <span className="text-[10px] text-slate-400">100% RAM isolation</span>
            </Link>
            <Link to="/contact" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Submit Tool Request</span>
              <span className="text-[10px] text-slate-400">Suggest new features</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6" id="review-faqs">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Review Process FAQs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Review Process Questions</h2>
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
                        isOpen ? 'rotate-180 text-emerald-400' : ''
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

        {/* Quick Tools Access Bar */}
        <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Experience Our Tested PDF Tools
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link to="/split-pdf-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-colors">
              Split PDF Online
            </Link>
            <Link to="/pdf-to-word-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-colors">
              PDF to Word Online
            </Link>
            <Link to="/ocr-pdf" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-colors">
              OCR PDF Extraction
            </Link>
            <Link to="/protect-pdf-online" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-colors">
              Protect PDF
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
