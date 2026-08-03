import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Copy,
  Globe,
  Share2,
  Search,
  Image as ImageIcon,
  Tag,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Save,
  RefreshCw,
  Zap,
  Check,
  Layers,
  Link2,
  Code,
  Eye,
  Clock,
  User,
  ShieldCheck,
  AlignLeft,
  Settings
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { BlogPostItem, publishBlogPost, BLOG_CATEGORIES } from '../data/blogData';

const PRESET_TOPICS = [
  'How to Merge Multiple PDF Files Without Losing Quality',
  'How to Compress PDF Documents for Email Attachments',
  'Step-by-Step Guide: How to Convert PDF to Word Online',
  'How to Password Protect PDF Files Securely in 2026',
  'Top 10 Free Online PDF Tools for Modern Remote Work',
];

export const AdminContentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [topicTitle, setTopicTitle] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tutorials');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'content' | 'faqs' | 'schema' | 'social' | 'links' | 'image'
  >('overview');

  const [generatedArticle, setGeneratedArticle] = useState<BlogPostItem | null>(null);
  const [featuredImagePrompt, setFeaturedImagePrompt] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateContent = async (titleToUse?: string) => {
    const finalTitle = (titleToUse || topicTitle).trim();
    if (!finalTitle) {
      toast.error('Please enter an article title or topic.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing SERP intent & semantic keywords...');

    try {
      setTimeout(() => setGenerationStep('Drafting 2000-word EEAT article structure...'), 2000);
      setTimeout(() => setGenerationStep('Building JSON-LD Schema & Social Cards...'), 5000);

      const response = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicTitle: finalTitle,
          targetKeywords: targetKeywords.trim(),
          category: selectedCategory,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate article package.');
      }

      const data = json.data;

      const newPost: BlogPostItem = {
        id: 'gen-' + Date.now(),
        slug: data.slug || finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: data.seoTitle || finalTitle,
        subtitle: data.subtitle || 'Complete step-by-step guide with expert insights.',
        excerpt: data.excerpt || 'Learn how to optimize your document workflows effectively.',
        category: data.category || 'Tutorials & Guides',
        categorySlug: data.categorySlug || 'tutorials',
        author: {
          name: data.authorName || 'Elena Rostova',
          role: data.authorRole || 'Senior Document Workflow Architect',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        },
        publishDate: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        readTime: data.readTime || '12 min read',
        featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
        featured: true,
        popular: true,
        views: 1250,
        metaTitle: data.seoTitle || finalTitle,
        metaDescription: data.metaDescription || 'Complete guide to optimizing PDF files.',
        keywords: data.keywords || [finalTitle.toLowerCase()],
        relatedSlugs: data.relatedSlugs || ['how-to-merge-pdf-files-online', 'how-to-compress-pdf-without-losing-quality'],
        faqs: data.faqs || [],
        toolCta: data.toolCta || {
          title: 'Ready to Process Your PDFs?',
          description: 'Try SmartPDF AI free online tool in your browser.',
          buttonText: 'Try Free Tool',
          link: '/merge-pdf',
        },
        sections: data.sections || [],
      };

      setGeneratedArticle(newPost);
      setFeaturedImagePrompt(data.featuredImagePrompt || 'Professional document workflow dashboard illustration');
      toast.success('SEO Content Package generated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error generating content. Please check API Key.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handlePublish = () => {
    if (!generatedArticle) return;
    publishBlogPost(generatedArticle);
    toast.success('Article published to SmartPDF AI Blog!');
    setTimeout(() => {
      navigate(`/blog/${generatedArticle.slug}`);
    }, 1000);
  };

  // Schema Generators
  const articleJsonLd = generatedArticle
    ? JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: generatedArticle.title,
          description: generatedArticle.metaDescription,
          image: generatedArticle.featuredImage,
          author: {
            '@type': 'Person',
            name: generatedArticle.author.name,
            jobTitle: generatedArticle.author.role,
          },
          publisher: {
            '@type': 'Organization',
            name: 'SmartPDF AI',
            logo: {
              '@type': 'ImageObject',
              url: 'https://smartpdfai.tech/icon.png',
            },
          },
          datePublished: new Date().toISOString().split('T')[0],
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://smartpdfai.tech/blog/${generatedArticle.slug}`,
          },
        },
        null,
        2
      )
    : '';

  const faqJsonLd = generatedArticle
    ? JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: generatedArticle.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
        null,
        2
      )
    : '';

  const breadcrumbJsonLd = generatedArticle
    ? JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
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
              name: 'Blog',
              item: 'https://smartpdfai.tech/blog',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: generatedArticle.title,
              item: `https://smartpdfai.tech/blog/${generatedArticle.slug}`,
            },
          ],
        },
        null,
        2
      )
    : '';

  // Calculate approximate total word count
  const calculateTotalWords = () => {
    if (!generatedArticle) return 0;
    let text = generatedArticle.title + ' ' + generatedArticle.subtitle + ' ' + generatedArticle.excerpt;
    generatedArticle.sections.forEach((sec) => {
      text += ' ' + sec.heading;
      if (sec.paragraphs) text += ' ' + sec.paragraphs.join(' ');
      if (sec.listItems) text += ' ' + sec.listItems.join(' ');
      if (sec.steps) text += ' ' + sec.steps.map((s) => s.title + ' ' + s.description).join(' ');
      if (sec.callout) text += ' ' + sec.callout.title + ' ' + sec.callout.text;
    });
    generatedArticle.faqs.forEach((f) => {
      text += ' ' + f.question + ' ' + f.answer;
    });
    return text.split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <SEO
        title="Admin SEO Content Generator | SmartPDF AI"
        description="Enterprise AI-powered SEO content generator for 2000-word articles, JSON-LD schemas, Open Graph tags, and instant blog publishing."
        path="/admin/content-generator"
      />

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin"
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  Admin Portal
                </span>
                <span className="text-slate-500 text-xs">/</span>
                <span className="text-xs text-slate-400">Content Studio</span>
              </div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                AI SEO Content Generator
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {generatedArticle && (
              <button
                onClick={handlePublish}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-red-900/30 text-sm transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>One-Click Publish to Blog</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Topic Input Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Target Topic or Working Article Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. How to Merge Multiple PDF Files Without Losing Quality"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-base"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Target SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  placeholder="e.g. merge multiple pdfs, free pdf joiner, lossless pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {BLOG_CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Quick Sample SEO Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TOPICS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setTopicTitle(preset);
                      handleGenerateContent(preset);
                    }}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleGenerateContent()}
                disabled={isGenerating || !topicTitle.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-red-900/30 flex items-center justify-center space-x-3 transition-all text-base"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating 2000-Word Package...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white/20" />
                    <span>Generate Complete SEO Package</span>
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-800/30 rounded-lg text-xs text-red-300 flex items-center space-x-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{generationStep}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Workspace */}
        {generatedArticle && (
          <div className="space-y-6">
            {/* Top Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Total Word Count</span>
                <span className="text-xl font-bold text-emerald-400">
                  ~{calculateTotalWords()} words
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Article Sections</span>
                <span className="text-xl font-bold text-white">
                  {generatedArticle.sections.length} Sections
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Generated FAQs</span>
                <span className="text-xl font-bold text-white">
                  {generatedArticle.faqs.length} FAQs
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Internal Tool CTA</span>
                <span className="text-xl font-bold text-rose-400">
                  {generatedArticle.toolCta.link}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-800 flex space-x-2 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Meta & Overview', icon: Globe },
                { id: 'content', label: 'Article Text (2000 Words)', icon: FileText },
                { id: 'faqs', label: 'FAQs (10 Items)', icon: HelpCircle },
                { id: 'schema', label: 'JSON-LD Schemas', icon: Code },
                { id: 'social', label: 'Open Graph & Twitter', icon: Share2 },
                { id: 'links', label: 'Internal Links', icon: Link2 },
                { id: 'image', label: 'Featured Image Prompt', icon: ImageIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Meta & Overview */}
            {activeTab === 'overview' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-500" />
                    Generated SEO Metadata
                  </h3>
                  <button
                    onClick={handlePublish}
                    className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEO Title */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-semibold">SEO Meta Title</label>
                      <span className="text-slate-500">
                        {generatedArticle.metaTitle.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={generatedArticle.metaTitle}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, metaTitle: e.target.value, title: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-semibold">URL Slug</label>
                      <button
                        onClick={() => handleCopy(`/blog/${generatedArticle.slug}`, 'slug')}
                        className="text-red-400 hover:underline text-[11px]"
                      >
                        Copy Link
                      </button>
                    </div>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400">
                      <span className="text-slate-600 text-xs mr-1">/blog/</span>
                      <input
                        type="text"
                        value={generatedArticle.slug}
                        onChange={(e) =>
                          setGeneratedArticle({ ...generatedArticle, slug: e.target.value })
                        }
                        className="bg-transparent text-white focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Canonical URL */}
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold text-xs">Canonical URL</label>
                    <input
                      type="text"
                      readOnly
                      value={`https://smartpdfai.tech/blog/${generatedArticle.slug}`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-400"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold text-xs">Category</label>
                    <input
                      type="text"
                      value={generatedArticle.category}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, category: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-semibold">Meta Description</label>
                      <span className="text-slate-500">
                        {generatedArticle.metaDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={generatedArticle.metaDescription}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, metaDescription: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {/* Subtitle & Excerpt */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-slate-300 font-semibold text-xs">Subtitle / Intro Deck</label>
                    <input
                      type="text"
                      value={generatedArticle.subtitle}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, subtitle: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Google Search Result Preview Mockup */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                    Google Search Result Visual Mockup
                  </span>
                  <div className="text-xs text-slate-400 flex items-center space-x-1 truncate">
                    <span>https://smartpdfai.tech</span>
                    <span>›</span>
                    <span>blog</span>
                    <span>›</span>
                    <span className="text-slate-300">{generatedArticle.slug}</span>
                  </div>
                  <h4 className="text-lg font-medium text-blue-400 hover:underline cursor-pointer truncate">
                    {generatedArticle.metaTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {generatedArticle.metaDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Article Text (2000 Words) */}
            {activeTab === 'content' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-500" />
                      Generated 2000-Word Article Content
                    </h3>
                    <p className="text-xs text-slate-400">
                      Structured into EEAT headings, paragraphs, lists, steps, and callout boxes.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(JSON.stringify(generatedArticle.sections, null, 2), 'sections')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw JSON</span>
                  </button>
                </div>

                {/* Article Header Mockup */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 text-xs text-red-400 font-medium">
                    <span>{generatedArticle.category}</span>
                    <span>•</span>
                    <span>{generatedArticle.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{generatedArticle.title}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{generatedArticle.subtitle}</p>
                </div>

                {/* Sections Render */}
                <div className="space-y-8">
                  {generatedArticle.sections.map((sec, idx) => (
                    <div key={idx} className="border border-slate-800 bg-slate-950/60 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-400">
                          Section {idx + 1}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white border-b border-slate-800/80 pb-2">
                        {sec.heading}
                      </h3>

                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx} className="text-sm text-slate-300 leading-relaxed">
                          {p}
                        </p>
                      ))}

                      {sec.listItems && sec.listItems.length > 0 && (
                        <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 pl-2">
                          {sec.listItems.map((li, lIdx) => (
                            <li key={lIdx}>{li}</li>
                          ))}
                        </ul>
                      )}

                      {sec.steps && sec.steps.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {sec.steps.map((st) => (
                            <div
                              key={st.number}
                              className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-start space-x-3"
                            >
                              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {st.number}
                              </span>
                              <div>
                                <h4 className="text-sm font-semibold text-white">{st.title}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.callout && (
                        <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-4 space-y-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                            {sec.callout.title}
                          </span>
                          <p className="text-xs text-red-200 leading-relaxed">{sec.callout.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: FAQs */}
            {activeTab === 'faqs' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-red-500" />
                    Generated FAQs ({generatedArticle.faqs.length} Questions)
                  </h3>
                  <button
                    onClick={() => handleCopy(faqJsonLd, 'faq-json')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy FAQ Schema</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedArticle.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="text-red-400 text-xs font-mono">Q{idx + 1}:</span>
                          {faq.question}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-red-500/40">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: JSON-LD Schemas */}
            {activeTab === 'schema' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-red-500" />
                    Structured Data (JSON-LD Schemas)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ready to embed into html head for rich snippets in Google Search Results.
                  </p>
                </div>

                {/* Article Schema */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      1. Article Schema (@type: BlogPosting)
                    </span>
                    <button
                      onClick={() => handleCopy(articleJsonLd, 'article-schema')}
                      className="text-xs text-red-400 hover:underline flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'article-schema' ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                    {articleJsonLd}
                  </pre>
                </div>

                {/* FAQ Schema */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      2. FAQ Schema (@type: FAQPage)
                    </span>
                    <button
                      onClick={() => handleCopy(faqJsonLd, 'faq-schema')}
                      className="text-xs text-red-400 hover:underline flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'faq-schema' ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                    {faqJsonLd}
                  </pre>
                </div>

                {/* Breadcrumb Schema */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      3. Breadcrumb Schema (@type: BreadcrumbList)
                    </span>
                    <button
                      onClick={() => handleCopy(breadcrumbJsonLd, 'bc-schema')}
                      className="text-xs text-red-400 hover:underline flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'bc-schema' ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-40">
                    {breadcrumbJsonLd}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 5: Open Graph & Twitter */}
            {activeTab === 'social' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-red-500" />
                    Open Graph & Twitter Social Cards
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OG Meta */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Open Graph Meta Tags
                    </h4>
                    <div className="space-y-2 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">&lt;meta property="og:title" content=</span>
                        <span className="text-amber-300">"{generatedArticle.metaTitle}"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta property="og:description" content=</span>
                        <span className="text-amber-300">"{generatedArticle.metaDescription}"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta property="og:type" content=</span>
                        <span className="text-amber-300">"article"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta property="og:url" content=</span>
                        <span className="text-amber-300">
                          "https://smartpdfai.tech/blog/{generatedArticle.slug}"
                        </span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta property="og:image" content=</span>
                        <span className="text-amber-300">"{generatedArticle.featuredImage}"</span> /&gt;
                      </div>
                    </div>
                  </div>

                  {/* Twitter Card Meta */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Twitter Card Meta Tags
                    </h4>
                    <div className="space-y-2 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">&lt;meta name="twitter:card" content=</span>
                        <span className="text-amber-300">"summary_large_image"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta name="twitter:title" content=</span>
                        <span className="text-amber-300">"{generatedArticle.metaTitle}"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta name="twitter:description" content=</span>
                        <span className="text-amber-300">"{generatedArticle.metaDescription}"</span> /&gt;
                      </div>
                      <div>
                        <span className="text-slate-500">&lt;meta name="twitter:image" content=</span>
                        <span className="text-amber-300">"{generatedArticle.featuredImage}"</span> /&gt;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Card Visual Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Social Media Card Visual Preview
                  </span>
                  <div className="max-w-md bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={generatedArticle.featuredImage}
                      alt="Social Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        smartpdfai.tech
                      </span>
                      <h5 className="text-sm font-bold text-white line-clamp-1">
                        {generatedArticle.title}
                      </h5>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {generatedArticle.metaDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Internal Links */}
            {activeTab === 'links' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-red-500" />
                    Internal Link Architecture & Contextual Anchor Targets
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { link: '/merge-pdf', anchor: 'merge PDF files', tool: 'Merge PDF Tool' },
                    { link: '/split-pdf', anchor: 'split PDF pages', tool: 'Split PDF Tool' },
                    { link: '/compress-pdf', anchor: 'compress PDF files', tool: 'Compress PDF Tool' },
                    { link: '/pdf-to-word', anchor: 'convert PDF to Word', tool: 'PDF to Word Tool' },
                    { link: '/blog', anchor: 'SmartPDF AI Blog', tool: 'Knowledge Hub' },
                  ].map((target) => (
                    <div
                      key={target.link}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-red-400 block">
                          Target: {target.tool}
                        </span>
                        <code className="text-xs text-emerald-400 font-mono">
                          [{target.anchor}]({target.link})
                        </code>
                      </div>
                      <Link
                        to={target.link}
                        target="_blank"
                        className="text-slate-500 hover:text-white p-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 7: Featured Image Prompt */}
            {activeTab === 'image' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-red-500" />
                    Featured Image & AI Generation Prompt
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        value={generatedArticle.featuredImage}
                        onChange={(e) =>
                          setGeneratedArticle({ ...generatedArticle, featuredImage: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Midjourney / Imagen / DALL-E AI Image Generation Prompt
                      </label>
                      <textarea
                        rows={4}
                        value={featuredImagePrompt}
                        onChange={(e) => setFeaturedImagePrompt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-amber-300 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(featuredImagePrompt, 'image-prompt')}
                        className="mt-2 text-xs text-red-400 hover:underline flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <span className="text-xs text-slate-400 block">Current Featured Image Preview</span>
                    <img
                      src={generatedArticle.featuredImage}
                      alt="Featured Preview"
                      className="rounded-xl border border-slate-800 shadow-2xl max-h-64 object-cover mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
