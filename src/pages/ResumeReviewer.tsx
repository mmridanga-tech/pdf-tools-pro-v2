import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  FileCheck,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  FileText,
  RefreshCw,
  Award,
  ArrowRight,
  TrendingUp,
  ListChecks,
  Copy,
  Check,
} from 'lucide-react';

interface ResumeResult {
  atsScore: number;
  candidateName: string;
  detectedRole: string;
  summaryRating: string;
  keyStrengths: string[];
  criticalWeaknesses: string[];
  atsChecklist: Array<{ item: string; passed: boolean; notes: string }>;
  suggestedKeywords: string[];
  bulletRewrites: Array<{ original: string; improved: string; reason: string }>;
  finalVerdict: string;
}

export const ResumeReviewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleReview = async () => {
    if (!file) {
      setError('Please upload your Resume or CV PDF file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);

      const resumeText = await extractTextFromPdfFile(file);
      if (!resumeText) {
        throw new Error('Could not extract readable text from the resume. Please ensure it is not a pure image scan.');
      }

      const response = await api.geminiAdvanced({
        action: 'resume_review',
        textContext: resumeText,
        jobDescription,
      });

      setResult(response);
    } catch (err: any) {
      setError(err?.message || 'Resume audit failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>AI Career & ATS Optimizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Resume / CV Reviewer & ATS Score Engine
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Scan your resume against modern Applicant Tracking System (ATS) parsers. Uncover missing industry keywords, quantify accomplishments, and generate high-impact bullet point rewrites.
          </p>
        </div>

        {/* Upload & Job Description Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Upload Resume (PDF)
            </span>

            <label className="border-2 border-dashed border-white/[0.12] hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-emerald-500/[0.02] group">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {file ? file.name : 'Select or drop your Resume PDF'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports standard single/multi-page CVs</p>
            </label>
          </div>

          {/* Target Job Description */}
          <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Target Job Description (Optional)
              </span>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job title, requirements, or JD description to calibrate ATS keyword matching..."
                rows={5}
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-normal"
              />
            </div>

            <button
              onClick={handleReview}
              disabled={!file || isAnalyzing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Resume Metrics & Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Calculate ATS Score & Review CV</span>
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

        {/* Result Dashboard */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 text-center flex flex-col items-center justify-center">
                <span className="text-xs font-semibold text-slate-400">ATS Pass Score</span>
                <p className={`text-5xl font-black mt-2 ${result.atsScore >= 80 ? 'text-emerald-400' : result.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {result.atsScore}<span className="text-2xl text-slate-500">/100</span>
                </p>
                <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{result.summaryRating}</span>
              </div>

              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:col-span-2 space-y-2 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Candidate:</span>
                  <span className="text-sm font-bold text-white">{result.candidateName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Target Role:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {result.detectedRole}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {result.finalVerdict}
                </p>
              </div>
            </div>

            {/* ATS Checklist & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checklist */}
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  ATS Parsing Verification Checklist
                </h3>
                <div className="space-y-3">
                  {result.atsChecklist?.map((chk, i) => (
                    <div key={`chk-${i}`} className="p-3 rounded-2xl bg-black/30 border border-white/[0.06] flex items-start gap-3">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{chk.item}</span>
                        <span className="text-[11px] text-slate-400">{chk.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords & Strengths */}
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Recommended Keywords to Add
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedKeywords?.map((kw, i) => (
                      <span key={`kw-${i}`} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Strengths</h4>
                  <ul className="space-y-1.5">
                    {result.keyStrengths?.map((str, i) => (
                      <li key={`str-${i}`} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Bullet Point Rewrites */}
            {result.bulletRewrites && result.bulletRewrites.length > 0 && (
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  High-Impact Work Experience Bullet Rewrites
                </h3>

                <div className="space-y-4">
                  {result.bulletRewrites.map((rw, i) => (
                    <div key={`rw-${i}`} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2.5">
                      <div className="text-xs text-rose-300/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">Original (Weak impact):</span>
                        <p>{rw.original}</p>
                      </div>

                      <div className="text-xs text-emerald-300 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">AI Quantified Rewrite:</span>
                          <p className="font-semibold">{rw.improved}</p>
                        </div>
                        <button
                          onClick={() => handleCopyBullet(rw.improved, i)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors shrink-0 cursor-pointer"
                          title="Copy Rewrite"
                        >
                          {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        <span className="font-semibold not-italic text-slate-300">Why this works: </span>
                        {rw.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
