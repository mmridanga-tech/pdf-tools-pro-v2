import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Minimize2,
  Layers,
  Scissors,
  FileText,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  HardDrive,
  Globe,
  Smartphone,
  TrendingDown,
  Cpu,
  Lock,
  Award,
  ChevronDown,
} from 'lucide-react';
import { RecommendedArticles } from './RecommendedArticles';
import { RelatedTools } from './RelatedTools';

export const CompressPDFSEOContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);

  const faqs = [
    {
      question: 'Is it safe to compress PDF files with SmartPDF AI?',
      answer:
        'Yes, 100%. SmartPDF AI utilizes browser-based WebAssembly and client-side processing algorithms. Your PDF files remain locally in your browser memory and are never uploaded to remote cloud servers, guaranteeing absolute privacy and data security.',
    },
    {
      question: 'How much can SmartPDF AI reduce my PDF file size?',
      answer:
        'Depending on the compression level chosen and the contents of your PDF (images vs. text), SmartPDF AI can reduce file sizes by anywhere from 30% up to 80% or more, while preserving crisp text readability and sharp visuals.',
    },
    {
      question: 'Will compressing my PDF reduce text or image quality?',
      answer:
        'Our Recommended Compression preset optimizes color profiles and compresses high-resolution images while preserving original text vectors and document layout. For maximum image fidelity, choose the Minimal Compression setting.',
    },
    {
      question: 'Is there a file size limit or daily cap on PDF compression?',
      answer:
        'No. SmartPDF AI allows unlimited PDF file compression with no daily usage limits, file count restrictions, or hidden paywalls.',
    },
    {
      question: 'Can I compress multiple PDF files at once in batch mode?',
      answer:
        'Yes! You can upload multiple PDF documents simultaneously and compress them all in a single batch. You can even download all compressed files together in a convenient ZIP archive.',
    },
    {
      question: 'Does SmartPDF AI add watermarks to compressed PDFs?',
      answer:
        'Never. Every PDF compressed using SmartPDF AI is exported clean and watermark-free, perfectly ready for professional, academic, or corporate submission.',
    },
    {
      question: 'Can I compress password-protected or encrypted PDF documents?',
      answer:
        'To compress an encrypted PDF, you must unlock or provide permission to access the file first. Once unlocked, SmartPDF AI can process and reduce its file size smoothly.',
    },
    {
      question: 'Does SmartPDF AI work on iPhone, Android, and tablets?',
      answer:
        'Yes! SmartPDF AI is fully responsive and optimized to run directly in modern mobile web browsers across iOS, Android, iPadOS, macOS, Windows, and Linux.',
    },
    {
      question: 'What is the difference between Extreme, Recommended, and Minimal Compression?',
      answer:
        'Recommended Compression provides the ideal balance between high file size reduction and image clarity. Extreme Compression achieves maximum size reduction for large attachments, while Minimal Compression preserves maximum image detail with light compression.',
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
            icon: TrendingDown,
            title: 'Up to 80% Reduction',
            desc: 'Dramatically reduce file size while keeping crisp clarity',
          },
          {
            icon: ShieldCheck,
            title: '100% In-Browser',
            desc: 'Files never leave your device for complete privacy',
          },
          {
            icon: Zap,
            title: 'Batch Compression',
            desc: 'Compress multiple documents in a single click',
          },
          {
            icon: CheckCircle2,
            title: 'Watermark-Free',
            desc: 'Clean, professional PDF documents ready for use',
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
              <Minimize2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                User Guide & Specifications
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                PDF Compression Guide
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
            { step: '01', title: 'Upload Files', desc: 'Add one or more PDF documents' },
            { step: '02', title: 'Select Level', desc: 'Recommended, Extreme, or Minimal' },
            { step: '03', title: 'Compress', desc: 'WebAssembly in-memory reduction' },
            { step: '04', title: 'Download', desc: 'Instant single or ZIP download' },
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
              <h3 className="text-sm font-bold text-white">What is PDF Compression?</h3>
              <p>
                <strong>PDF Compression</strong> is the process of reducing the physical binary data size of a Portable Document Format file without compromising its overall visual integrity, typography, or structural layout. PDF documents frequently accumulate excessive file sizes due to uncompressed high-resolution bitmap photos, embedded full-page scans, duplicate font subsets, redundant metadata stream buffers, and unoptimized vector graphics.
              </p>
              <p>
                At an architectural level, PDF compression employs sophisticated data reduction algorithms that analyze the internal structure of the document—downsampling oversized raster images, applying modern lossy or lossless compression codecs, stripping unneeded metadata, and compressing internal PDF stream objects.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Why Choose SmartPDF AI Compression?</h3>
              <p>
                SmartPDF AI runs cutting-edge WebAssembly (Wasm) and client-side processing directly inside your browser. Your private files never leave your device memory, delivering 100% data confidentiality, instantaneous multi-file processing, zero server wait times, and complete immunity from network bandwidth limitations.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Recommended Articles Section */}
      <RecommendedArticles category="File Management" limit={3} />

      {/* Related Tools Section */}
      <RelatedTools currentToolPath="/compress-pdf" limit={4} />
    </div>
  );
};
