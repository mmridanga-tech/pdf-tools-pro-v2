import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  BookOpen,
  Command,
  Send,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  Video,
  ThumbsUp,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'ai' | 'security' | 'billing';
}

const FAQS: FAQItem[] = [
  {
    question: 'Are my PDF files stored permanently on SmartPDF servers?',
    answer:
      'No! SmartPDF operates with strict privacy-by-design principles. Files uploaded for conversion or merging are held in RAM memory during processing and automatically purged permanently after 1 hour.',
    category: 'security',
  },
  {
    question: 'How does AI Document Chat analyze large PDFs?',
    answer:
      'Our backend uses Gemini 2.5 AI with document chunking. It parses your PDF text into semantic vector passages to provide real-time page-cited answers and exact summaries without truncating long documents.',
    category: 'ai',
  },
  {
    question: 'Is there a file size limit for free users?',
    answer:
      'Free users can process PDF documents up to 50 MB with 10 files per batch. Pro and Enterprise workspace plans support up to 2 GB per file and unlimited batch operations.',
    category: 'general',
  },
  {
    question: 'Can I remove passwords from locked PDFs?',
    answer:
      'Yes! Use our Unlock PDF tool. Provided you have legal authorization and know the password, SmartPDF will remove permission restrictions and generate an unlocked PDF.',
    category: 'general',
  },
  {
    question: 'How do Team Workspaces handle billing?',
    answer:
      'Workspace admins pay per seat. Members gain shared cloud document folders, shared batch quotas, and unified team usage metrics.',
    category: 'billing',
  },
];

const TUTORIALS = [
  {
    id: 1,
    title: 'How to Chat with Any PDF Using AI',
    time: '2 min guide',
    icon: Sparkles,
    desc: 'Learn how to ask questions, summarize chapters, and extract citations from complex manuals.',
  },
  {
    id: 2,
    title: 'Batch Merging & Reordering PDF Pages',
    time: '1 min guide',
    icon: FileText,
    desc: 'Drag and drop multiple files, reorder thumbnails visually, and export a single unified PDF.',
  },
  {
    id: 3,
    title: 'Applying Digital Watermarks & Signatures',
    time: '3 min guide',
    icon: ShieldCheck,
    desc: 'Protect confidential contracts with custom text watermarks, opacity controls, and page ranges.',
  },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open Search Command Palette' },
  { keys: ['Esc'], label: 'Close Active Modal / Palette' },
  { keys: ['Shift', 'U'], label: 'Quick Upload PDF' },
  { keys: ['⌘', 'S'], label: 'Download Converted File' },
  { keys: ['⌘', 'M'], label: 'Jump to Merge Tool' },
];

export const HelpCenter: React.FC = () => {
  const { showToast, success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'shortcuts' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedFaqCat, setSelectedFaqCat] = useState<string>('all');

  // Contact Form State
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = selectedFaqCat === 'all' || faq.category === selectedFaqCat;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject || !contactMsg) {
      error('Please fill in all ticket fields');
      return;
    }
    setSubmittingContact(true);
    setTimeout(() => {
      setSubmittingContact(false);
      setContactSubmitted(true);
      success('Support ticket submitted! Ticket #SPD-9842');
    }, 1000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;
    success('Thank you for your valuable feedback!');
    setFeedbackText('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Help Center & Support - SmartPDF AI"
        description="Search FAQs, learn PDF workflows with tutorials, view keyboard shortcuts, or contact customer support."
      />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Banner Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" /> Support Hub
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-slate-400 text-sm">
            Find answers, learn power shortcuts, watch tutorials, or reach our 24/7 technical team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers, e.g., 'file retention', 'AI chat', 'unlock password'..."
              className="w-full bg-[#121215] border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60 shadow-xl"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tutorials'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Workflow Tutorials
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shortcuts'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Command className="w-4 h-4" /> Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Contact Support
          </button>
        </div>

        {/* Tab 1: FAQ Section */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* FAQ Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['all', 'general', 'ai', 'security', 'billing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFaqCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 cursor-pointer ${
                    selectedFaqCat === cat
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121215] border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-sm text-white hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          openFaqIndex === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-[#121215] border border-slate-800 rounded-2xl text-slate-500 text-xs">
                  No matching questions found for "{searchQuery}". Try a different keyword or submit a support ticket.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Workflow Tutorials */}
        {activeTab === 'tutorials' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TUTORIALS.map((tut) => {
              const Icon = tut.icon;
              return (
                <div
                  key={tut.id}
                  className="bg-[#121215] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        {tut.time}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">{tut.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tut.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => info(`Opening tutorial: ${tut.title}`)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5 text-red-400" /> Watch Walkthrough
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Keyboard Shortcuts */}
        {activeTab === 'shortcuts' && (
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Command className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold text-white">Power User Hotkeys</h2>
            </div>

            <div className="divide-y divide-slate-800/80">
              {KEYBOARD_SHORTCUTS.map((sc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{sc.label}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg font-mono font-bold text-slate-200 text-[11px]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Contact Support Form */}
        {activeTab === 'contact' && (
          <div className="max-w-xl mx-auto bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            {!contactSubmitted ? (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">Submit a Support Ticket</h3>
                  <p className="text-xs text-slate-400">
                    Our technical engineers respond within 2 hours for priority workspace users.
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300">Issue Subject</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. OCR text extraction issue or billing inquiry"
                    className="w-full bg-[#18181d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300">Detailed Message</label>
                  <textarea
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe your request or document issue..."
                    className="w-full bg-[#18181d] border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {submittingContact ? 'Submitting Ticket...' : 'Send Support Request'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Ticket #SPD-9842 Created!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We received your issue. An engineer will follow up via your account email shortly.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Submit Another Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {/* Community Feedback Footer Card */}
        <div className="bg-gradient-to-r from-red-950/40 via-[#121215] to-amber-950/30 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 justify-center md:justify-start">
              <ThumbsUp className="w-3.5 h-3.5" /> Product Feedback
            </span>
            <h3 className="text-xl font-extrabold text-white">Help us improve SmartPDF</h3>
            <p className="text-xs text-slate-400">
              Is there a PDF tool or AI feature you wish we had? Let our dev team know.
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Suggest a tool or feature..."
              className="bg-[#18181d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
