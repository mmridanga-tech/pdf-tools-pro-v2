import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import { pdfjsLib, ensurePdfWorkerConfigured } from '../utils/pdfWorker';
import {
  MessageSquare,
  Send,
  FileText,
  Copy,
  Download,
  Sparkles,
  Bot,
  User,
  Trash2,
  Bookmark,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';

ensurePdfWorkerConfigured();

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: string[];
}

export const PdfChat: React.FC = () => {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfTextContext, setPdfTextContext] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    setSelectedFile(file);
    setLoadingPdf(true);
    setMessages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);

      let extractedFull = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedFull += `--- PAGE ${i} ---\n${pageText}\n\n`;
      }

      setPdfTextContext(extractedFull);
      toast.success(`Parsed ${pdf.numPages} pages successfully!`);

      // Initial welcoming AI message
      setMessages([
        {
          id: 'welcome_msg',
          sender: 'assistant',
          text: `Hello! I have loaded "${file.name}" (${pdf.numPages} pages). What would you like to know or analyze about this document?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      saveRecentFile({
        name: file.name,
        size: file.size,
        toolId: 'ai-chat',
        toolName: 'AI PDF Chat',
        status: 'completed',
      });
      addActivityLog(`Uploaded ${file.name} to AI Chat`, 'AI PDF Chat');
    } catch (err: any) {
      toast.error('Failed to parse PDF pages: ' + err.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || inputQuery;
    if (!query.trim() || thinking) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setThinking(true);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          pdfContext: pdfTextContext,
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response.');
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.reply.match(/\[Page \d+\]/g) || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error('AI Chat Error: ' + err.message);
    } finally {
      setThinking(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    if (!messages.length) return;
    const content = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name || 'document'}_chat_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat transcript exported successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-10">
      <SEO
        toolName="AI PDF Chat"
        description="Interact, ask questions, and extract citations directly from your PDF document using Gemini AI."
        path="/ai-chat"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" /> Gemini Powered
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Chat with any PDF Document
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Ask complex questions, extract specific page citations, and analyze long reports in real-time.
          </p>
        </div>

        {/* Upload State or Chat State */}
        {!selectedFile ? (
          <div className="max-w-2xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <FileUploader onFilesSelected={handleFileSelect} />
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Processing
              </span>
              <span>•</span>
              <span>Page References & Citations</span>
              <span>•</span>
              <span>100% Secure</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar File Details */}
            <div className="lg:col-span-1 bg-[#121215] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-[600px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <FileText className="w-4 h-4 text-red-400" /> Active PDF
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setMessages([]);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                    title="Change PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-[#18181d] border border-slate-800 rounded-2xl mb-4">
                  <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {pageCount} Pages Extracted
                  </p>
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample Prompts
                </p>
                <div className="space-y-2">
                  {[
                    'Summarize the core arguments in 3 points.',
                    'What are the key terms and definitions?',
                    'List all statistics or numerical figures mentioned.',
                    'Draft a executive summary of this report.',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(undefined, sample)}
                      className="w-full text-left p-2.5 bg-[#18181d] hover:bg-[#202028] border border-slate-800/80 rounded-xl text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExportChat}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Chat
              </button>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3 bg-[#121215] border border-slate-800 rounded-3xl shadow-xl flex flex-col h-[600px] overflow-hidden">
              {/* Chat Log */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-red-600 text-white font-medium rounded-tr-none shadow-md'
                          : 'bg-[#18181d] border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {msg.sender === 'assistant' && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Answer
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="p-2 bg-slate-800 text-slate-300 rounded-xl">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {thinking && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl animate-spin">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-[#18181d] border border-slate-800 rounded-2xl text-xs text-slate-400 animate-pulse">
                      Analyzing PDF pages & citations...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-[#18181d] border-t border-slate-800 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Ask a question about this document..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#121215] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || thinking}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
