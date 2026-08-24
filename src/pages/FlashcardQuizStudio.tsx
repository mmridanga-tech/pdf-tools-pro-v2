import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  GraduationCap,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Award,
} from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface StudySet {
  title: string;
  overview: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export const FlashcardQuizStudio: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studySet, setStudySet] = useState<StudySet | null>(null);

  // Tabs: 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async () => {
    if (!file) {
      setError('Please upload a PDF textbook, lecture note, or study syllabus.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setStudySet(null);
      setCardIndex(0);
      setIsFlipped(false);
      setUserAnswers({});
      setSubmitted(false);

      const text = await extractTextFromPdfFile(file);
      if (!text) {
        throw new Error('Unable to extract text from PDF.');
      }

      const response: StudySet = await api.geminiAdvanced({
        action: 'flashcards_quiz',
        textContext: text,
      });

      setStudySet(response);
    } catch (err: any) {
      setError(err?.message || 'Study set generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const calculateScore = () => {
    if (!studySet?.quiz) return 0;
    let score = 0;
    studySet.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>AI Revision & Active Recall Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Interactive Flashcard & Quiz Studio
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Transform research papers, exam guides, and academic PDFs into interactive 3D flashcards and multiple-choice practice tests in seconds.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <label className="border-2 border-dashed border-white/[0.12] hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-indigo-500/[0.02] group">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
              {file ? file.name : 'Select or drop study PDF document'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports study notes, slides & book chapters</p>
          </label>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!file || isGenerating}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Key Concepts & Building Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Flashcards & Practice Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Study Studio View */}
        {studySet && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Set Header */}
            <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Study Deck Generated</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{studySet.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{studySet.overview}</p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/[0.08] shrink-0">
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'flashcards'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Flashcards ({studySet.flashcards?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'quiz'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quiz Test ({studySet.quiz?.length || 0})
                </button>
              </div>
            </div>

            {/* TAB 1: FLASHCARDS */}
            {activeTab === 'flashcards' && studySet.flashcards?.length > 0 && (
              <div className="space-y-6">
                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[300px] sm:min-h-[340px] bg-[#0e101a] border-2 border-indigo-500/30 hover:border-indigo-500/60 rounded-3xl p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl relative select-none transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono text-slate-400">
                      Card {cardIndex + 1} of {studySet.flashcards.length}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {studySet.flashcards[cardIndex].difficulty}
                    </span>
                  </div>

                  <div className="my-auto py-6 max-w-lg">
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Prompt / Question</span>
                        <p className="text-xl sm:text-2xl font-bold text-white leading-snug">
                          {studySet.flashcards[cardIndex].question}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Answer / Explanation</span>
                        <p className="text-base sm:text-lg font-medium text-emerald-200 leading-relaxed">
                          {studySet.flashcards[cardIndex].answer}
                        </p>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1.5 group-hover:text-slate-400 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Click anywhere to flip card</span>
                  </span>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={cardIndex === 0}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {studySet.flashcards.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          cardIndex === idx ? 'w-6 bg-indigo-500' : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => Math.min(studySet.flashcards.length - 1, prev + 1));
                    }}
                    disabled={cardIndex === studySet.flashcards.length - 1}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: QUIZ TEST */}
            {activeTab === 'quiz' && studySet.quiz?.length > 0 && (
              <div className="space-y-6">
                {studySet.quiz.map((q, qIdx) => {
                  const selected = userAnswers[qIdx];
                  return (
                    <div
                      key={`quiz-q-${qIdx}`}
                      className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Question {qIdx + 1} of {studySet.quiz.length}
                        </span>
                        {submitted && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              selected === q.correctAnswerIndex
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {selected === q.correctAnswerIndex ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">{q.question}</h3>

                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isCorrect = optIdx === q.correctAnswerIndex;

                          let btnStyle = 'bg-black/30 border-white/[0.08] text-slate-300 hover:border-indigo-500/40';
                          if (isOptionSelected) {
                            btnStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold';
                          }
                          if (submitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={`opt-${qIdx}-${optIdx}`}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              {submitted && isOptionSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {submitted && (
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 space-y-1">
                          <span className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider block">Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit / Reset Score Bar */}
                <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {submitted ? (
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-amber-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Your Score: {calculateScore()} / {studySet.quiz.length} (
                          {Math.round((calculateScore() / studySet.quiz.length) * 100)}%)
                        </h4>
                        <p className="text-xs text-slate-400">Review mistakes above and retry anytime</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Answer all questions and submit to view explanations and active recall scores.
                    </p>
                  )}

                  {!submitted ? (
                    <button
                      onClick={() => setSubmitted(true)}
                      disabled={Object.keys(userAnswers).length < studySet.quiz.length}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      Submit Practice Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setUserAnswers({});
                      }}
                      className="px-6 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
