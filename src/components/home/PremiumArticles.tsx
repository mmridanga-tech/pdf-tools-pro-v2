import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BlogPostItem } from '../../data/blogData';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface PremiumArticlesProps {
  articles: BlogPostItem[];
}

export const PremiumArticles: React.FC<PremiumArticlesProps> = React.memo(({ articles }) => {
  const displayedArticles = useMemo(() => {
    return articles.slice(0, 3);
  }, [articles]);

  return (
    <section className="py-10 sm:py-14 bg-[#08090d] border-b border-white/[0.06] relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-3 border-b border-white/[0.06] gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Latest Insights
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-normal mt-1">
              Practical ideas for smarter document workflows.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0 self-start sm:self-auto group"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {displayedArticles.map((article, idx) => (
            <motion.div
              key={article.id || article.slug}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="h-full"
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-white/[0.06] bg-[#0c0d14] p-3.5 sm:p-4 hover:bg-[#121420] hover:border-white/[0.12] transition-all duration-200 focus:outline-none"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900 mb-3">
                  <img
                    src={article.featuredImage}
                    alt={article.imageAlt || article.title}
                    loading="lazy"
                    width="400"
                    height="225"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  />
                  {article.category && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-black/70 text-slate-300 backdrop-blur-md border border-white/10">
                        {article.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 mt-0.5" />
                    </div>

                    {article.excerpt && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Metadata footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-white/[0.04]">
                    <span>{article.publishDate}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

PremiumArticles.displayName = 'PremiumArticles';


