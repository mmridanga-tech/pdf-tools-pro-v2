import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Minimize2,
  Scissors,
  FileText,
  Lock,
  Unlock,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowRight,
  LucideIcon
} from 'lucide-react';

export interface RelatedToolItem {
  name: string;
  path: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export const POPULAR_TOOLS_LIST: RelatedToolItem[] = [
  {
    name: 'Merge PDF',
    path: '/merge-pdf',
    description: 'Combine multiple PDF documents into a single organized PDF file.',
    icon: Layers,
    badge: 'Popular',
  },
  {
    name: 'Compress PDF',
    path: '/compress-pdf',
    description: 'Reduce PDF file size for email sharing without quality loss.',
    icon: Minimize2,
    badge: 'High Savings',
  },
  {
    name: 'Split PDF',
    path: '/split-pdf',
    description: 'Separate PDF pages or extract custom page ranges effortlessly.',
    icon: Scissors,
  },
  {
    name: 'PDF to Word',
    path: '/pdf-to-word',
    description: 'Convert PDF documents into fully editable Microsoft Word (.docx) files.',
    icon: FileText,
  },
  {
    name: 'Protect PDF',
    path: '/protect-pdf',
    description: 'Secure PDF files with 256-bit AES encryption & password protection.',
    icon: Lock,
    badge: '256-Bit AES',
  },
  {
    name: 'Unlock PDF',
    path: '/unlock-pdf',
    description: 'Remove password protection & security restrictions from PDF files.',
    icon: Unlock,
  },
  {
    name: 'OCR PDF',
    path: '/ocr-pdf',
    description: 'Extract editable text from scanned PDFs & images with AI OCR.',
    icon: Eye,
    badge: 'AI Powered',
  },
  {
    name: 'Chat with PDF',
    path: '/chat-pdf',
    description: 'Ask questions, summarize chapters, & search documents using Gemini AI.',
    icon: MessageSquare,
    badge: 'Gemini AI',
  },
];

interface RelatedToolsProps {
  currentToolPath?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  currentToolPath,
  limit = 4,
  title = 'Related PDF & AI Utilities',
  subtitle = 'Explore other client-side PDF tools designed for productivity, security, and document conversion.',
}) => {
  const tools = POPULAR_TOOLS_LIST.filter(
    (tool) => tool.path !== currentToolPath && tool.path !== `${currentToolPath}-pdf`
  ).slice(0, limit);

  return (
    <section className="bg-[#121215] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-slate-400 pl-1">{subtitle}</p>}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-xs text-red-400 font-bold rounded-xl transition-all shrink-0 w-fit"
        >
          <span>All 25+ PDF Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <Link
              key={tool.name}
              to={tool.path}
              className="bg-slate-900/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 space-y-3 group transition-all duration-300 shadow-md hover:shadow-red-500/5 block relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ToolIcon className="w-5 h-5" />
                </div>
                {tool.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-extrabold uppercase tracking-wider">
                    {tool.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                  <span>{tool.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
