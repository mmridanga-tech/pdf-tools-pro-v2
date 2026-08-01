import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import { postApiJson } from '../utils/apiClient';
import { pdfjsLib, ensurePdfWorkerConfigured } from '../utils/pdfWorker';
import {
  Sparkles,
  FileText,
  Languages,
  CheckCircle2,
  Table,
  BookOpen,
  HelpCircle,
  Brain,
  Wand2,
  Copy,
  Download,
  Check,
  Zap,
} from 'lucide-react';

ensurePdfWorkerConfigured();

type AIActionType =
  | 'summarize'
  | 'rewrite'
  | 'translate'
  | 'grammar'
  | 'explain'
  | 'extract-tables'
  | 'key-points'
  | 'study-notes'
  | 'faq'
  | 'flashcards';

interface AIActionConfig {
  id: AIActionType;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const AI_ACTIONS: AIActionConfig[] = [
  {
    id: 'summarize',
    title: 'Summarize Document',
    description: 'Concise executive summary with key takeaways and action items.',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'rewrite',
    title: 'Rewrite & Tone Adjustment',
    description: 'Enhance clarity, vocabulary, and professional flow.',
    icon: Wand2,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'translate',
    title: 'Multi-Language Translate',
    description: 'Translate documents into 15+ global languages accurately.',
    icon: Languages,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'grammar',
    title: 'Grammar & Proofreading',
    description: 'Fix spelling, punctuation, and structural flaws.',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'explain',
    title: 'Explain Technical Content',
    description: 'Simplify complex jargon, research formulas, and legalese.',
    icon: Brain,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'extract-tables',
    title: 'Extract Data Tables',
    description: 'Convert document tables into Markdown and CSV formats.',
    icon: Table,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'key-points',
    title: 'Extract Key Points',
    description: 'Top 10 crucial findings, statistics, and core arguments.',
    icon: Zap,
    color: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'study-notes',
    title: 'Generate Study Notes',
    description: 'Structured headings, bulleted outlines, and revision guides.',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-700',
  },
  {
    id: 'faq',
    title: 'Generate FAQ List',
    description: 'Frequently asked questions and answers from the text.',
    icon: HelpCircle,
    color: 'from-sky-500 to-indigo-600',
  },
  {
    id: 'flashcards',
    title: 'Generate Flashcards',
    description: 'Interactive concept and question study cards.',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-700',
  },
];

export const AiAssistant: React.FC = () => {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfTextContent, setPdfTextContent] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  const [activeAction, setActiveAction] = useState<AIActionType>('summarize');
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [rewriteStyle, setRewriteStyle] = useState<string>('Professional');

  const [processing, setProcessing] = useState(false);
  const [outputResult, setOutputResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    setSelectedFile(file);
    setLoadingPdf(true);
    setOutputResult('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 25); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((it: any) => it.str).join(' ') + '\n\n';
      }

      setPdfTextContent(fullText);
      toast.success(`Loaded PDF text (${pdf.numPages} pages)`);
    } catch (err: any) {
      toast.error('Failed to extract PDF text: ' + err.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleRunAiTask = async () => {
    if (!pdfTextContent.trim()) {
      toast.error('Please upload or paste document text first.');
      return;
    }

    setProcessing(true);
    setOutputResult('');

    try {
      const data = await postApiJson<{ result: string; action: string }>('/api/gemini/assistant', {
        action: activeAction,
        textContext: pdfTextContent,
        options: {
          targetLanguage,
          style: rewriteStyle,
        },
      });

      setOutputResult(data.result);
      toast.success('AI task completed successfully!');

      if (selectedFile) {
        saveRecentFile({
          name: `${selectedFile.name}_${activeAction}.txt`,
          size: selectedFile.size,
          toolId: 'ai-assistant',
          toolName: `AI ${activeAction.toUpperCase()}`,
          status: 'completed',
        });
        addActivityLog(`Ran AI ${activeAction} on ${selectedFile.name}`, 'AI Assistant');
      }
    } catch (err: any) {
      toast.error('AI Processing Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyResult = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    toast.success('Result copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResult = () => {
    if (!outputResult) return;
    const blob = new Blob([outputResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name || 'document'}_${activeAction}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Result downloaded as Markdown!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10">
      <SEO
        toolName="AI Document Assistant"
        description="Summarize, rewrite, translate, proofread, extract tables, and generate flashcards from your PDF documents."
        path="/ai-assistant"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" /> AI Document Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Assistant & Document Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Transform lengthy PDFs into summaries, study notes, translated copies, or structured tables in seconds.
          </p>
        </div>

        {/* Action Selection Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {AI_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isSelected = activeAction === action.id;
            return (
              <button
                key={action.id}
                onClick={() => setActiveAction(action.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#18181d] border-red-500/50 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                    : 'bg-[#121215] border-slate-800/80 hover:border-slate-700 hover:bg-[#16161b]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-2 shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{action.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input PDF / Text Box */}
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-extrabold text-white">Source PDF Document</h2>
              </div>
              {selectedFile && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPdfTextContent('');
                  }}
                  className="text-xs text-red-400 hover:underline font-bold cursor-pointer"
                >
                  Remove File
                </button>
              )}
            </div>

            {!selectedFile ? (
              <FileUploader onFilesSelected={handleFileSelect} />
            ) : (
              <div className="p-4 bg-[#18181d] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-white truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <textarea
                  value={pdfTextContent}
                  onChange={(e) => setPdfTextContent(e.target.value)}
                  placeholder="Extracted PDF text will appear here..."
                  className="w-full h-44 p-3 bg-[#121215] border border-slate-800 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-red-500 scrollbar-thin"
                />
              </div>
            )}

            {/* Task Configuration Controls */}
            {activeAction === 'translate' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Chinese">Chinese (中文)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                </select>
              </div>
            )}

            {activeAction === 'rewrite' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Tone & Style
                </label>
                <select
                  value={rewriteStyle}
                  onChange={(e) => setRewriteStyle(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#18181d] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="Professional & Executive">Professional & Executive</option>
                  <option value="Academic & Formal">Academic & Formal</option>
                  <option value="Casual & Engaging">Casual & Engaging</option>
                  <option value="Simplified for Beginners">Simplified for Beginners</option>
                </select>
              </div>
            )}

            <button
              onClick={handleRunAiTask}
              disabled={processing || (!pdfTextContent.trim() && !selectedFile)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {processing ? (
                <span className="inline-block animate-pulse">Running AI Model...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run {AI_ACTIONS.find((a) => a.id === activeAction)?.title}
                </>
              )}
            </button>
          </div>

          {/* AI Output Window */}
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-extrabold text-white">Generated Output</h2>
                </div>
                {outputResult && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResult}
                      className="p-2 text-slate-400 hover:text-white bg-[#18181d] rounded-xl border border-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleDownloadResult}
                      className="p-2 text-slate-400 hover:text-white bg-[#18181d] rounded-xl border border-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {processing ? (
                <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold">Processing with Gemini Flash...</p>
                </div>
              ) : outputResult ? (
                <div className="h-[420px] overflow-y-auto p-4 bg-[#18181d] border border-slate-800 rounded-2xl text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans scrollbar-thin">
                  {outputResult}
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl text-center p-6">
                  <Wand2 className="w-10 h-10 opacity-30 text-red-400 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No output generated yet</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">
                    Select a task above, load your PDF document, and click run to analyze.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
