import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Tag,
  ChevronDown,
  Send,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Printer,
  ArrowUp,
  Quote,
  List,
  MessageCircle,
  Code
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { BLOG_POSTS, getBlogPostBySlug, BlogPostItem } from '../data/blogData';
import { useToast } from '../context/ToastContext';
import { RelatedTools } from '../components/seo/RelatedTools';

// Code Block component with Copy Code functionality
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl bg-[#0B0C0E] border border-slate-800 shadow-xl overflow-hidden font-mono text-xs sm:text-sm text-slate-200">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-red-500" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">{language || 'Snippet'}</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-sans"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-red-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [copiedLink, setCopiedLink] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll progress for reading bar & back to top button
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Match post by slug or alias
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0B] text-slate-300 space-y-4">
        <SEO title="Article Not Found - SmartPDF AI Blog" path="/blog" />
        <BookOpen className="w-12 h-12 text-slate-600" />
        <h1 className="text-2xl font-black text-white">Article Not Found</h1>
        <p className="text-xs text-slate-400 max-w-md">
          The requested blog post doesn't exist or may have been moved to a new clean URL.
        </p>
        <Link
          to="/blog"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
        >
          Return to Blog Hub
        </Link>
      </div>
    );
  }

  // Find index for Previous and Next navigation
  const currentIndex = BLOG_POSTS.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : BLOG_POSTS[BLOG_POSTS.length - 1];
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : BLOG_POSTS[0];

  // Related posts with fallback to guarantee 3 items
  const matchedRelated = BLOG_POSTS.filter(
    (p) => p.id !== post.id && (post.relatedSlugs?.includes(p.slug) || p.categorySlug === post.categorySlug)
  );
  const remainingPosts = BLOG_POSTS.filter((p) => p.id !== post.id && !matchedRelated.some((m) => m.id === p.id));
  const relatedPosts = [...matchedRelated, ...remainingPosts].slice(0, 3);

  const articleUrl = `https://smartpdfai.tech/blog/${post.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopiedLink(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    toast.success('Thank you for subscribing to the SmartPDF AI Digest!');
    setNewsletterEmail('');
  };

  // Structured Data Schema for Search Engines
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        headline: post.title,
        description: post.metaDescription,
        image: post.featuredImage,
        datePublished: post.publishDate,
        dateModified: '2026-08-03',
        author: {
          '@type': 'Person',
          name: post.author.name,
          jobTitle: post.author.role,
          url: 'https://smartpdfai.tech/author/mridanga-mondal',
          description: post.author.bio || 'Founder of SmartPDF AI, Electrical Engineer, and creator of privacy-first AI-powered PDF tools.',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SmartPDF AI',
          url: 'https://smartpdfai.tech',
        },
        keywords: post.keywords.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://smartpdfai.tech/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://smartpdfai.tech/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
      ...(post.faqs && post.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: post.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  // Helper to render formatted text with links [Text](url), code blocks, inline code, blockquotes, and bold text
  const renderFormattedText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Blockquote handling (lines starting with > )
    if (text.startsWith('> ')) {
      const quoteText = text.replace(/^>\s*/, '');
      return (
        <blockquote className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border-l-4 border-red-500 text-slate-200 italic text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-lg">
          <Quote className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">{renderFormattedText(quoteText)}</div>
        </blockquote>
      );
    }

    // Code block handling (starting and ending with ```)
    if (text.startsWith('```') && text.endsWith('```')) {
      const rawCode = text.slice(3, -3).trim();
      const lines = rawCode.split('\n');
      const firstLine = lines[0].trim();
      let language = 'code';
      let codeContent = rawCode;

      if (/^[a-zA-Z0-9_-]+$/.test(firstLine) && lines.length > 1) {
        language = firstLine;
        codeContent = lines.slice(1).join('\n');
      }

      return <CodeBlock code={codeContent} language={language} />;
    }

    // Token matching for [Link](url), `code`, and **bold**
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }

      const token = match[0];

      if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        if (linkMatch) {
          const label = linkMatch[1];
          const url = linkMatch[2];
          const isInternal = url.startsWith('/');

          if (isInternal) {
            parts.push(
              <Link
                key={match.index}
                to={url}
                className="text-red-400 font-bold underline hover:text-red-300 transition-colors"
              >
                {label}
              </Link>
            );
          } else {
            parts.push(
              <a
                key={match.index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 font-bold underline hover:text-red-300 transition-colors"
              >
                {label}
              </a>
            );
          }
        }
      } else if (token.startsWith('`') && token.endsWith('`')) {
        const codeText = token.slice(1, -1);
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-red-300 border border-slate-700/60 font-mono text-[11px] sm:text-xs font-semibold"
          >
            {codeText}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        const boldText = token.slice(2, -2);
        parts.push(
          <strong key={match.index} className="font-bold text-white">
            {boldText}
          </strong>
        );
      }

      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return <>{parts}</>;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-200 relative">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          nav, footer, aside, .no-print, button:not(.print-keep), .floating-share, .back-to-top {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main, header, section {
            border: none !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 0 20px 0 !important;
          }
          h1, h2, h3, h4, p, span, td, th {
            color: black !important;
          }
        }
      `}</style>

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900/80 z-50 pointer-events-none no-print">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Sticky Floating Share Bar */}
      <div className="fixed left-4 top-1/3 z-40 hidden xl:flex flex-col gap-2 p-2 bg-[#121215]/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl no-print">
        <button
          onClick={handleCopyLink}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer relative group"
          title="Copy Article Link"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            {copiedLink ? 'Copied!' : 'Copy Link'}
          </span>
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer relative group"
          title="Share on X (Twitter)"
        >
          <Twitter className="w-4 h-4" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            Share on X
          </span>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer relative group"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            Share on LinkedIn
          </span>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer relative group"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            Share on Facebook
          </span>
        </a>

        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${articleUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer relative group"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            Share on WhatsApp
          </span>
        </a>

        <button
          onClick={() => window.print()}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer relative group"
          title="Print Article"
        >
          <Printer className="w-4 h-4" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800 shadow-lg">
            Print Article
          </span>
        </button>
      </div>

      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        jsonLdSchema={schemaData}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap no-print" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">{post.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-semibold line-clamp-1 max-w-[200px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Back Link Button */}
        <div className="no-print">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-0.5 transition-transform" />
            Back to SmartPDF AI Knowledge Hub
          </button>
        </div>

        {/* Hero Section Card */}
        <header className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Meta Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5" title="Published Date">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> <span className="font-medium text-slate-300">Published:</span> {post.publishDate}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5" title="Last Updated Date">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> <span className="font-medium text-slate-300">Last Updated:</span> {post.lastUpdated || post.publishDate || 'August 4, 2026'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5" title="Reading Time">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> <span className="font-medium text-slate-300">Reading Time:</span> <span className="px-2 py-0.5 rounded bg-slate-800 text-red-400 font-bold text-[11px]">{post.readTime}</span>
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" /> {post.views.toLocaleString()} Readers
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {post.subtitle}
            </p>
          </div>

          {/* Author Details & Social Share Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            
            {/* Author Info */}
            <Link
              to={post.author.name.toLowerCase().includes('mridanga') ? '/author/mridanga-mondal' : '/author/mridanga-mondal'}
              className="flex items-center gap-3 group/author"
            >
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-red-500/30 group-hover/author:border-red-400 transition-colors"
              />
              <div>
                <p className="text-xs font-bold text-white group-hover/author:text-red-400 transition-colors flex items-center gap-1">
                  {post.author.name}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified Author" />
                </p>
                <p className="text-[11px] text-slate-400">{post.author.role}</p>
              </div>
            </Link>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Article Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Share on Twitter / X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${articleUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Print Article"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Jump to Table of Contents Quick Button for Mobile */}
        <div className="lg:hidden no-print">
          <button
            onClick={() => {
              const el = document.getElementById('table-of-contents');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setMobileTocOpen(true);
              }
            }}
            className="w-full py-2.5 px-4 bg-[#121215] border border-slate-800 hover:border-red-500/40 text-xs font-bold text-slate-200 hover:text-white rounded-2xl flex items-center justify-between transition-all shadow-lg cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <List className="w-4 h-4 text-red-500" /> Jump to Table of Contents ({post.sections.length} Sections)
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileTocOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Featured Image Placeholder / Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#121215] shadow-2xl group">
          <img
            src={post.featuredImage}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-64 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              // Fallback placeholder image
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-black/30" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono text-[11px]">
              SmartPDF AI Illustrated Technical Guide
            </span>
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px]">
              Updated for 2026 Standards
            </span>
          </div>
        </div>

        {/* Mobile Table of Contents Dropdown Container */}
        <div id="table-of-contents" className="lg:hidden bg-[#121215] border border-slate-800 rounded-2xl p-4 no-print scroll-mt-20">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-white cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-500" /> Table of Contents ({post.sections.length} Sections)
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileTocOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileTocOpen && (
            <ul className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              {post.sections.map((sec, idx) => (
                <li key={idx}>
                  <a
                    href={`#section-${idx}`}
                    onClick={() => setMobileTocOpen(false)}
                    className="hover:text-red-400 transition-colors block py-1"
                  >
                    {sec.heading}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block space-y-4 sticky top-24 h-fit">
            <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <BookOpen className="w-3.5 h-3.5 text-red-500" /> Table of Contents
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-300">
                {post.sections.map((sec, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="hover:text-red-400 transition-colors line-clamp-2 block py-0.5 border-l-2 border-transparent hover:border-red-500 pl-2 -ml-2"
                    >
                      {sec.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Share Box in Sidebar */}
            <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
              <p className="text-xs font-bold text-white">Found this useful?</p>
              <p className="text-[11px] text-slate-400">Share with colleagues or students.</p>
              <button
                onClick={handleCopyLink}
                className="w-full mt-2 py-2 px-3 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Article Link'}</span>
              </button>
            </div>
          </aside>

          {/* Article Text Content Column */}
          <main className="lg:col-span-3 space-y-10 sm:space-y-12 bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            
            {/* Editorial Review Note & Content Disclaimer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">Editorial Accuracy Note</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Reviewed for Accuracy
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  This article has been reviewed for accuracy and updated to reflect the latest PDF technologies and best practices.
                </p>
                <p className="text-[11px] text-slate-400 italic pt-0.5">
                  We regularly review and update our content to ensure accuracy and usefulness.
                </p>
              </div>
            </div>

            {post.sections.map((section, idx) => (
              <section key={idx} id={`section-${idx}`} className="space-y-5 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight border-b border-slate-800 pb-3">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((p, pIdx) => (
                  <div key={pIdx} className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed my-3">
                    {renderFormattedText(p)}
                  </div>
                ))}

                {/* Callout Box */}
                {section.callout && (
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 my-6 ${
                    section.callout.type === 'key-takeaway'
                      ? 'bg-red-500/10 border-red-500/30 text-slate-200'
                      : section.callout.type === 'warning' || section.callout.type === 'common-mistake'
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                      : section.callout.type === 'tip' || section.callout.type === 'best-practice'
                      ? 'bg-purple-500/10 border-purple-500/30 text-slate-200'
                      : 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {section.callout.type === 'key-takeaway' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                      {(section.callout.type === 'warning' || section.callout.type === 'common-mistake') && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {section.callout.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      {(section.callout.type === 'tip' || section.callout.type === 'best-practice') && <Sparkles className="w-4 h-4 text-purple-400" />}
                      <span className="text-white">{section.callout.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {renderFormattedText(section.callout.text)}
                    </p>
                  </div>
                )}

                {/* Step By Step Guide Cards */}
                {section.steps && (
                  <div className="space-y-3 pt-2">
                    {section.steps.map((step) => (
                      <div
                        key={step.number}
                        className="p-4 sm:p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex gap-4 items-start shadow-md"
                      >
                        <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {step.number}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs sm:text-sm font-bold text-white">{step.title}</h3>
                          <div className="text-xs sm:text-sm text-slate-400 leading-relaxed">{renderFormattedText(step.description)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bulleted List Items */}
                {section.listItems && (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-2 my-4">
                    {section.listItems.map((item, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2.5">
                        <span className="text-red-500 font-bold mt-1 shrink-0">•</span>
                        <span className="leading-relaxed">{renderFormattedText(item)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Comparison / Data Table */}
                {section.table && (
                  <div className="my-6 space-y-1">
                    <div className="text-[11px] text-slate-500 text-right sm:hidden italic">
                      ← Scroll table horizontally →
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl scrollbar-thin scrollbar-thumb-slate-700">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-200 border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-800/90 border-b border-slate-700 text-white font-bold">
                            {section.table.headers.map((header, hIdx) => (
                              <th key={hIdx} className="py-3.5 px-4 font-black tracking-wider uppercase text-[11px] sm:text-xs text-red-400 whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors odd:bg-slate-900/40 even:bg-slate-900/80">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={`py-3.5 px-4 text-xs sm:text-sm leading-relaxed ${cIdx === 0 ? 'font-bold text-white' : 'text-slate-300'}`}>
                                  {renderFormattedText(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            ))}

            {/* Interactive Tool CTA Banner */}
            {post.toolCta && (
              <div className="bg-gradient-to-r from-red-950/60 via-[#16161b] to-slate-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl text-center my-8">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{post.toolCta.title}</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {post.toolCta.description}
                  </p>
                </div>
                <Link
                  to={post.toolCta.link}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                >
                  {post.toolCta.buttonText} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Article Keywords Tag Cloud */}
            <div className="pt-6 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Topic Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-400"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </main>

        </div>

        {/* About the Author Section */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-black text-white">About the Author</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-red-500/40 shrink-0 shadow-md"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-white">{post.author.name}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
                  {post.author.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {post.author.bio}
              </p>
              <div className="pt-1 flex items-center gap-3">
                <Link
                  to="/author/mridanga-mondal"
                  className="text-xs text-red-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  View Author Profile & Articles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <HelpCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-black text-white">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {post.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 border-t border-slate-800/50 pt-3 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Previous and Next Article Navigation Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            to={`/blog/${prevPost.slug}`}
            className="bg-[#121215] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-center gap-4 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Previous Article</span>
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {prevPost.title}
              </p>
            </div>
          </Link>

          <Link
            to={`/blog/${nextPost.slug}`}
            className="bg-[#121215] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all group text-right"
          >
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Next Article</span>
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {nextPost.title}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </section>

        {/* Newsletter Subscription Box */}
        <section className="bg-gradient-to-r from-[#181216] via-[#121215] to-[#121620] border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl font-black text-white">Subscribe to the SmartPDF AI Weekly Digest</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get the latest PDF security guides, WebAssembly optimization tips, and Gemini AI workflows delivered straight to your inbox.
            </p>
          </div>

          {newsletterSubscribed ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
              <UserCheck className="w-4 h-4" /> You're subscribed! Welcome to our PDF developer community.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your work email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-600/20 shrink-0 cursor-pointer"
              >
                Subscribe Free
              </button>
            </form>
          )}
        </section>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="pt-4 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-500" /> Related Articles
              </h2>
              <Link to="/blog" className="text-xs text-red-400 font-bold hover:underline">
                View All Posts →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-[#121215] border border-slate-800 rounded-2xl overflow-hidden space-y-3 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-red-400 text-[10px] font-bold border border-white/10">
                        {rel.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                        <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal">
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link
                      to={`/blog/${rel.slug}`}
                      className="text-xs text-red-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Read Article <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related PDF Tools Section */}
        <div className="pt-2">
          <RelatedTools currentToolPath={post.toolCta?.link} limit={4} />
        </div>

      </div>

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl border border-red-400/30 transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group no-print back-to-top"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
