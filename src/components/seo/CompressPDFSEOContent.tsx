import React from 'react';
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
  Award
} from 'lucide-react';

export const CompressPDFSEOContent: React.FC = () => {
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

  return (
    <div className="mt-16 border-t border-slate-800/80 pt-16 space-y-16 text-slate-300">
      {/* FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: What is PDF Compression? (300+ Words) */}
      <section className="bg-[#141417]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Minimize2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Comprehensive Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              What is PDF Compression?
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-300">
          <p>
            <strong>PDF Compression</strong> is the process of reducing the physical binary data size (measured in megabytes or kilobytes) of a Portable Document Format file without compromising its overall visual integrity, typography, or structural layout. PDF documents frequently accumulate excessive file sizes due to uncompressed high-resolution bitmap photos, embedded full-page scans, duplicate font subsets, redundant metadata stream buffers, and unoptimized vector graphics. Large PDF files present significant operational bottlenecks across digital workflows—triggering email attachment bounces (which typically cap files at 20MB to 25MB), causing sluggish web portal uploads, consuming excessive mobile data, and cluttering cloud storage drives.
          </p>

          <p>
            At an architectural level, PDF compression employs sophisticated data reduction algorithms that analyze the internal structure of the document. This includes downsampling oversized raster images to optimal web resolutions (such as 150 to 300 DPI), applying advanced lossy or lossless image compression formats (such as JPEG, JPEG2000, or JBIG2 for monochrome scans), stripping unneeded metadata, and compressing internal PDF stream objects using Flate or Deflate encoding algorithms. By intelligently optimizing these internal assets, a compression engine can dramatically shrink a 50MB document down to 5MB while ensuring the text remains razor-sharp and images remain crisp on screens and desktop printouts.
          </p>

          <p>
            SmartPDF AI revolutionizes PDF compression by running cutting-edge WebAssembly (Wasm) and client-side processing directly inside your browser. Unlike traditional online PDF compressors that mandate uploading your sensitive financial reports, legal contracts, or medical records to external cloud servers, SmartPDF AI processes everything locally on your machine. Your private files never leave your device memory, delivering 100% data confidentiality, instantaneous multi-file processing, zero server wait times, and complete immunity from network bandwidth limitations.
          </p>
        </div>
      </section>

      {/* Section 2: How to Compress PDF (Step-by-Step Guide) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Quick Tutorial
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How to Compress PDF Files Online Step-by-Step
          </h2>
          <p className="text-sm text-slate-400">
            Reduce your PDF file size in seconds with zero quality loss.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload PDF Files',
              description:
                'Drag and drop your PDF documents into the compressor box above or click "Select PDF files" to select documents from your device.',
            },
            {
              step: '02',
              title: 'Select Compression Level',
              description:
                'Choose your preferred mode: Recommended (best ratio & quality), Extreme (maximum size reduction), or Minimal (maximum visual quality).',
            },
            {
              step: '03',
              title: 'Click Compress PDF',
              description:
                'Press "Compress PDF" to start local WebAssembly processing. Your files are optimized directly inside your browser memory in seconds.',
            },
            {
              step: '04',
              title: 'Download Optimized File',
              description:
                'Review your exact savings percentage and size reduction, then download your compressed PDF file or ZIP archive instantly.',
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

      {/* Section 3: Benefits of PDF Compression */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Key Benefits of PDF Compression
          </h2>
          <p className="text-sm text-slate-400">
            Why optimizing your document file size unlocks workflow efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingDown,
              title: 'Bypass Email Attachment Limits',
              desc: 'Shrink oversized PDFs to comfortably pass strict 20MB–25MB email gateway attachment caps.',
            },
            {
              icon: Zap,
              title: 'Lightning-Fast Web Uploads',
              desc: 'Speed up job applications, tax filings, and portal submissions with lightweight documents.',
            },
            {
              icon: ShieldCheck,
              title: '100% In-Browser Privacy',
              desc: 'Client-side processing guarantees your sensitive personal and corporate files never touch cloud servers.',
            },
            {
              icon: HardDrive,
              title: 'Reclaim Storage Space',
              desc: 'Free up valuable gigabytes on your local hard drive, smartphone, or cloud storage accounts.',
            },
            {
              icon: Cpu,
              title: 'WebAssembly Powered',
              desc: 'Leverages your native CPU hardware acceleration for instant, zero-latency document optimization.',
            },
            {
              icon: CheckCircle2,
              title: 'No Watermarks or Logos',
              desc: 'Export clean, professional documents ready for official business and legal submissions.',
            },
            {
              icon: Smartphone,
              title: 'Save Mobile Data',
              desc: 'Compress documents before sending on mobile networks to conserve mobile bandwidth.',
            },
            {
              icon: Globe,
              title: 'Universal Device Support',
              desc: 'Optimized PDFs render flawlessly on all PDF viewers across Windows, Mac, iOS, and Android.',
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
            Next-Generation Browser-Native PDF Compression Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Most online PDF compressors rely on legacy server queues that force you to upload your private files, wait in line for processing, and risk data retention on unknown third-party servers. <strong>SmartPDF AI</strong> eliminates these risks completely by executing high-performance PDF optimization right inside your web browser.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              'Zero file uploads — 100% client-side security',
              'Advanced DPI and image stream downsampling',
              'Custom compression levels (Extreme, Recommended, Minimal)',
              'Unlimited batch file compression with ZIP export',
              'Zero watermarks, advertisements, or software installs',
              'Works offline and on low-bandwidth connections',
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
            Find quick answers to common questions about compressing PDF documents online.
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
              Extract specific pages or separate large PDF files into individual files.
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
