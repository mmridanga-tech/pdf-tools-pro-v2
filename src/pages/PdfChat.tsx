import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { ToolHeader } from '../components/ToolHeader';
import { RecommendedArticles } from '../components/seo/RecommendedArticles';
import { RelatedTools } from '../components/seo/RelatedTools';
import { PDFCanvasViewer } from '../components/PDFCanvasViewer';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog, saveAiChat } from '../utils/storageUtils';
import { formatBytes } from '../utils/fileUtils';
import {
  AIChatService,
  PDFDocumentContext,
  ChatMessage,
} from '../services/aiChatService';
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
  Check,
  RefreshCw,
  Plus,
  Search,
  BookOpen,
  HelpCircle,
  Eye,
  Loader2,
  FileSearch,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Globe,
  Table,
  ListChecks,
} from 'lucide-react';

export const PdfChat: React.FC = () => {
  const toast = useToast();

  // Multi-document state
  const [documents, setDocuments] = useState<PDFDocumentContext[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  // Uploading / Indexing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');

  // Active View Mode & Page Navigation
  const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'search'>('chat');
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  // Chat Input State
  const [inputQuery, setInputQuery] = useState<string>('');
  const [thinking, setThinking] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search in Document state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    Array<{ pageNumber: number; snippet: string; matchCount: number }>
  >([]);

  // Explain Paragraph Modal State
  const [explainModalOpen, setExplainModalOpen] = useState<boolean>(false);
  const [explainText, setExplainText] = useState<string>('');

  // Translate Modal State
  const [translateModalOpen, setTranslateModalOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Spanish');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents.find((doc) => doc.id === activeDocId) || null;

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (activeDoc?.messages?.length) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeDoc?.messages, thinking]);

  // Handle PDF files drop/select (supports multiple PDFs)
  const handleFilesSelect = async (files: File[]) => {
    if (!files.length) return;

    const pdfFiles = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      toast.error('Please upload valid PDF documents.');
      return;
    }

    setIsProcessing(true);
    let lastAddedDocId: string | null = null;

    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const processedDoc = await AIChatService.processPDF(file, (percent, msg) => {
          const overallPercent = Math.round(((i + percent / 100) / pdfFiles.length) * 100);
          setProgressPercent(overallPercent);
          setProgressMsg(`[${i + 1}/${pdfFiles.length}] ${file.name}: ${msg}`);
        });

        setDocuments((prev) => [...prev.filter((d) => d.name !== processedDoc.name), processedDoc]);
        lastAddedDocId = processedDoc.id;

        saveRecentFile({
          name: file.name,
          size: file.size,
          toolId: 'ai-chat',
          toolName: 'AI PDF Chat',
          status: 'completed',
        });
        addActivityLog(`Processed ${file.name} for AI Chat`, 'AI PDF Chat');
      }

      if (lastAddedDocId) {
        setActiveDocId(lastAddedDocId);
        setCurrentPageNum(1);
      }

      toast.success(`Successfully processed ${pdfFiles.length} PDF document${pdfFiles.length > 1 ? 's' : ''}!`);
    } catch (err: any) {
      toast.error('Failed to parse PDF document: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressMsg('');
    }
  };

  // Remove a document
  const handleRemoveDoc = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = documents.filter((d) => d.id !== docId);
    setDocuments(remaining);
    if (activeDocId === docId) {
      setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
      setCurrentPageNum(1);
    }
    toast.info('Document removed from session.');
  };

  // Send message
  const handleSendMessage = async (
    e?: React.FormEvent,
    customPrompt?: string,
    mode: 'chat' | 'summarize' | 'explain' | 'translate' | 'extractTables' | 'extractKeyPoints' | 'search' = 'chat',
    targetLang?: string
  ) => {
    if (e) e.preventDefault();
    if (!activeDoc) return;

    const query = customPrompt || inputQuery;
    if (!query.trim() && mode === 'chat') return;

    const displayPrompt =
      mode === 'summarize'
        ? 'Generate executive summary'
        : mode === 'explain'
        ? `Explain concept: "${query}"`
        : mode === 'translate'
        ? `Translate document content into ${targetLang || selectedLanguage}`
        : mode === 'extractTables'
        ? 'Extract tables and structured data'
        : mode === 'extractKeyPoints'
        ? 'Extract core key points & findings'
        : query;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: displayPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active document messages
    const updatedMessages = [...activeDoc.messages, userMsg];
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDoc.id ? { ...d, messages: updatedMessages } : d))
    );

    if (!customPrompt) setInputQuery('');
    setThinking(true);

    try {
      const assistantMsg = await AIChatService.sendMessage(
        activeDoc,
        query || 'Process document',
        mode,
        targetLang || selectedLanguage
      );

      const finalMessages = [...updatedMessages, assistantMsg];
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDoc.id ? { ...d, messages: finalMessages } : d))
      );

      // Save to localStorage history
      saveAiChat({
        title: `Chat: ${activeDoc.name}`,
        docName: activeDoc.name,
        pageCount: activeDoc.pageCount,
        messages: finalMessages.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
        })),
        folder: 'General',
        tags: ['AI Chat'],
      });
    } catch (err: any) {
      toast.error('AI Error: ' + err.message);
    } finally {
      setThinking(false);
    }
  };

  // Jump to specific page and switch to preview mode if requested
  const handleJumpToPage = (pageNum: number, switchTab = true) => {
    if (!activeDoc) return;
    const safePage = Math.min(Math.max(1, pageNum), activeDoc.pageCount);
    setCurrentPageNum(safePage);
    if (switchTab) setActiveTab('preview');
    toast.info(`Jumped to Page ${safePage}`);
  };

  // Perform in-document search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !searchTerm.trim()) return;

    const results = AIChatService.searchInPDF(activeDoc, searchTerm);
    setSearchResults(results);

    if (results.length > 0) {
      toast.success(`Found matches on ${results.length} page(s).`);
    } else {
      toast.info(`No matches found for "${searchTerm}".`);
    }
  };

  // Copy assistant message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Chat
  const handleExportChat = () => {
    if (!activeDoc || !activeDoc.messages.length) return;

    const content = activeDoc.messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.name.replace(/\.pdf$/i, '')}_chat_history.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported chat transcript successfully!');
  };

  // Helper to render inline clickable citations like [Page X]
  const renderMessageWithCitations = (text: string) => {
    const parts = text.split(/(\[Page \d+\])/gi);
    return parts.map((part, idx) => {
      const match = part.match(/\[Page (\d+)\]/i);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleJumpToPage(pageNum)}
            className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 font-mono font-bold text-[11px] border border-red-500/30 transition-all cursor-pointer"
            title={`Click to view Page ${pageNum} in PDF preview`}
          >
            <Eye className="w-3 h-3 text-red-400" />
            <span>Page {pageNum}</span>
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-8 sm:py-12">
      <SEO
        toolName="AI Chat with PDF"
        description="Ask questions, summarize, explain complex paragraphs, and find citations across large PDF documents with Gemini AI."
        path="/ai-chat"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ToolHeader
          icon={MessageSquare}
          title="AI Chat with PDF"
          description="Upload multi-page PDFs, ask natural questions, extract summaries, explain difficult paragraphs, and jump directly to exact cited pages."
          badge="Gemini AI Powered"
        />

        {/* Upload Zone when no documents loaded */}
        {documents.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-[#141417]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {isProcessing ? (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{progressMsg}</p>
                  <p className="text-xs text-slate-400 font-mono">{progressPercent}% Completed</p>
                </div>
                <div className="max-w-xs mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <FileUploader
                accept=".pdf,application/pdf"
                multiple={true}
                onFilesSelected={handleFilesSelect}
                title="Drop one or multiple PDF documents here"
                description="Supports standard PDFs, scanned documents, and multi-page reports."
                buttonText="Select PDF Files"
              />
            )}
          </div>
        ) : (
          /* Main Workspace UI */
          <div className="space-y-6">
            {/* Document Tabs Bar */}
            <div className="bg-[#141417] border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1.5 px-2">
                  <Layers className="w-4 h-4 text-red-500" /> Documents:
                </span>

                {documents.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setActiveDocId(doc.id);
                        setCurrentPageNum(1);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                        isActive
                          ? 'bg-red-500/10 border-red-500/50 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                      <span className="truncate max-w-[140px]">{doc.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({doc.pageCount}p)</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveDoc(doc.id, e)}
                        className="p-0.5 hover:text-red-400 text-slate-500 rounded transition-colors"
                        title="Remove document"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add More Files Button */}
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0">
                <Plus className="w-3.5 h-3.5 text-red-400" />
                <span>Add More PDFs</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>
            </div>

            {/* Mobile View Tab Switcher */}
            <div className="lg:hidden flex items-center bg-[#141417] p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'chat' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> PDF Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'search' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <Search className="w-3.5 h-3.5" /> Find Info
              </button>
            </div>

            {/* Main Split Grid Layout */}
            {activeDoc && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: PDF Preview Canvas & In-Document Search (5 Cols Desktop) */}
                <div
                  className={`lg:col-span-5 space-y-4 ${
                    activeTab === 'chat' ? 'hidden lg:block' : 'block'
                  }`}
                >
                  {/* PDF Canvas Viewer */}
                  <PDFCanvasViewer
                    file={activeDoc.file}
                    currentPage={currentPageNum}
                    totalPages={activeDoc.pageCount}
                    onPageChange={(p) => setCurrentPageNum(p)}
                    className="h-[580px]"
                  />

                  {/* In-Document Quick Search Card */}
                  <div className="bg-[#141417] border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-red-400" />
                        <span>Find Specific Info in PDF</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {activeDoc.pageCount} pages indexed
                      </span>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search phrase or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Find
                      </button>
                    </form>

                    {/* Search Results Snippet List */}
                    {searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-2 pt-2 border-t border-slate-800">
                        {searchResults.map((res, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleJumpToPage(res.pageNumber)}
                            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer text-left group"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-red-400 mb-1">
                              <span>Page {res.pageNumber}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {res.matchCount} match{res.matchCount > 1 ? 'es' : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                              {res.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: AI Chat Interface & Quick Tools (7 Cols Desktop) */}
                <div
                  className={`lg:col-span-7 bg-[#141417] border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[720px] overflow-hidden ${
                    activeTab === 'preview' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* Quick Action Tools Bar */}
                  <div className="bg-[#18181D] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSendMessage(undefined, 'Summarize document', 'summarize')}
                        disabled={thinking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        title="AI Summary"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Summary</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExplainModalOpen(true)}
                        disabled={thinking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        title="AI Explain"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>AI Explain</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTranslateModalOpen(true)}
                        disabled={thinking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        title="AI Translate"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>AI Translate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage(undefined, 'Extract all tables and matrix data into markdown tables.', 'extractTables')}
                        disabled={thinking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        title="Extract Tables"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Extract Tables</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage(undefined, 'Extract key bullet points and core takeaways.', 'extractKeyPoints')}
                        disabled={thinking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        title="Extract Key Points"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                        <span>Key Points</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleExportChat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-all cursor-pointer"
                        title="Download Chat History"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Download Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Chat Message Stream */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
                    {activeDoc.messages.map((msg) => {
                      const isAssistant = msg.sender === 'assistant';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-start gap-3 ${
                            isAssistant ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          {isAssistant && (
                            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                              isAssistant
                                ? 'bg-[#18181D] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                                : 'bg-red-600 text-white font-medium rounded-tr-none shadow-md'
                            }`}
                          >
                            <div className="whitespace-pre-wrap font-sans">
                              {isAssistant
                                ? renderMessageWithCitations(msg.text)
                                : msg.text}
                            </div>

                            {/* Suggested follow-up questions */}
                            {isAssistant && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Suggested Questions:
                                </p>
                                <div className="flex flex-col gap-1">
                                  {msg.suggestedQuestions.map((q, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleSendMessage(undefined, q)}
                                      className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800/80 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                      <span>{q}</span>
                                      <ChevronRight className="w-3 h-3 text-slate-500" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Footer timestamp & copy */}
                            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                              <span>{msg.timestamp}</span>
                              {isAssistant && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedId === msg.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" /> Copy
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {!isAssistant && (
                            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {thinking && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl animate-spin">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div className="p-3 bg-[#18181D] border border-slate-800 rounded-2xl text-xs text-slate-400 animate-pulse flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                          <span>Gemini is analyzing document pages & extracting citations...</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => handleSendMessage(e)}
                    className="p-4 bg-[#18181D] border-t border-slate-800 flex items-center gap-3"
                  >
                    <input
                      type="text"
                      placeholder={`Ask anything about "${activeDoc.name}"...`}
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      disabled={thinking}
                      className="flex-1 px-4 py-3 bg-[#121215] border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-red-500 disabled:opacity-50"
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
        )}

        {/* Explain Paragraph Modal */}
        <AnimatePresence>
          {explainModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#141417] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Explain Complex Paragraph</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setExplainModalOpen(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Paste any difficult paragraph, term, or legal clause from your PDF to get a plain-English explanation.
                </p>

                <textarea
                  rows={4}
                  placeholder="Paste paragraph text here..."
                  value={explainText}
                  onChange={(e) => setExplainText(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setExplainModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!explainText.trim()) return;
                      setExplainModalOpen(false);
                      handleSendMessage(undefined, explainText, 'explain');
                      setExplainText('');
                    }}
                    disabled={!explainText.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Explain Concept
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Translate Modal */}
        <AnimatePresence>
          {translateModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#141417] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>AI Translate PDF</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTranslateModalOpen(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Select your desired target language to translate key sections or summary of this PDF.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Target Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Chinese">Chinese (中文)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Portuguese">Portuguese (Português)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Italian">Italian (Italiano)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="Russian">Russian (Русский)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTranslateModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTranslateModalOpen(false);
                      handleSendMessage(
                        undefined,
                        `Translate document key points into ${selectedLanguage}`,
                        'translate',
                        selectedLanguage
                      );
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Translate PDF
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Recommended Articles & Related Tools */}
        <div className="mt-16 space-y-12">
          <RecommendedArticles category="AI & Automation" limit={3} />
          <RelatedTools currentToolPath="/chat-pdf" limit={4} />
        </div>
      </div>
    </div>
  );
};
