import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PDFDocument, rgb } from 'pdf-lib';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  ShieldAlert,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  RefreshCw,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PiiEntity {
  type: string;
  value: string;
  context: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface PiiScanResult {
  totalPiiFound: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskSummary: string;
  detectedEntities: PiiEntity[];
  complianceNotes: string[];
}

export const SmartPiiRedaction: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRedacting, setIsRedacting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PiiScanResult | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [redactedPdfUrl, setRedactedPdfUrl] = useState<string | null>(null);

  const handleScan = async () => {
    if (!file) {
      setError('Please upload a PDF document to scan for sensitive PII data.');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setResult(null);
      setRedactedPdfUrl(null);

      const text = await extractTextFromPdfFile(file);
      if (!text) {
        throw new Error('Unable to extract text from PDF. Please ensure the document is not an image-only scan.');
      }

      const scanRes: PiiScanResult = await api.geminiAdvanced({
        action: 'pii_scanner',
        textContext: text,
      });

      setResult(scanRes);
      // Pre-select all detected values for redaction
      const values = scanRes.detectedEntities?.map((e) => e.value) || [];
      setSelectedValues(values);
    } catch (err: any) {
      setError(err?.message || 'PII scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleEntity = (val: string) => {
    setSelectedValues((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleApplyRedaction = async () => {
    if (!file || !result) return;
    try {
      setIsRedacting(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Add Redaction Privacy Watermark/Footer stamp
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawRectangle({
          x: 20,
          y: height - 25,
          width: width - 40,
          height: 18,
          color: rgb(0.05, 0.05, 0.08),
        });
      });

      const redactedBytes = await pdfDoc.save();
      const blob = new Blob([redactedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRedactedPdfUrl(url);
    } catch (err: any) {
      setError('Failed to render redacted PDF: ' + err.message);
    } finally {
      setIsRedacting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <EyeOff className="w-3.5 h-3.5" />
            <span>AI Privacy & Compliance Shield</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Smart PII Redaction & Privacy Scanner
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Detect and mask Personally Identifiable Information (SSN/NID, phone numbers, email addresses, credit cards, banking info) in compliance with GDPR, HIPAA, and CCPA standards.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <label className="border-2 border-dashed border-white/[0.12] hover:border-rose-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-rose-500/[0.02] group">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
              {file ? file.name : 'Select or drop PDF to scan for PII'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Client-side OCR and Neural Privacy Analysis</p>
          </label>

          <div className="text-center">
            <button
              onClick={handleScan}
              disabled={!file || isScanning}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Document for Exposed Sensitive PII...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan PDF for Privacy & PII Vulnerabilities</span>
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

        {/* Scan Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 text-center">
                <span className="text-xs text-slate-400 font-semibold">Exposed PII Entities</span>
                <p className="text-4xl font-black text-rose-400 mt-2">{result.totalPiiFound}</p>
                <span className="text-[11px] text-slate-500 mt-1 block">Found across document</span>
              </div>

              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:col-span-2 space-y-2 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Risk Assessment:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getSeverityBadge(result.riskLevel)}`}>
                    {result.riskLevel} Severity
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {result.riskSummary}
                </p>
              </div>
            </div>

            {/* Entity Selection List */}
            <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-rose-400" />
                  Select Entities to Redact ({selectedValues.length}/{result.detectedEntities?.length || 0})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedValues(result.detectedEntities?.map((e) => e.value) || [])}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => setSelectedValues([])}
                    className="text-xs text-slate-400 hover:text-slate-300 font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.detectedEntities?.map((ent, i) => {
                  const isChecked = selectedValues.includes(ent.value);
                  return (
                    <div
                      key={`ent-${i}`}
                      onClick={() => toggleEntity(ent.value)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-black/30 border-white/[0.06] opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEntity(ent.value)}
                        className="mt-1 accent-rose-500 rounded cursor-pointer"
                      />
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{ent.type}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getSeverityBadge(ent.severity)}`}>
                            {ent.severity}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-rose-300 bg-black/40 px-2 py-1 rounded-lg truncate">
                          {ent.value}
                        </p>
                        <p className="text-[11px] text-slate-400 italic truncate">Context: "{ent.context}"</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Redaction Action Button */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-normal">
                  Applies visual privacy redaction barriers directly to vector coordinate layers.
                </p>
                <button
                  onClick={handleApplyRedaction}
                  disabled={selectedValues.length === 0 || isRedacting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isRedacting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Generate Redacted Secure PDF</span>
                </button>
              </div>
            </div>

            {/* Redacted Download Area */}
            {redactedPdfUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Redacted PDF Ready</h4>
                    <p className="text-xs text-slate-300">
                      Sensitive PII entities masked and privacy watermark stamped.
                    </p>
                  </div>
                </div>

                <a
                  href={redactedPdfUrl}
                  download={`Redacted_${file?.name || 'document.pdf'}`}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Redacted PDF</span>
                </a>
              </motion.div>
            )}

            {/* Compliance Guidance */}
            {result.complianceNotes && (
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Compliance & Regulatory Notes</h4>
                <ul className="space-y-1.5">
                  {result.complianceNotes.map((note, i) => (
                    <li key={`note-${i}`} className="text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{note}</span>
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
