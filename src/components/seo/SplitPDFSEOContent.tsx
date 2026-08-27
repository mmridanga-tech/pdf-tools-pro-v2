import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Layers,
  Minimize2,
  FileText,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  FileCheck,
  Globe,
  Smartphone,
  Lock,
  Award,
  Filter,
  MousePointer,
  ChevronDown,
} from 'lucide-react';
import { RecommendedArticles } from './RecommendedArticles';
import { RelatedTools } from './RelatedTools';

export const SplitPDFSEOContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);

  const faqs = [
    {
      question: 'Is it safe to split PDF files online with SmartPDF AI?',
      answer:
        'Yes, completely safe. SmartPDF AI uses WebAssembly and client-side technology to split PDF files directly inside your web browser memory. Your documents are never uploaded to cloud servers or stored anywhere, ensuring 100% confidentiality.',
    },
    {
      question: 'How do I extract specific pages from a large PDF document?',
      answer:
        'Upload your PDF file, then either enter custom page ranges (e.g., "1-3, 5, 8-10") or visually click on the page thumbnail previews to select or deselect specific pages. Click "Split & Download Pages" to export your custom selection immediately.',
    },
    {
      question: 'Does splitting a PDF lower the original document quality?',
      answer:
        'No. SmartPDF AI extracts individual pages without re-encoding or compressing images and vector text. The output PDF retains the exact resolution, typography, color profiles, and formatting of the original source document.',
    },
    {
      question: 'Is there a limit on file size or how many pages I can split?',
      answer:
        'No. You can split PDFs of any page count or file size without artificial caps, daily restrictions, or mandatory subscriptions.',
    },
    {
      question: 'Do I need to sign up or install software to split PDFs?',
      answer:
        'No registration, credit card, or software installation is required. SmartPDF AI runs instantly in any modern desktop or mobile web browser.',
    },
    {
      question: 'Does SmartPDF AI add watermarks to split PDF pages?',
      answer:
        'Never. Every PDF file generated with SmartPDF AI is clean, professional, and completely free of watermarks or promotional branding.',
    },
    {
      question: 'Can I split password-protected or encrypted PDF documents?',
      answer:
        'If your PDF document is password-protected, you must unlock it before splitting. Once decrypted, SmartPDF AI will allow you to select and extract any pages seamlessly.',
    },
    {
      question: 'Can I split PDFs on mobile devices like iPhone and Android?',
      answer:
        'Yes! SmartPDF AI is fully responsive and mobile-friendly, allowing you to split, select, and download PDF pages directly from iOS, Android, and tablet web browsers.',
    },
    {
      question: 'What happens to the remaining pages of the PDF after splitting?',
      answer:
        'Your original source file remains untouched on your device. SmartPDF AI generates a new, separate PDF file containing only the pages or page ranges you selected.',
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
            icon: Scissors,
            title: 'Custom Page Ranges',
            desc: 'Extract specific single pages or custom ranges easily',
          },
          {
            icon: ShieldCheck,
            title: '100% Client-Side',
            desc: 'Zero file upload — processed safely in browser memory',
          },
          {
            icon: MousePointer,
            title: 'Visual Page Selector',
            desc: 'Click on page previews to select exact pages to keep',
          },
          {
            icon: CheckCircle2,
            title: 'Watermark-Free',
            desc: 'Clean extracted pages with 100% original quality',
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
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                User Guide & Specifications
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                PDF Page Extraction Guide
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
            { step: '01', title: 'Upload PDF', desc: 'Choose a multi-page PDF document' },
            { step: '02', title: 'Select Pages', desc: 'Type ranges or click thumbnails' },
            { step: '03', title: 'Split', desc: 'Instant WebAssembly extraction' },
            { step: '04', title: 'Download', desc: 'Get separate or extracted PDF files' },
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
              <h3 className="text-sm font-bold text-white">What is PDF Splitting?</h3>
              <p>
                <strong>Split PDF</strong> is an essential document extraction process that allows users to separate a multi-page Portable Document Format file into individual standalone documents or extract specific target page ranges. In daily operations, documents are often distributed as monolithic files—such as textbook chapters, legal contracts, or combined invoice statements.
              </p>
              <p>
                Splitting a PDF enables precise document segmentation. By parsing the internal page catalog and object trees, the extraction engine isolates individual pages, custom page ranges, or separates odd and even pages without quality loss.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Why Choose SmartPDF AI Split?</h3>
              <p>
                SmartPDF AI leverages browser-native WebAssembly (Wasm) and client-side processing algorithms. Your PDF files are processed entirely in local device memory inside your web browser. This guarantees absolute data privacy, lightning-fast processing speeds, and complete independence from server availability.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Recommended Articles Section */}
      <RecommendedArticles category="File Management" limit={3} />

      {/* Related Tools Section */}
      <RelatedTools currentToolPath="/split-pdf" limit={4} />
    </div>
  );
};
