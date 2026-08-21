import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Hash,
  Download,
  Loader2,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DocumentAnalysisReport, UserSession } from '../types';
import { api } from '../services/apiClient';
import { triggerFileDownload } from '../lib/pdfEngine';

interface DocumentAnalyzerViewProps {
  onBack: () => void;
  userSession: UserSession;
  onOpenPricing: () => void;
}

export const DocumentAnalyzerView: React.FC<DocumentAnalyzerViewProps> = ({
  onBack,
  userSession,
  onOpenPricing,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DocumentAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleContract = `NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
This Agreement is entered into on January 15, 2025 by and between:
Party A: Vertex Cloud Technologies Inc., registered at 100 Enterprise Way, San Francisco, CA. Email: legal@vertexcloud.com, Phone: +1-415-555-0199.
Party B: Apex Global Solutions LLC, represented by CEO Sarah Jenkins. Email: s.jenkins@apexsolutions.io.

1. Purpose and Scope: The parties wish to explore a potential strategic acquisition valued at $4,500,000 USD.
2. Confidentiality Obligations: Receiving party shall protect all proprietary documents, intellectual property, and trade secrets for a period of 5 years.
3. Termination & Governing Law: This agreement terminates on December 31, 2026. Governing law shall be the State of California.
4. Signatures: Signed by Sarah Jenkins on Jan 15, 2025. Party A signature is pending execution.`;

  const runAnalysis = async () => {
    const textToAnalyze = inputText.trim() || sampleContract;
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.geminiAnalyze({
        textContext: textToAnalyze,
      });
      setReport(data);
    } catch (err: any) {
      console.error('Analyzer error:', err);
      setError(err?.message || 'Failed to complete document analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReportJson = () => {
    if (!report) return;
    triggerFileDownload(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
      `smartpdf_audit_report_${Date.now()}.json`,
      'application/json'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit-Grade Gemini AI
          </span>
          {report && (
            <button
              onClick={downloadReportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON Report
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Document Audit Engine</h2>
                <p className="text-xs text-slate-500">Detect compliance risks & extract structured entities</p>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paste Document Text or Agreement Excerpt:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste contract, invoice, statement, or legal document text..."
              rows={12}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 mb-3"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInputText(sampleContract)}
                className="text-xs text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
              >
                Load Sample Agreement
              </button>

              <button
                id="run-analyzer-btn"
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-violet-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Auditing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Deep Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {report ? (
            <div className="space-y-6">
              {/* Document Overview Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classified Document Type</span>
                    <h3 className="text-xl font-extrabold text-slate-900">{report.documentType}</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Confidence: {report.confidenceScore}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Executive Summary</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {report.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Detected Risks & Compliance Alerts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Detected Risks & Compliance Flags ({report.risks?.length || 0})
                </h4>

                <div className="space-y-3">
                  {report.risks && report.risks.length > 0 ? (
                    report.risks.map((risk, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border text-xs ${
                          risk.severity === 'high'
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : risk.severity === 'medium'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>{risk.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                              risk.severity === 'high'
                                ? 'bg-red-200 text-red-800'
                                : risk.severity === 'medium'
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {risk.severity} Severity
                          </span>
                        </div>
                        <p className="opacity-90 leading-relaxed">{risk.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No severe risks or compliance violations detected.</p>
                  )}
                </div>
              </div>

              {/* Structured Extracted Entities */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Extracted Key Entities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {report.entities?.personNames && report.entities.personNames.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <User className="w-3 h-3 text-indigo-600" /> People / Signers
                      </span>
                      <p className="font-semibold text-slate-800">{report.entities.personNames.join(', ')}</p>
                    </div>
                  )}

                  {report.entities?.organizations && report.entities.organizations.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <Building className="w-3 h-3 text-blue-600" /> Organizations
                      </span>
                      <p className="font-semibold text-slate-800">{report.entities.organizations.join(', ')}</p>
                    </div>
                  )}

                  {report.entities?.amounts && report.entities.amounts.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <DollarSign className="w-3 h-3 text-emerald-600" /> Financial Values
                      </span>
                      <p className="font-semibold text-slate-800">{report.entities.amounts.join(', ')}</p>
                    </div>
                  )}

                  {report.entities?.dates && report.entities.dates.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <Calendar className="w-3 h-3 text-amber-600" /> Key Dates
                      </span>
                      <p className="font-semibold text-slate-800">{report.entities.dates.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Action Items */}
              {report.actionItems && report.actionItems.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Recommended Next Action Items</h4>
                  <ul className="space-y-2">
                    {report.actionItems.map((act, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <ArrowRight className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                        <span>{act.task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm mb-1">Awaiting Document Submission</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Paste contract or agreement text on the left and click "Run Deep Analysis" to audit compliance risks and extract structured entities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
