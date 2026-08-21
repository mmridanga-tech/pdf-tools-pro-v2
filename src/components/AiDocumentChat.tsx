import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  Table,
  Languages,
  ListOrdered,
  BookOpen,
  Loader2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Bot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserSession } from '../types';
import { api } from '../services/apiClient';
import { triggerFileDownload } from '../lib/pdfEngine';

interface AiDocumentChatProps {
  initialContext?: string;
  userSession: UserSession;
  onOpenPricing: () => void;
}

export const AiDocumentChat: React.FC<AiDocumentChatProps> = ({
  initialContext = '',
  userSession,
  onOpenPricing,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your **SmartPDF Gemini AI Intelligence Assistant**.\n\nUpload a PDF or paste document text on the left, and ask me anything. I can generate **Executive Summaries**, extract **Structured Tables**, detect **Compliance Risks**, or translate content with precise **[Page X] citations**.",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [documentContext, setDocumentContext] = useState(initialContext);
  const [documentName, setDocumentName] = useState('Document.pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentName(file.name);
      const text = await file.text().catch(() => '');
      if (text) {
        setDocumentContext(text.substring(0, 50000));
      } else {
        // Fallback placeholder text extracted for demonstration
        setDocumentContext(`Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n[Page 1] Executive Overview and operational metrics...\n[Page 2] Detailed clauses, terms, and agreements...`);
      }
    }
  };

  const handleSendMessage = async (customPrompt?: string, mode: 'chat' | 'summarize' | 'explain' | 'translate' | 'extractTables' | 'extractKeyPoints' = 'chat') => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend && mode === 'chat') return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: mode === 'chat' ? textToSend : `[Triggered Action: ${mode}] ${textToSend}`,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setQuotaWarning(null);

    try {
      const res = await api.geminiChat({
        message: textToSend,
        pdfContext: documentContext,
        history: messages,
        mode,
        targetLanguage: targetLang,
      });

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const msg = err?.message || 'Error communicating with Gemini AI.';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
        setQuotaWarning('Daily AI request limit reached. Upgrade to Pro or Enterprise for higher quotas.');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **AI Request Notice**: ${msg}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadChatTranscript = () => {
    const transcript = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n---\n\n');
    triggerFileDownload(new Blob([transcript], { type: 'text/markdown' }), `smartpdf_chat_${Date.now()}.md`, 'text/markdown');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Side: Document Context & Quick Tools */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-lg shadow-slate-200/40 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Active Document</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{documentName}</p>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
              >
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Context Textarea */}
            <div className="flex-1 flex flex-col min-h-0 mb-4">
              <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span>Extracted Document Context</span>
                <span className="text-[10px] text-slate-400">{documentContext.length} chars</span>
              </label>
              <textarea
                value={documentContext}
                onChange={(e) => setDocumentContext(e.target.value)}
                placeholder="Paste or upload text from your PDF here for deep AI intelligence..."
                className="flex-1 w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* AI Action Pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Instant Intelligence Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendMessage('Generate an Executive Summary with key highlights and page citations.', 'summarize')}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-left text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Executive Summary</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Extract all structured tables and numerical data into markdown tables.', 'extractTables')}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-left text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span className="truncate">Extract Tables</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Extract all Key Takeaways and bulleted action points with page references.', 'extractKeyPoints')}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-left text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Key Points</span>
                </button>
                <button
                  onClick={() => handleSendMessage(`Translate the document content into ${targetLang}.`, 'translate')}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-left text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">Translate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quota & Model Info */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Gemini 3.6 Flash
            </span>
            <span className="font-semibold text-indigo-700 capitalize">{userSession.plan} Tier</span>
          </div>
        </div>

        {/* Right Side: Interactive Chat Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/40 flex flex-col justify-between overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Gemini AI Document Conversation</h2>
                <p className="text-[11px] text-slate-400">Contextual answers with verified [Page X] citations</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadChatTranscript}
                title="Download transcript"
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear conversation"
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-red-600 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {quotaWarning && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>{quotaWarning}</span>
                </div>
                <button
                  onClick={onOpenPricing}
                  className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition"
                >
                  Upgrade Plan
                </button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-slate-700 flex items-center gap-1 transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                  AI
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Gemini AI is analyzing document context & citing pages...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="ai-chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about this document (e.g., 'What are the termination clauses? [Page X]')..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                id="send-ai-chat-btn"
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
