import React from 'react';
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
  MousePointer
} from 'lucide-react';
import { RecommendedArticles } from './RecommendedArticles';
import { RelatedTools } from './RelatedTools';

export const SplitPDFSEOContent: React.FC = () => {
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

  return (
    <div className="mt-16 border-t border-slate-800/80 pt-16 space-y-16 text-slate-300">
      {/* FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: What is Split PDF? (300-500 words) */}
      <section className="bg-[#141417]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Comprehensive Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              What is Split PDF?
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-300">
          <p>
            <strong>Split PDF</strong> is an essential document extraction process that allows users to separate a multi-page Portable Document Format file into individual standalone documents or extract specific target page ranges. In daily professional, academic, and administrative operations, documents are frequently published or distributed as monolithic, multi-section files—such as comprehensive textbook chapters, legal contracts containing confidential annexes, annual corporate financial reports, or combined invoice statements. Attempting to share or process an entire multi-page document when only a few pages are relevant causes information clutter, increases security risks by exposing sensitive data, and wastes valuable internet bandwidth.
          </p>

          <p>
            Splitting a PDF enables precise document segmentation. By parsing the internal page catalog and object trees of a PDF file, a PDF splitting engine can isolate individual pages, custom page ranges (such as pages 1–5 or page 12), or separate odd and even pages into dedicated, standalone PDF files. Unlike legacy print-to-PDF virtual printers that often compress raster images, alter font rendering, or destroy interactive links, professional PDF splitting extracts exact vector objects, embedded fonts, color profiles, and layout fidelity directly from the source file without any degradation in quality.
          </p>

          <p>
            SmartPDF AI reimagines PDF page extraction by leveraging browser-native WebAssembly (Wasm) and client-side processing algorithms. Traditional online PDF splitters force users to upload confidential contracts, medical histories, or tax forms to external cloud servers, raising serious privacy concerns regarding data storage and server logs. With SmartPDF AI's zero-upload architecture, your PDF files are processed entirely in local device memory inside your web browser. This guarantees absolute data privacy, lightning-fast processing speeds, and complete independence from server availability or internet speed bottlenecks.
          </p>
        </div>
      </section>

      {/* Section 2: How to Split PDF Files (Step-by-Step Guide) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Quick Tutorial
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How to Split PDF Files Online Step-by-Step
          </h2>
          <p className="text-sm text-slate-400">
            Extract individual pages or custom ranges from your PDF document in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Your PDF',
              description:
                'Drag and drop your multi-page PDF into the upload zone or click "Select PDF file" to choose a document from your device.',
            },
            {
              step: '02',
              title: 'Select Pages or Ranges',
              description:
                'Enter custom page numbers (e.g. 1-3, 5, 8) in the range input box or click thumbnail previews directly in the page grid.',
            },
            {
              step: '03',
              title: 'Click Split Pages',
              description:
                'Press "Split & Download Pages" to trigger instant local browser extraction powered by WebAssembly.',
            },
            {
              step: '04',
              title: 'Download Output',
              description:
                'Save your newly created, extracted PDF file directly to your computer or mobile device with zero watermarks.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-[#141417] border border-slate-800/80 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-red-500/80 font-mono">
                  {item.step}
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500/40 group-hover:bg-red-500 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Benefits of Splitting PDFs (6-8 Points) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Key Benefits of Splitting PDF Documents
          </h2>
          <p className="text-sm text-slate-400">
            Why extracting specific PDF pages streamlines your daily document workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Filter,
              title: 'Targeted Page Extraction',
              desc: 'Isolate and extract only the relevant pages you need without sending entire bloated documents.',
            },
            {
              icon: ShieldCheck,
              title: 'Confidentiality Protection',
              desc: 'Remove sensitive financial data, private signature pages, or internal notes before sharing.',
            },
            {
              icon: Zap,
              title: 'Instant Local Speed',
              desc: 'Process large multi-hundred-page PDFs in milliseconds thanks to local browser WebAssembly.',
            },
            {
              icon: MousePointer,
              title: 'Visual Page Selection',
              desc: 'Interactively click page thumbnails or enter syntax-based ranges for maximum control.',
            },
            {
              icon: Award,
              title: 'Lossless Visual Quality',
              desc: 'Preserves original vector fonts, crisp illustrations, and high-resolution layout details.',
            },
            {
              icon: CheckCircle2,
              title: 'Clean & Watermark-Free',
              desc: 'Generates professional output documents free of watermarks, branding, or forced overlays.',
            },
            {
              icon: Smartphone,
              title: 'Full Mobile Support',
              desc: 'Split documents seamlessly on iPhone, iPad, Android tablets, and mobile web browsers.',
            },
            {
              icon: Lock,
              title: 'Bank-Grade Data Privacy',
              desc: 'Zero file uploads guarantees confidential legal contracts and tax records remain 100% private.',
            },
          ].map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={idx}
                className="bg-[#141417]/80 border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{benefit.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Why Choose SmartPDF AI */}
      <section className="bg-gradient-to-br from-[#141417] via-slate-900 to-[#141417] border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-red-400/20" />
            Why Choose SmartPDF AI?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Premier Privacy-First Online PDF Splitter
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            While traditional PDF online conversion sites force you to upload your files to remote servers, queue for processing, and risk data leaks or retention, <strong>SmartPDF AI</strong> runs entirely inside your browser. Your sensitive files never leave your computer or mobile device.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              '100% client-side WebAssembly execution',
              'Zero cloud uploads — ultimate privacy',
              'Visual thumbnail preview grid for easy selection',
              'Supports custom page ranges and individual pages',
              'Zero watermarks, pop-up ads, or sign-ups',
              'Works offline and across all operating systems',
            ].map((feature, fIdx) => (
              <div key={fIdx} className="flex items-center space-x-2.5 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions (9 FAQs) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Find fast answers to common questions about splitting and extracting PDF pages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#141417]/90 border border-slate-800/80 rounded-2xl p-6 space-y-2 hover:border-slate-700 transition-all"
            >
              <h3 className="text-base font-bold text-white flex items-start gap-2">
                <span className="text-red-400 text-xs font-mono mt-1 shrink-0">
                  Q{index + 1}.
                </span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6 border-l-2 border-red-500/30">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Related Tools */}
      <section className="bg-[#141417]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Ecosystem
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Explore More Free PDF Tools
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
          >
            <span>Visit Blog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/merge-pdf"
            className="group bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
              <span>Merge PDF</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combine multiple PDF files into one continuous document easily.
            </p>
          </Link>

          <Link
            to="/compress-pdf"
            className="group bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Minimize2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
              <span>Compress PDF</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reduce PDF file size for easy email attachments without quality loss.
            </p>
          </Link>

          <Link
            to="/pdf-to-word"
            className="group bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
              <span>PDF to Word</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert PDF documents into fully editable Microsoft Word (.docx) files.
            </p>
          </Link>

          <Link
            to="/blog"
            className="group bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
              <span>SmartPDF Blog</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Read step-by-step tutorials, document tips, and workflow best practices.
            </p>
          </Link>
        </div>
      </section>

      {/* Recommended Articles Section */}
      <RecommendedArticles category="Tutorials & Guides" limit={3} />

      {/* Related Tools Section */}
      <RelatedTools currentToolPath="/split-pdf" limit={4} />
    </div>
  );
};
