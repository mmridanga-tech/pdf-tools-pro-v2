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
    <section className="py-12 sm:py-16 bg-[#06070B] border-b border-white/[0.08] relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-rose-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-semibold text-red-400 mb-2.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-400" />
              <span>Knowledge & Engineering Guides</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs sm:text-sm font-bold border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md group"
            >
              <span>Browse All Articles</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id || article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="h-full"
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group relative h-full bg-[#10111A]/90 hover:bg-[#151624] rounded-[20px] border border-white/10 hover:border-red-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
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

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/80 text-red-400 border border-red-500/40 backdrop-blur-md shadow-md">
                        <Tag className="w-2.5 h-2.5 text-red-400" />
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4.5 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 mb-2 tracking-tight leading-snug transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 font-normal">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {article.author?.avatar ? (
                            <img
                              src={article.author.avatar}
                              alt={article.author.name}
                              width="22"
                              height="22"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                        <span className="text-slate-200 font-semibold truncate max-w-[100px]">
                          {article.author?.name || 'SmartPDF Team'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {article.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Read Button */}
                <div className="px-4.5 pb-4.5 pt-1 mt-auto">
                  <div className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 text-slate-200 group-hover:text-white font-bold text-xs transition-all duration-300 border border-white/10 group-hover:border-red-400/40 shadow-md">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
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
