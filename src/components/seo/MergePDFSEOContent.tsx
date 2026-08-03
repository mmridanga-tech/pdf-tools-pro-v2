import React from 'react';
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
  Award
} from 'lucide-react';

export const MergePDFSEOContent: React.FC = () => {
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

  return (
    <div className="mt-16 border-t border-slate-800/80 pt-16 space-y-16 text-slate-300">
      {/* FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: What is Merge PDF? (300+ Words) */}
      <section className="bg-[#141417]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Comprehensive Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              What is Merge PDF?
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-300">
          <p>
            <strong>Merge PDF</strong> is an essential document management process designed to consolidate multiple independent PDF (Portable Document Format) documents into a single, structured, and continuous master file. In modern business, academic, and administrative environments, digital information is routinely generated across disparate applications—such as scanned paper receipts, spreadsheet financial reports, word-processed contracts, and presentation slide decks. Managing these disconnected files individually often leads to cluttered email attachments, version control confusion, mislaid pages, and inefficient presentation during critical meetings or client submissions. By merging individual PDFs into one unified file, you establish a seamless distribution workflow, enforce strict document ordering, and optimize long-term file archiving.
          </p>

          <p>
            At a technical level, combining PDF documents involves parsing the structural trees of each input file, extracting page objects, font resources, vector graphics, embedded images, and cross-reference tables, and reassembling them into a newly compiled PDF binary structure. Unlike rudimentary copy-and-paste techniques or lossy image stitching, a professional PDF merger preserves the exact vector precision, original color space, embedded typography, interactive bookmarks, hyperlinked annotations, and page orientation settings of every source file. Whether you are compiling chapters of a thesis, merging monthly invoice receipts for accounting audits, combining legal contract addendums, or organizing a multi-part client proposal, PDF merging guarantees that every recipient experiences a polished, continuous document flow.
          </p>

          <p>
            SmartPDF AI elevates document merging by executing the entire binary assembly process directly inside your web browser using modern WebAssembly client-side technology. Traditional online PDF converters force users to upload sensitive files to remote cloud servers, exposing confidential contracts, tax records, and personal identity documents to potential server logs or unauthorized data access. With SmartPDF AI's zero-upload architecture, your files never leave your local device. The processing power of your browser executes the merge locally in milliseconds, delivering maximum privacy, institutional-grade data security, and instant performance regardless of internet connection speeds or file size constraints.
          </p>
        </div>
      </section>

      {/* Section 2: How to Merge PDF Files (Step-by-Step Guide) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Quick Tutorial
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How to Merge PDF Files Online Step-by-Step
          </h2>
          <p className="text-sm text-slate-400">
            Combine multiple PDF files into one document in just a few simple clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload PDF Files',
              description:
                'Drag and drop your PDF documents into the upload box above or click "Select PDF files" to browse from your device.',
            },
            {
              step: '02',
              title: 'Organize Sequence',
              description:
                'Use the up and down arrow buttons to arrange your PDFs into the exact order you want them to appear in the combined file.',
            },
            {
              step: '03',
              title: 'Click Merge PDF',
              description:
                'Click "Merge PDF Files" to initiate instant local browser processing. Your documents are assembled in seconds.',
            },
            {
              step: '04',
              title: 'Download Result',
              description:
                'Preview your merged PDF file and click "Download PDF" to save the final document directly to your device with zero watermarks.',
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

      {/* Section 3: Benefits of Merging PDFs (6-8 Points) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Key Benefits of Merging PDF Files
          </h2>
          <p className="text-sm text-slate-400">
            Why business professionals, students, and educators merge documents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Layers,
              title: 'Unified File Structure',
              desc: 'Consolidate scattered documents into a single organized file for easier management.',
            },
            {
              icon: Zap,
              title: 'Simplified Sharing',
              desc: 'Send one single email attachment instead of confusing recipients with multiple files.',
            },
            {
              icon: ShieldCheck,
              title: '100% Local Privacy',
              desc: 'Client-side processing guarantees your sensitive documents are never uploaded to servers.',
            },
            {
              icon: Award,
              title: 'Lossless Vector Quality',
              desc: 'Retain crisp typography, vector diagrams, fonts, and original image resolution.',
            },
            {
              icon: CheckCircle2,
              title: 'Zero Watermarks',
              desc: 'Export clean, professional documents ready for official submissions without branding.',
            },
            {
              icon: Globe,
              title: 'Universal Compatibility',
              desc: 'Merged PDFs open seamlessly on macOS, Windows, Linux, iOS, and Android devices.',
            },
            {
              icon: Smartphone,
              title: 'Mobile Friendly',
              desc: 'Merge PDFs on the go directly from your mobile browser without installing extra apps.',
            },
            {
              icon: Lock,
              title: 'Secure & Bank-Grade',
              desc: 'Protects confidential legal agreements, financial disclosures, and medical records.',
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
            The Industry Standard for Fast, Secure PDF Processing
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Unlike legacy online converters that impose restrictive file size caps, insert intrusive watermarks, or upload your private documents to third-party cloud servers, <strong>SmartPDF AI</strong> is engineered from the ground up for privacy, velocity, and user empowerment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              'Browser-native WebAssembly compilation',
              'Strict zero data retention policy',
              'Unlimited batch file merging',
              'Ad-free, distraction-free interface',
              'Instant download without registration',
              'Seamless cross-platform performance',
            ].map((feature, fIdx) => (
              <div key={fIdx} className="flex items-center space-x-2.5 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions (8 FAQs) */}
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
            Find answers to common queries about merging PDF documents online.
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

      {/* Section 6: Internal Links */}
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
            to="/split-pdf"
            className="group bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scissors className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
              <span>Split PDF</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract specific pages or split large PDF files into separate documents.
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
              Reduce PDF file size for easy email sharing without sacrificing quality.
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
    </div>
  );
};
