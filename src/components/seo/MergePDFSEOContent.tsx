import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Scissors,
  Minimize2,
  FileText,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Lock,
  Smartphone,
  Globe,
  Award,
  ChevronDown,
} from 'lucide-react';
import { RecommendedArticles } from './RecommendedArticles';
import { RelatedTools } from './RelatedTools';

export const MergePDFSEOContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);

  const faqs = [
    {
      question: 'Is it safe to merge PDF files with SmartPDF AI?',
      answer:
        'Yes, absolutely. SmartPDF AI processes your PDF files locally inside your web browser using WebAssembly. Your documents are never uploaded to external servers, ensuring 100% privacy and bank-grade document security.',
    },
    {
      question: 'Is there a limit on how many PDF files I can merge at once?',
      answer:
        'No. SmartPDF AI allows you to combine as many PDF files as needed in a single batch. There are no artificial daily caps, file count restrictions, or paywalls.',
    },
    {
      question: 'Will merging PDFs reduce the visual quality or text clarity?',
      answer:
        'Not at all. Our merge engine preserves the exact vector graphics, typography, embedded fonts, color profiles, and page dimensions of all original source files without applying lossy compression.',
    },
    {
      question: 'Can I reorder or rearrange the PDF files before combining them?',
      answer:
        'Yes! Once you upload your PDF files, you can use the up and down arrow controls on each file card to arrange them into your exact preferred page sequence before merging.',
    },
    {
      question: 'Do I need to create an account or install software to merge PDFs?',
      answer:
        'No registration or software installation is required. SmartPDF AI is a web-based tool that works instantly across all operating systems and web browsers.',
    },
    {
      question: 'Does SmartPDF AI add watermarks to merged PDF files?',
      answer:
        'Never. All PDF files generated using SmartPDF AI are clean, professional, and completely free of watermarks or promotional branding.',
    },
    {
      question: 'Can I merge password-protected or encrypted PDF files?',
      answer:
        'If a PDF file is encrypted, you must unlock it before merging. Once unlocked, SmartPDF AI can seamlessly combine it with other PDF documents.',
    },
    {
      question: 'Does SmartPDF AI work on mobile devices like iPhone and Android?',
      answer:
        'Yes! SmartPDF AI is fully optimized for mobile devices, tablets, laptops, and desktop computers running iOS, Android, macOS, Windows, or Linux.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="mt-12 border-t border-slate-800/80 pt-10 space-y-10 text-slate-300">
      {/* FAQ Schema Script for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          {
            icon: Layers,
            title: 'Unlimited Merging',
            desc: 'Combine multiple PDF files into one master document',
          },
          {
            icon: ShieldCheck,
            title: 'Zero Server Upload',
            desc: 'Processes documents 100% locally in browser memory',
          },
          {
            icon: Zap,
            title: 'Instant Reordering',
            desc: 'Easily rearrange file order before merging',
          },
          {
            icon: CheckCircle2,
            title: 'Watermark-Free',
            desc: 'Clean, professional output with original quality',
          },
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-2.5">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{feat.title}</h3>
                <p className="text-[11px] text-slate-400 leading-snug">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Interactive FAQ Hub */}
      <section className="bg-[#12131F]/90 border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ & Information
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Frequently Asked Questions
            </h2>
          </div>
          <span className="text-xs text-slate-400">{faqs.length} answers available</span>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all hover:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-red-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Collapsible Comprehensive Guide (Preserves 100% SEO Keywords & Depth) */}
      <section className="bg-[#12131F]/80 border border-white/10 rounded-[28px] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                User Guide & Specifications
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                PDF Merge Guide & Best Practices
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFullGuide(!showFullGuide)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer w-fit"
          >
            <span>{showFullGuide ? 'Hide Guide' : 'Read Full Guide'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showFullGuide ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Step-by-step summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {[
            { step: '01', title: 'Upload Files', desc: 'Select two or more PDF documents' },
            { step: '02', title: 'Arrange Order', desc: 'Reorder using up/down controls' },
            { step: '03', title: 'Merge', desc: 'Instant local browser compilation' },
            { step: '04', title: 'Download', desc: 'Get your single combined master PDF' },
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-red-400 font-mono font-bold text-xs">{item.step}</span>
              <h4 className="text-xs font-bold text-white mt-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Expandable Technical Text */}
        {showFullGuide && (
          <div className="space-y-6 pt-4 border-t border-white/5 text-xs sm:text-sm leading-relaxed text-slate-300">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">What is PDF Merging?</h3>
              <p>
                <strong>Merge PDF</strong> is an essential document management process designed to consolidate multiple independent PDF documents into a single, structured, and continuous master file. By merging individual PDFs into one unified file, you establish a seamless distribution workflow, enforce strict document ordering, and optimize long-term file archiving.
              </p>
              <p>
                At a technical level, combining PDF documents involves parsing the structural trees of each input file, extracting page objects, font resources, vector graphics, embedded images, and cross-reference tables, and reassembling them into a newly compiled PDF binary structure with preserved vector precision.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Why Choose SmartPDF AI Merge?</h3>
              <p>
                SmartPDF AI executes the entire binary assembly process directly inside your web browser using modern WebAssembly client-side technology. Your documents are never uploaded to remote servers, giving you 100% privacy and lightning-fast speed.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Recommended Articles Section */}
      <RecommendedArticles category="File Management" limit={3} />

      {/* Related Tools Section */}
      <RelatedTools currentToolPath="/merge-pdf" limit={4} />
    </div>
  );
};
