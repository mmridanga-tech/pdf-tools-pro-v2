import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Zap,
  Layers,
  Scissors,
  Minimize2,
  FileText,
  Lock,
  Unlock,
  Image as ImageIcon,
  Table,
  Cpu,
  Globe,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle,
  Info
} from 'lucide-react';
import { SEO } from '../SEO';
import { RecommendedArticles } from './RecommendedArticles';
import { RelatedTools } from './RelatedTools';
import { LandingPageData, LandingPageFeature } from '../../data/landingPagesData';

interface SEOLandingTemplateProps {
  data: LandingPageData;
  children?: React.ReactNode; // Interactive Tool Hero Widget
}

export const SEOLandingTemplate: React.FC<SEOLandingTemplateProps> = ({ data, children }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Helper to render icon based on name
  const renderIcon = (iconName: LandingPageFeature['iconName']) => {
    const props = { className: 'w-5 h-5 text-red-400' };
    switch (iconName) {
      case 'Shield':
        return <Shield {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'Minimize':
        return <Minimize2 {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Lock':
        return <Lock {...props} />;
      case 'Unlock':
        return <Unlock {...props} />;
      case 'Image':
        return <ImageIcon {...props} />;
      case 'Table':
        return <Table {...props} />;
      case 'Cpu':
        return <Cpu {...props} />;
      case 'Globe':
      default:
        return <Globe {...props} />;
    }
  };

  // Generate Combined JSON-LD Schema
  const canonicalUrl = `https://smartpdfai.tech${data.path}`;
  const graphSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        name: data.toolName,
        url: canonicalUrl,
        description: data.metaDescription,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All (Windows, macOS, Linux, iOS, Android)',
        browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SmartPDF AI',
          url: 'https://smartpdfai.tech',
        },
      },
      ...(data.howToSteps && data.howToSteps.length > 0
        ? [
            {
              '@type': 'HowTo',
              '@id': `${canonicalUrl}#howto`,
              name: `How to Use ${data.toolName}`,
              description: `Step-by-step instructions to use ${data.toolName} online for free.`,
              step: data.howToSteps.map((step) => ({
                '@type': 'HowToStep',
                position: step.stepNumber,
                name: step.title,
                text: step.description,
                url: `${canonicalUrl}#step-${step.stepNumber}`,
              })),
            },
          ]
        : []),
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: data.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
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
            name: data.category,
            item: 'https://smartpdfai.tech/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: data.toolName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200">
      <SEO
        title={data.seoTitle}
        description={data.metaDescription}
        path={data.path}
        jsonLdSchema={graphSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/" className="hover:text-white transition-colors">
            {data.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-bold">{data.toolName}</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{data.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {data.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            {data.heroSubtitle}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Zero Server Uploads</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Local Speed</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span>100% Free Forever</span>
            </div>
          </div>

          {/* Interactive Tool Widget Area */}
          {children && (
            <div className="pt-6">
              <div className="bg-[#121215] border border-slate-800/90 rounded-3xl p-4 sm:p-8 shadow-2xl shadow-red-500/5 text-left">
                {children}
              </div>
            </div>
          )}
        </section>

        {/* Deep Dive Content & Overview */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{data.overviewTitle}</h2>
              </div>
              {data.overviewParagraphs.map((para, idx) => (
                <p key={idx} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{data.whyUsTitle}</h3>
              </div>
              {data.whyUsParagraphs.map((para, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Powerful Key Features</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need for fast, secure document processing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#121215] border border-slate-800 hover:border-red-500/40 rounded-2xl p-6 space-y-3 transition-all duration-300 shadow-md group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {renderIcon(feature.iconName)}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use Section */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How to Use {data.toolName}</h2>
            <p className="text-xs sm:text-sm text-slate-400">Simple 4-step process to process your files in seconds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.howToSteps.map((step) => (
              <div key={step.stepNumber} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-black flex items-center justify-center">
                  {step.stepNumber}
                </span>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits & Technical Specs */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Benefits */}
          <div className="lg:col-span-7 bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Key Benefits for Users & Teams</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{benefit.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="lg:col-span-5 bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Info className="w-6 h-6 text-red-400" />
              <span>Technical Specifications</span>
            </h2>
            <div className="divide-y divide-slate-800 border-t border-b border-slate-800">
              {data.technicalSpecs.map((spec, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <span className="font-semibold text-slate-400">{spec.label}</span>
                  <span className="font-bold text-white text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Questions About {data.toolName}</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {data.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentToolPath={data.path} limit={4} />

        {/* Related Articles */}
        <RecommendedArticles category={data.relatedCategory} limit={3} />

        {/* Bottom Conversion CTA */}
        <section className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 border border-red-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Experience Faster, Private PDF Processing?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals using SmartPDF AI for instant, 100% private client-side document management.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-red-600/30 transition-all hover:scale-105"
            >
              <span>Explore All 25+ PDF Tools</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
