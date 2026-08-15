import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';
import { SeoArticlePackage } from '../types';
import { api } from '../services/apiClient';
import { triggerFileDownload } from '../lib/pdfEngine';

interface AdminSeoGeneratorProps {
  onBack: () => void;
}

export const AdminSeoGenerator: React.FC<AdminSeoGeneratorProps> = ({ onBack }) => {
  const [topicTitle, setTopicTitle] = useState('How to Merge PDF Files Online Without Quality Loss');
  const [targetKeywords, setTargetKeywords] = useState('merge pdf, combine pdf online, free pdf joiner');
  const [category, setCategory] = useState('Tutorials & Guides');
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState<SeoArticlePackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topicTitle.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const data = await api.generateSeoContent({
        topicTitle,
        targetKeywords,
        category,
      });
      setArticle(data);
    } catch (err: any) {
      console.error('SEO Generator error:', err);
      setError(err?.message || 'Failed to generate SEO article package.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMarkdown = () => {
    if (!article) return;
    const md = `# ${article.seoTitle}
> ${article.subtitle}

**Meta Description**: ${article.metaDescription}  
**Slug**: \`${article.slug}\`  
**Read Time**: ${article.readTime} | **Author**: ${article.authorName} (${article.authorRole})

${article.sections
  .map(
    (s) => `## ${s.heading}
${s.paragraphs.join('\n\n')}
${s.listItems ? s.listItems.map((li) => `- ${li}`).join('\n') : ''}
${s.callout ? `\n> **${s.callout.title}**: ${s.callout.text}\n` : ''}`
  )
  .join('\n\n')}

## Frequently Asked Questions
${article.faqs.map((faq) => `### ${faq.question}\n${faq.answer}`).join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!article) return;
    triggerFileDownload(
      new Blob([JSON.stringify(article, null, 2)], { type: 'application/json' }),
      `${article.slug || 'seo_article'}.json`,
      'application/json'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          2,000+ Word EEAT SEO Studio
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
            <h2 className="font-bold text-slate-900 text-base mb-1">SEO Article Strategy</h2>
            <p className="text-xs text-slate-500 mb-4">
              Generate rank-ready, long-form content packages with internal link anchors and schema FAQs.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Topic Title:</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Keywords:</label>
                <input
                  type="text"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                >
                  <option>Tutorials & Guides</option>
                  <option>Security & Privacy</option>
                  <option>Enterprise AI Workflows</option>
                  <option>Document Best Practices</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topicTitle.trim()}
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating 2,000+ Words...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate SEO Article
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          {article ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/40 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{article.category}</span>
                  <h2 className="text-xl font-black text-slate-900">{article.seoTitle}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{article.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={downloadJson}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Meta Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Slug:</span>
                  <p className="font-mono text-slate-800">/blog/{article.slug}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Read Time:</span>
                  <p className="font-semibold text-slate-800">{article.readTime}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Meta Description:</span>
                  <p className="text-slate-700">{article.metaDescription}</p>
                </div>
              </div>

              {/* Article Sections Preview */}
              <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                {article.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{sec.heading}</h3>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                    {sec.listItems && (
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {sec.listItems.map((li, liIdx) => (
                          <li key={liIdx}>{li}</li>
                        ))}
                      </ul>
                    )}
                    {sec.callout && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                        <span className="font-bold">{sec.callout.title}:</span> {sec.callout.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FAQs */}
              {article.faqs && article.faqs.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Structured Schema FAQs</h3>
                  <div className="space-y-3">
                    {article.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <h4 className="font-bold text-slate-900 mb-1">{faq.question}</h4>
                        <p className="text-slate-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm mb-1">Awaiting Topic Input</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Enter your target keyword and topic title on the left to generate an EEAT-optimized 2000-word article package.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
