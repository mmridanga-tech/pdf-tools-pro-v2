import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Eye,
  User,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Tag
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { BLOG_POSTS, BlogPostItem } from '../data/blogData';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  // Find post matching slug
  const post = BLOG_POSTS.find((p) => p.slug === slug);

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

  // Related posts
  const relatedPosts = BLOG_POSTS.filter((p) => post.relatedSlugs?.includes(p.slug));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://smartpdfai.tech/blog/${post.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://smartpdfai.tech/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.metaDescription,
    image: post.author.avatar,
    datePublished: '2026-08-01',
    dateModified: '2026-08-03',
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SmartPDF AI',
      url: 'https://smartpdfai.tech',
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10 px-4 sm:px-6 lg:px-8 text-slate-200">
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        jsonLdSchema={articleJsonLd}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-semibold">{post.category}</span>
        </nav>

        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" /> Back to Knowledge Center
          </button>
        </div>

        {/* Article Header Card */}
        <header className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              {post.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()} views
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            {post.subtitle}
          </p>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            {/* Author Badge */}
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <p className="text-xs font-bold text-white">{post.author.name}</p>
                <p className="text-[11px] text-slate-400">{post.author.role}</p>
              </div>
            </div>

            {/* Share Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Article Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://smartpdfai.tech/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://smartpdfai.tech/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* Main Article Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block space-y-4 sticky top-24 h-fit">
            <div className="bg-[#121215] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-500" /> In This Article
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-300">
                {post.sections.map((sec, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="hover:text-red-400 transition-colors line-clamp-2 block py-0.5"
                    >
                      {sec.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Article Text Content Column */}
          <main className="lg:col-span-3 space-y-8 bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {post.sections.map((section, idx) => (
              <section key={idx} id={`section-${idx}`} className="space-y-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight border-b border-slate-800 pb-2">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((p, pIdx) => (
                  <p key={pIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Callout Box */}
                {section.callout && (
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 ${
                    section.callout.type === 'key-takeaway'
                      ? 'bg-red-500/10 border-red-500/30 text-slate-200'
                      : section.callout.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                      : 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {section.callout.type === 'key-takeaway' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                      {section.callout.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {section.callout.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      {section.callout.type === 'tip' && <Sparkles className="w-4 h-4 text-purple-400" />}
                      <span className="text-white">{section.callout.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {section.callout.text}
                    </p>
                  </div>
                )}

                {/* Step By Step Guide Cards */}
                {section.steps && (
                  <div className="space-y-3 pt-2">
                    {section.steps.map((step) => (
                      <div
                        key={step.number}
                        className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex gap-4 items-start"
                      >
                        <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {step.number}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-white">{step.title}</h3>
                          <p className="text-xs text-slate-400 leading-normal">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List Items */}
                {section.listItems && (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-2">
                    {section.listItems.map((item, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Interactive Tool CTA Banner */}
            {post.toolCta && (
              <div className="bg-gradient-to-r from-red-950/60 via-[#16161b] to-slate-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl text-center">
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
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Article Keywords:
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

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-5 h-5 text-red-500" /> Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-[#121215] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between group hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-red-400 text-[10px] font-bold">
                      {rel.category}
                    </span>
                    <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                      <Link to={`/blog/${rel.slug}`}>
                        {rel.title}
                      </Link>
                    </h3>
                  </div>
                  <Link
                    to={`/blog/${rel.slug}`}
                    className="text-xs text-red-400 font-bold hover:underline inline-flex items-center gap-1 pt-2"
                  >
                    Read More <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
