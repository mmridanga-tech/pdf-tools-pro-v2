import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  GitCompare,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Edit3,
} from 'lucide-react';

interface DiffResult {
  summary: string;
  changeScore: number;
  changesCount: { additions: number; deletions: number; modifications: number };
  diffItems: Array<{
    type: 'addition' | 'deletion' | 'modification';
    section: string;
    originalText?: string;
    newText?: string;
    impact: 'Low' | 'Medium' | 'High' | 'Critical';
    explanation: string;
  }>;
  recommendations: string[];
}

export const PdfDiffCompare: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiffResult | null>(null);

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please upload both original (Document 1) and modified (Document 2) PDF files.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);

      const [text1, text2] = await Promise.all([
        extractTextFromPdfFile(file1),
        extractTextFromPdfFile(file2),
      ]);

      if (!text1 || !text2) {
        throw new Error('Could not extract readable text from one of the documents. Ensure they contain readable text or run OCR first.');
      }

      const response = await api.geminiAdvanced({
        action: 'diff_compare',
        doc1Text: text1,
        doc2Text: text2,
      });

      setResult(response);
    } catch (err: any) {
      setError(err?.message || 'Comparison failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <GitCompare className="w-3.5 h-3.5" />
            <span>AI Neural Diff Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI PDF Comparison & Diff Analyzer
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Compare contracts, revisions, policy updates, and agreements side-by-side. Detect additions, clause deletions, and subtle wording alterations instantly with Gemini AI.
          </p>
        </div>

        {/* Upload Panels Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doc 1 (Baseline / Original) */}
          <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Version A: Original / Baseline PDF
              </span>
              {file1 && <span className="text-xs text-slate-400 font-mono">{(file1.size / 1024).toFixed(1)} KB</span>}
            </div>

            <label className="border-2 border-dashed border-white/[0.12] hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-blue-500/[0.02] group">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile1(e.target.files[0]);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {file1 ? file1.name : 'Select or drop Original PDF'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Click to browse baseline document</p>
            </label>
          </div>

          {/* Doc 2 (Modified / Revised) */}
          <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Version B: Revised / New PDF
              </span>
              {file2 && <span className="text-xs text-slate-400 font-mono">{(file2.size / 1024).toFixed(1)} KB</span>}
            </div>

            <label className="border-2 border-dashed border-white/[0.12] hover:border-purple-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-purple-500/[0.02] group">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile2(e.target.files[0]);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {file2 ? file2.name : 'Select or drop Revised PDF'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Click to browse modified version</p>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isAnalyzing}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Comparing Document Structures & Clauses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Run Intelligent AI Diff Comparison</span>
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Diff Results Presentation */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Score Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-2xl p-5 text-center">
                <span className="text-xs text-slate-400 font-medium">Similarity Match</span>
                <p className="text-3xl font-black text-purple-400 mt-1">{result.changeScore}%</p>
              </div>
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-2xl p-5 text-center">
                <span className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Additions
                </span>
                <p className="text-3xl font-black text-emerald-400 mt-1">{result.changesCount?.additions || 0}</p>
              </div>
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-2xl p-5 text-center">
                <span className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1">
                  <MinusCircle className="w-3.5 h-3.5" /> Deletions
                </span>
                <p className="text-3xl font-black text-rose-400 mt-1">{result.changesCount?.deletions || 0}</p>
              </div>
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-2xl p-5 text-center">
                <span className="text-xs text-amber-400 font-medium flex items-center justify-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Modifications
                </span>
                <p className="text-3xl font-black text-amber-400 mt-1">{result.changesCount?.modifications || 0}</p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Executive Diff Audit Summary
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            {/* Detailed Changes Table / Cards */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Granular Change Log ({result.diffItems?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {result.diffItems?.map((item, idx) => (
                  <div
                    key={`diff-${idx}`}
                    className="bg-[#0e101a] border border-white/[0.08] rounded-2xl p-5 space-y-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            item.type === 'addition'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.type === 'deletion'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-sm font-bold text-white">{item.section}</span>
                      </div>
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${getImpactBadge(item.impact)}`}>
                        {item.impact} Impact
                      </span>
                    </div>

                    {item.originalText && (
                      <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300">
                        <span className="font-bold block text-[10px] uppercase text-rose-400 mb-1">Original Text (Version A):</span>
                        <p className="line-through">{item.originalText}</p>
                      </div>
                    )}

                    {item.newText && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300">
                        <span className="font-bold block text-[10px] uppercase text-emerald-400 mb-1">New Text (Version B):</span>
                        <p>{item.newText}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      <span className="text-slate-300 font-semibold">Impact Assessment: </span>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Legal & Review Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={`rec-${i}`} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
