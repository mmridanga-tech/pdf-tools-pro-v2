import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Bot,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  FileText,
  AlertTriangle,
  HelpCircle,
  User,
  Scale
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const AIContentPolicy: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const canonicalUrl = 'https://smartpdfai.tech/ai-content-policy';

  // Structured Data JSON-LD
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: 'AI Content Policy & Ethical Guidelines - SmartPDF AI',
        description:
          'Learn how SmartPDF AI utilizes Artificial Intelligence ethically: human-in-the-loop verification, client-side privacy, zero LLM model training on user files, and zero-hallucination accuracy standards.',
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
            name: 'AI Content Policy',
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const policyPillars = [
    {
      id: 'ai-usage',
      title: 'How Artificial Intelligence is Used',
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      description:
        'AI serves purely as an assistive capability to empower document workflow tasks—such as PDF summarization, smart semantic Q&A, table extractions, and drafting initial research outlines.',
      points: [
        'Interactive AI chat over document contents (e.g. SmartPDF Chat).',
        'Automated document indexing, OCR text extraction, and metadata tagging.',
        'Speeding up research workflows while strictly augmenting human oversight.',
      ],
    },
    {
      id: 'human-editing',
      title: 'Mandatory Human-in-the-Loop (HITL)',
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      description:
        'Artificial Intelligence never publishes content or technical guides autonomously. Every published article, tutorial, and tool documentation undergoes 100% human editorial review and refinement.',
      points: [
        'Qualified human editors rewrite and verify all AI-assisted drafts.',
        'Human engineers test every code snippet and step-by-step instruction.',
        'Refining tone, checking context, and ensuring natural readability.',
      ],
    },
    {
      id: 'accuracy-verification',
      title: 'Zero-Hallucination & Fact-Checking',
      icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />,
      description:
        'AI outputs can produce inaccuracies or hallucinations. We enforce strict fact-checking protocols, cross-referencing AI outputs directly against source documents and technical specifications.',
      points: [
        'Cross-verifying all generated summaries against original PDF source text.',
        'Mandatory double-checking of mathematical calculations, dates, and names.',
        'Clear citations linking AI summary answers back to exact document page numbers.',
      ],
    },
    {
      id: 'privacy-first',
      title: 'Privacy-First & No Model Training',
      icon: <Lock className="w-6 h-6 text-red-400" />,
      description:
        'Your document contents and private PDF files are NEVER used to train, fine-tune, or improve public or foundational Large Language Models (LLMs).',
      points: [
        'Strict zero-retention API configurations with enterprise LLM providers.',
        'Ephemeral memory processing in volatile RAM with immediate auto-purge.',
        'No permanent storage of user queries, PDF pages, or extracted vectors.',
      ],
    },
    {
      id: 'no-misleading-content',
      title: 'Zero Misleading or Synthetic Content',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      description:
        'We enforce an absolute ban on synthetic misinformation, deepfakes, automated web spam, or misleading marketing claims created with AI.',
      points: [
        'Transparent labeling of AI-assisted features across the platform.',
        'Zero tolerance for clickbait or unverified AI advice.',
        'Complete alignment with Google Search Quality Rater E-E-A-T guidelines.',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Are my uploaded PDFs used to train AI models?',
      answer:
        'ABSOLUTELY NOT. SmartPDF AI uses zero-data-retention enterprise API endpoints. Your uploaded documents, text extractions, and chat prompts are processed ephemerally in RAM and are NEVER used to train foundational AI or LLM models.',
    },
    {
      question: 'Does AI write articles on SmartPDF AI autonomously?',
      answer:
        'No. AI is only used as an exploratory tool for research outlines and document summarization. 100% of articles, tool guides, and documentation published on our site are edited, fact-checked, and approved by qualified human editors.',
    },
    {
      question: 'How do you prevent AI hallucinations in document summaries?',
      answer:
        'Our AI Chat PDF engine uses strict Retrieval-Augmented Generation (RAG) with localized context boundaries. Answers are anchored strictly to page numbers in your document with direct citations, preventing hallucinated information.',
    },
    {
      question: 'How can I report a problem or privacy concern with AI features?',
      answer:
        'If you have questions about AI outputs, accuracy, or privacy, please contact our Lead Developer and Privacy Officer directly at mmridanga@gmail.com.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="AI Content Policy & Ethical Guidelines - SmartPDF AI"
        description="SmartPDF AI Content Policy. Discover our privacy-first approach to AI, human-in-the-loop editing, zero-hallucination verification, and guarantee that user files are never used for AI training."
        path="/ai-content-policy"
        jsonLdSchema={jsonLdSchema}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-bold">AI Content Policy</span>
        </nav>

        {/* Hero Header Banner */}
        <section className="bg-[#121215] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden" id="ai-policy-hero">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-wide">
              <Bot className="w-3.5 h-3.5" /> Responsible AI Standard
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
              <UserCheck className="w-3.5 h-3.5" /> Human-in-the-Loop
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide">
              <Lock className="w-3.5 h-3.5" /> Zero AI Model Training
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              AI Content Policy & Ethical AI Framework
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Artificial Intelligence is transforming document processing and analysis. At <strong className="text-white">SmartPDF AI</strong>, we are committed to leveraging AI technology responsibly, transparently, and ethically while upholding strict client privacy and human expert oversight.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Framework: <strong>2026 Ethical AI Standard</strong></span>
            </div>
            <Link
              to="/author/mridanga-mondal"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-red-400 transition-colors font-semibold"
            >
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>Lead Developer & AI Ethics Officer: Mridanga Mondal</span>
            </Link>
          </div>
        </section>

        {/* Highlights Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="ai-policy-highlights">
          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Assistive AI Tooling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI augments human productivity for PDF summarization and semantic Q&A without taking full automation control.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Human Oversight</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              100% of published material undergoes mandatory human editor review, testing, and tone verification.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Verified Accuracy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict localized RAG boundaries prevent AI hallucinations and provide direct page citations.
            </p>
          </div>

          <div className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Model Training</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your uploaded files are never saved or used to train foundational LLM models.
            </p>
          </div>
        </section>

        {/* 5 Core Policy Principles */}
        <section className="space-y-8" id="ai-pillars">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Policy Directives</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">The 5 Core AI Content Principles</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              How we govern Artificial Intelligence usage across our engineering teams, web content, and AI document chat features.
            </p>
          </div>

          <div className="space-y-6">
            {policyPillars.map((pillar, idx) => (
              <div
                key={pillar.id}
                className="bg-[#121215] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-purple-500/30 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Principle 0{idx + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{pillar.title}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>

                <div className="pt-2">
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                    {pillar.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy & Safety Deep Dive Box */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6" id="privacy-guarantee">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Privacy-First AI Infrastructure Guarantee</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We recognize that documents processed by SmartPDF AI often contain sensitive personal, financial, or corporate data. Here is how our architecture guarantees your privacy when using AI features:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Ephemeral Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Files uploaded for AI analysis are processed exclusively in volatile memory (RAM) and purged immediately after the session ends.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Zero Third-Party Logging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We contract with enterprise API providers enforcing zero data logging and zero model training agreements.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Source Citation Links</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every AI answer generated in PDF Chat features exact page citations allowing you to verify responses in one click.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Navigation Hub */}
        <section className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Explore Related Governance Pages</span>
              </h2>
              <p className="text-xs text-slate-400">Discover our editorial standards and review testing methodology.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/editorial-policy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>Editorial Policy</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </Link>
              <Link
                to="/review-process"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <span>Our Review Process</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <Link to="/chat-pdf" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Try AI Chat PDF</span>
              <span className="text-[10px] text-slate-400">Smart PDF assistant</span>
            </Link>
            <Link to="/privacy" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Privacy Policy</span>
              <span className="text-[10px] text-slate-400">RAM security & specs</span>
            </Link>
            <Link to="/disclaimer" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Disclaimer</span>
              <span className="text-[10px] text-slate-400">Legal AI boundaries</span>
            </Link>
            <Link to="/contact" className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
              <span className="font-bold block text-white">Contact AI Safety</span>
              <span className="text-[10px] text-slate-400">Questions & concerns</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6" id="ai-policy-faqs">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>AI Policy Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
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
                        isOpen ? 'rotate-180 text-purple-400' : ''
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

        {/* Popular AI Tools Bar */}
        <section className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Explore AI Document Capabilities
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link to="/chat-pdf" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-colors">
              Chat with PDF
            </Link>
            <Link to="/document-analyzer" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-colors">
              AI Document Analyzer
            </Link>
            <Link to="/ai-assistant" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-colors">
              AI Smart Assistant
            </Link>
            <Link to="/ocr-pdf" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-colors">
              AI OCR Text Extraction
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
