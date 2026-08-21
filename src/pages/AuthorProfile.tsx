import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Globe,
  Github,
  Linkedin,
  Twitter,
  BookOpen,
  Cpu,
  ShieldCheck,
  Sparkles,
  Code2,
  Zap,
  Award,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ChevronRight,
  Calendar,
  Clock,
  Eye,
  FileText,
  Layers,
  Lock,
  Terminal,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  Target,
  Share2
} from 'lucide-react';
import { BLOG_POSTS, BlogPostItem } from '../data/blogData';

export const AuthorProfile: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const authorDetails = {
    name: 'Mridanga Mondal',
    role: 'Founder of SmartPDF AI & Electrical Engineer',
    company: 'SmartPDF AI',
    email: 'mmridanga@gmail.com',
    location: 'Kolkata, India / Global Remote',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Mridanga Mondal is the founder of SmartPDF AI and an Electrical Engineer with experience in document workflows, PDF tools, OCR, productivity software, and AI-powered web applications. He focuses on creating secure, privacy-first, and easy-to-use PDF solutions.',
    mission: 'To empower students, working professionals, and global enterprises with ultra-fast, zero-knowledge browser utilities that process sensitive document workflows 100% locally inside user RAM memory.',
    socials: {
      github: 'https://github.com/mmridanga',
      linkedin: 'https://linkedin.com/in/mridanga-mondal',
      twitter: 'https://twitter.com/mridangamondal',
      website: 'https://smartpdfai.tech',
    }
  };

  // Filter articles written by Mridanga Mondal, or fallback to top technical articles
  const authorArticles = BLOG_POSTS.filter(
    (post) =>
      post.author.name.toLowerCase().includes('mridanga') ||
      post.id === '11' ||
      post.id === '10' ||
      post.id === '3' ||
      post.id === '7'
  );

  useEffect(() => {
    // Set page title and meta tags
    document.title = `${authorDetails.name} - ${authorDetails.role} at ${authorDetails.company}`;

    // Canonical tag
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = 'https://smartpdfai.tech/author/mridanga-mondal';

    // Meta description
    let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = authorDetails.bio;

    // Person Schema JSON-LD
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': authorDetails.name,
      'jobTitle': authorDetails.role,
      'worksFor': {
        '@type': 'Organization',
        'name': authorDetails.company,
        'url': 'https://smartpdfai.tech',
      },
      'email': `mailto:${authorDetails.email}`,
      'url': 'https://smartpdfai.tech/author/mridanga-mondal',
      'image': authorDetails.avatar,
      'description': authorDetails.bio,
      'knowsAbout': [
        'PDF Technologies',
        'Browser-Based Computing',
        'WebAssembly',
        'Optical Character Recognition (OCR)',
        'Document Workflow Automation',
        'Electrical Engineering',
        'AI Document Intelligence',
        'React & TypeScript Software Development'
      ],
      'sameAs': [
        authorDetails.socials.github,
        authorDetails.socials.linkedin,
        authorDetails.socials.twitter,
        authorDetails.socials.website
      ]
    };

    // Breadcrumb Schema JSON-LD
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://smartpdfai.tech/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Blog',
          'item': 'https://smartpdfai.tech/blog'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Authors',
          'item': 'https://smartpdfai.tech/blog'
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': authorDetails.name,
          'item': 'https://smartpdfai.tech/author/mridanga-mondal'
        }
      ]
    };

    const scriptPerson = document.createElement('script');
    scriptPerson.type = 'application/ld+json';
    scriptPerson.id = 'person-schema-jsonld';
    scriptPerson.text = JSON.stringify(personSchema);
    document.head.appendChild(scriptPerson);

    const scriptBreadcrumb = document.createElement('script');
    scriptBreadcrumb.type = 'application/ld+json';
    scriptBreadcrumb.id = 'author-breadcrumb-jsonld';
    scriptBreadcrumb.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(scriptBreadcrumb);

    return () => {
      document.getElementById('person-schema-jsonld')?.remove();
      document.getElementById('author-breadcrumb-jsonld')?.remove();
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(authorDetails.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const skills = [
    {
      title: 'Document Workflow Automation',
      description: 'Designing lossless client-side pipelines for merging, splitting, reordering, and compressing PDF files without layout degradation.',
      icon: Layers,
      color: 'from-red-500 to-rose-600',
    },
    {
      title: 'WebAssembly & Client-Side PDF Engines',
      description: 'Compiling high-performance native PDF & C/C++ libraries into WASM modules to execute 100% inside user browser RAM memory.',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Optical Character Recognition (OCR) & AI',
      description: 'Integrating Tesseract OCR engines and Google Gemini AI models for smart document chat, automated text extraction, and indexing.',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Browser Security & Cryptography',
      description: 'Architecting 256-bit AES client-side encryption, permission locking, ephemeral memory purges, and zero-knowledge data flows.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'High-Performance Web Applications',
      description: 'Building modern, scalable user interfaces using React 19, TypeScript, Vite, and Tailwind CSS optimized for accessibility.',
      icon: Code2,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Electrical Engineering & Signal Optimization',
      description: 'Applying hardware signal processing theory, algorithmic efficiency, and systemic problem-solving to modern web software.',
      icon: Zap,
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const technologies = [
    'React 19',
    'TypeScript',
    'Vite',
    'Tailwind CSS',
    'WebAssembly (WASM)',
    'PDF-Lib',
    'Tesseract.js OCR',
    'Google Gemini AI API',
    'Node.js & Express',
    'Web Crypto API',
    'Signal Processing',
    'Docker & Cloud Run'
  ];

  const experience = [
    {
      period: '2024 — Present',
      role: 'Founder & Chief Architect',
      company: 'SmartPDF AI',
      description: 'Pioneered zero-knowledge client-side PDF productivity software. Architected WebAssembly file compilation, 256-bit AES encryption tools, and Gemini AI document chat integrations reaching thousands of daily global users.',
      highlights: [
        'Built 18+ browser-native PDF utilities with 100% local RAM execution',
        'Integrated Gemini AI for multi-page document summarization & OCR',
        'Achieved 0ms server upload latency by keeping files strictly on-device'
      ]
    },
    {
      period: '2022 — 2024',
      role: 'Electrical & Systems Engineer',
      company: 'Engineering Technology Group',
      description: 'Specialized in signal processing systems, circuit design, and algorithmic performance optimization. Applied core engineering methodologies to software architecture and embedded systems.',
      highlights: [
        'Optimized data processing algorithms for real-time throughput',
        'Developed robust hardware/software interfaces and diagnostic tools',
        'Published technical documentations and system specifications'
      ]
    },
    {
      period: '2020 — 2022',
      role: 'Software Developer & Open Source Contributor',
      company: 'Independent / Web Community',
      description: 'Created open-source productivity utilities, modern React applications, and browser web tools focused on user privacy and performance.',
      highlights: [
        'Authored developer guides on browser web standards and WebAssembly',
        'Contributed to modern UI toolkits and document parsing workflows'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 pb-20">
      
      {/* Background Lighting Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Breadcrumbs Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500">Authors</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-red-400 font-medium">{authorDetails.name}</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 relative z-10">
            
            {/* Author Avatar Photo */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-red-500/30 p-1 bg-slate-950 shadow-2xl ring-4 ring-red-500/10">
                <img
                  src={authorDetails.avatar}
                  alt={authorDetails.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Founder
              </div>
            </div>

            {/* Author Content Header */}
            <div className="flex-1 text-center md:text-left space-y-4">
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> {authorDetails.role}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
                  {authorDetails.company}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs">
                  {authorDetails.location}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {authorDetails.name}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
                {authorDetails.bio}
              </p>

              {/* Action Buttons & Email */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href={`mailto:${authorDetails.email}`}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all transform active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Email</span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedEmail ? 'Email Copied!' : authorDetails.email}</span>
                </button>

                <div className="flex items-center gap-2 ml-0 sm:ml-2">
                  <a
                    href={authorDetails.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href={authorDetails.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={authorDetails.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                    title="Twitter / X Profile"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Metrics Cards Banner */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400">Client-Side Privacy</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-black text-red-400">18+</p>
              <p className="text-xs text-slate-400">PDF & AI Tools Built</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-black text-white">{authorArticles.length}+</p>
              <p className="text-xs text-slate-400">Published Articles</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-black text-emerald-400">2026</p>
              <p className="text-xs text-slate-400">Active Innovation</p>
            </div>
          </div>
        </section>


        {/* MISSION STATEMENT CALLOUT */}
        <section className="relative rounded-3xl bg-gradient-to-r from-red-950/30 via-slate-900 to-purple-950/30 border border-red-500/20 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Founder's Mission & Core Philosophy
              </h2>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed italic">
                "{authorDetails.mission}"
              </p>
            </div>
          </div>
        </section>


        {/* BIOGRAPHY & BACKGROUND */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Biography & Engineering Journey</h2>
              <p className="text-xs text-slate-400">Bridging electrical engineering, browser security, and generative AI</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              <strong className="text-white font-semibold">Mridanga Mondal</strong> is an Electrical Engineer turned software architect who founded <strong className="text-white font-semibold">SmartPDF AI</strong> to solve one of the most pressing concerns in modern productivity software: document privacy. While traditional online PDF tools force users to upload sensitive financial records, legal contracts, and personal identity files to third-party cloud servers, Mridanga pioneered a zero-knowledge architecture where all document transformations occur 100% locally inside the user's browser memory.
            </p>
            <p>
              With a strong background in electrical engineering, signal processing, and systems optimization, Mridanga applies mathematical precision to software engineering. His technical expertise spans WebAssembly (WASM) compilation, optical character recognition (OCR) algorithms, client-side 256-bit AES cryptography, and seamless integration with state-of-the-art Google Gemini AI models for multi-page document intelligence.
            </p>
            <p>
              Under his leadership, SmartPDF AI has grown into an enterprise-grade productivity suite serving students, legal teams, medical professionals, and businesses globally. His mission remains steadfast: providing fast, accessible, free, and completely secure PDF tools that respect user data privacy above all else.
            </p>
          </div>
        </section>


        {/* CORE EXPERTISE & SPECIALTIES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Areas of Expertise</h2>
              <p className="text-xs text-slate-400">Specialized technical domains and core competencies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${skill.color} p-3 text-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>


        {/* TECHNOLOGIES & ENGINEERING STACK */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Technologies & Engineering Stack</h2>
              <p className="text-xs text-slate-400">Core languages, frameworks, and web standards utilized by Mridanga</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>


        {/* EXPERIENCE & CAREER TIMELINE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Experience & Career Highlights</h2>
              <p className="text-xs text-slate-400">Professional background and leadership milestones</p>
            </div>
          </div>

          <div className="space-y-6">
            {experience.map((item, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.role}</h3>
                    <p className="text-xs font-semibold text-red-400">{item.company}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium">
                    {item.period}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <ul className="space-y-2 pt-2">
                  {item.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>


        {/* PUBLISHED ARTICLES BY MRIDANGA MONDAL */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Published Articles & Guides</h2>
                <p className="text-xs text-slate-400">Technical documentation, PDF workflow tutorials, and security guides</p>
              </div>
            </div>

            <Link
              to="/blog"
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline transition-all hidden sm:flex"
            >
              <span>View All Blog Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorArticles.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-red-400 text-[11px] font-bold">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="pt-2 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center sm:hidden pt-2">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              <span>Explore All SmartPDF AI Articles</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </Link>
          </div>
        </section>


        {/* QUICK CONTACT & USEFUL LINKS FOOTER BANNER */}
        <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white">Have Questions or Feature Ideas?</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Connect directly with Mridanga Mondal or explore our comprehensive suite of PDF tools and support documentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${authorDetails.email}`}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email Message</span>
            </a>

            <Link
              to="/about"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <span>About SmartPDF AI</span>
            </Link>

            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <span>Contact Us</span>
            </Link>

            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <span>Explore PDF Utilities</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AuthorProfile;
