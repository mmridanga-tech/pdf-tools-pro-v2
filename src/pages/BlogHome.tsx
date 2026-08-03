import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Eye,
  ArrowRight,
  Filter,
  User,
  Calendar,
  ChevronRight,
  Tag,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { BLOG_POSTS, BLOG_CATEGORIES, BlogPostItem } from '../data/blogData';

export const BlogHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered posts based on search query & selected category
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' || post.categorySlug === selectedCategory;
      
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.subtitle.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.keywords.some((kw) => kw.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Featured posts
  const featuredPosts = useMemo(() => {
    return BLOG_POSTS.filter((p) => p.featured);
  }, []);

  // Popular posts sorted by views
  const popularPosts = useMemo(() => {
    return [...BLOG_POSTS].sort((a, b) => b.views - a.views).slice(0, 4);
  }, []);

  // JSON-LD Schema for Blog
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SmartPDF AI Knowledge Center & Blog',
    description: 'Expert guides, productivity tutorials, AI document strategies, and security insights for PDF workflows.',
    url: 'https://smartpdfai.tech/blog',
    publisher: {
      '@type': 'Organization',
      name: 'SmartPDF AI',
      url: 'https://smartpdfai.tech',
    },
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://smartpdfai.tech/blog/${post.slug}`,
      datePublished: '2026-08-01',
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10 px-4 sm:px-6 lg:px-8 text-slate-200">
      <SEO
        title="PDF & AI Knowledge Center - SmartPDF AI Blog"
        description="Expert guides, productivity tutorials, AI document analysis tips, and security best practices for PDF workflows."
        path="/blog"
        jsonLdSchema={blogJsonLd}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <BookOpen className="w-4 h-4" /> SmartPDF AI Knowledge Hub & Engineering Insights
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">PDF Workflows</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Discover in-depth tutorials, AI document intelligence techniques, secure PDF encryption tips, and format conversion guides written by document software engineers.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, or topics (e.g. merge, compress, OCR, Gemini)..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-11 pr-10 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold bg-slate-800 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {BLOG_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Section (Shown when no search query active) */}
        {!searchQuery && selectedCategory === 'all' && featuredPosts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Featured Articles
              </h2>
              <span className="text-xs text-slate-500 font-semibold">Handpicked Expert Guides</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Main Featured Hero Card */}
              <div className="lg:col-span-2 bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-slate-700 transition-all relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
                      {featuredPosts[0].category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredPosts[0].readTime}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {featuredPosts[0].views.toLocaleString()} views
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition-colors leading-tight">
                    <Link to={`/blog/${featuredPosts[0].slug}`}>
                      {featuredPosts[0].title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {featuredPosts[0].excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredPosts[0].author.avatar}
                      alt={featuredPosts[0].author.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{featuredPosts[0].author.name}</p>
                      <p className="text-[10px] text-slate-500">{featuredPosts[0].author.role}</p>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${featuredPosts[0].slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Secondary Featured Cards */}
              <div className="space-y-6 flex flex-col justify-between">
                {featuredPosts.slice(1, 3).map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#121215] border border-slate-800 rounded-3xl p-6 space-y-4 group hover:border-slate-700 transition-all flex-1 flex flex-col justify-between shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{post.readTime}</span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{post.publishDate}</span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-red-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Read <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout: Articles Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Articles List (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory === 'all'
                  ? 'Latest Articles & Tutorials'
                  : BLOG_CATEGORIES.find((c) => c.slug === selectedCategory)?.name}
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-[#121215] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <Filter className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Matching Articles Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms or select another topic category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[#121215] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition-all shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-red-400 text-[10px] font-bold">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover border border-slate-700"
                        />
                        <span className="text-[11px] font-medium text-slate-300">{post.author.name}</span>
                      </div>

                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-red-400 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Read <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Popular Articles Widget */}
            <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Popular Guides
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-slate-800/60">
                {popularPosts.map((post, index) => (
                  <div key={post.id} className={`${index > 0 ? 'pt-3' : ''} space-y-1 group`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-extrabold text-red-500">#{index + 1}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors leading-snug">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick PDF Tool CTA Banner */}
            <div className="bg-gradient-to-br from-red-950/40 via-[#121215] to-slate-900 border border-red-500/20 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Need to Process a PDF?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Try SmartPDF AI’s browser-native tools to merge, compress, split, OCR, or chat with documents for free.
                </p>
              </div>
              <Link
                to="/"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                Launch Tool Suite <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
