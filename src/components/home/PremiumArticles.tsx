import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BlogPostItem } from '../../data/blogData';
import { BookOpen, ArrowRight, Tag, User, Calendar, Clock } from 'lucide-react';

interface PremiumArticlesProps {
  articles: BlogPostItem[];
}

export const PremiumArticles: React.FC<PremiumArticlesProps> = React.memo(({ articles }) => {
  return (
    <section className="py-24 sm:py-32 bg-[#06070B] border-b border-white/[0.08] relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-rose-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 sm:mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 mb-4 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-400" />
              <span>Knowledge & Engineering Guides</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight"
            >
              Latest Articles & Insights
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-bold border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md group"
            >
              <span>Browse All Articles</span>
              <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id || article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="h-full"
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group relative h-full bg-[#10111A]/90 hover:bg-[#151624] rounded-[24px] border border-white/10 hover:border-red-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <div>
                  {/* Image Container with Badge */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                    <img
                      src={article.featuredImage}
                      alt={article.imageAlt || article.title}
                      loading="lazy"
                      width="400"
                      height="225"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10111A] via-transparent to-transparent opacity-90" />

                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-black/80 text-red-400 border border-red-500/40 backdrop-blur-md shadow-md">
                        <Tag className="w-3 h-3 text-red-400" />
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 mb-3 tracking-tight leading-snug transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-slate-300/80 text-sm leading-relaxed mb-6 line-clamp-2 font-normal">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {article.author?.avatar ? (
                            <img
                              src={article.author.avatar}
                              alt={article.author.name}
                              width="26"
                              height="26"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                        <span className="text-slate-200 font-semibold truncate max-w-[110px]">
                          {article.author?.name || 'SmartPDF Team'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 shrink-0">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {article.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Read Button */}
                <div className="px-6 pb-6 pt-2 mt-auto">
                  <div className="inline-flex items-center justify-between w-full px-4.5 py-3 rounded-xl bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 text-slate-200 group-hover:text-white font-bold text-xs sm:text-sm transition-all duration-300 border border-white/10 group-hover:border-red-400/40 shadow-md">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
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
