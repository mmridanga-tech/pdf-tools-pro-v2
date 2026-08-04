import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, Sparkles, UserCheck } from 'lucide-react';
import { BLOG_POSTS, BlogPostItem } from '../../data/blogData';

interface RecommendedArticlesProps {
  category?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
  currentSlug?: string;
}

export const RecommendedArticles: React.FC<RecommendedArticlesProps> = ({
  category,
  limit = 3,
  title = 'Recommended PDF Guides & Articles',
  subtitle = 'Discover expert tutorials, workflow optimization strategies, and document security guides.',
  currentSlug,
}) => {
  // Filter posts by category or fallback to popular/featured posts
  let filtered = BLOG_POSTS.filter((post) => post.slug !== currentSlug);

  if (category && category.toLowerCase() !== 'all') {
    const categoryMatches = filtered.filter(
      (p) => p.category.toLowerCase().includes(category.toLowerCase()) || p.categorySlug.toLowerCase() === category.toLowerCase()
    );
    if (categoryMatches.length >= limit) {
      filtered = categoryMatches;
    }
  }

  const articlesToDisplay = filtered.slice(0, limit);

  if (articlesToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-slate-400 pl-1">{subtitle}</p>}
        </div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-xs text-red-400 font-bold rounded-xl transition-all shrink-0 w-fit"
        >
          <span>SmartPDF Knowledge Hub</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articlesToDisplay.map((article) => (
          <article
            key={article.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-red-500/40 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-lg"
          >
            <div className="space-y-3">
              <div className="h-40 overflow-hidden relative">
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || `${article.title} - SmartPDF AI Guide`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-red-400 text-[10px] font-bold border border-white/10 uppercase tracking-wider">
                  {article.category}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-red-400" /> {article.readTime}
                </span>
              </div>

              <div className="p-4 pt-1 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-slate-800/50 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-red-500/30"
                />
                <span className="text-[10px] font-bold text-slate-300">{article.author.name}</span>
              </div>
              <Link
                to={`/blog/${article.slug}`}
                className="text-[11px] text-red-400 font-bold hover:underline inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                Read Article <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
