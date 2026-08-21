import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog, saveAnalyzerReport } from '../utils/storageUtils';
import { postApiJson } from '../utils/apiClient';
import { pdfjsLib, ensurePdfWorkerConfigured } from '../utils/pdfWorker';
import {
  ShieldCheck,
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileCode,
  Download,
  ListTodo,
  FileText,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

ensurePdfWorkerConfigured();

export interface RiskItem {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ActionItem {
  task: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExtractedEntities {
  personNames: string[];
  organizations: string[];
  dates: string[];
  amounts: string[];
  phoneNumbers: string[];
  emails: string[];
  addresses: string[];
  ids: string[];
}

export interface AnalysisResult {
  documentType:
    | 'Invoice'
    | 'Resume'
    | 'Contract'
    | 'Agreement'
    | 'Bank Statement'
    | 'Aadhaar'
    | 'PAN'
    | 'Passport'
    | 'Report'
    | 'Medical Record'
    | 'Unknown';
  confidenceScore: number;
  executiveSummary: string;
  entities: ExtractedEntities;
  risks: RiskItem[];
  actionItems: ActionItem[];
}

const SAMPLE_DOCUMENTS: Record<string, { label: string; text: string }> = {
  invoice: {
    label: 'Sample Invoice',
    text: `INVOICE #INV-2026-8891
Date: July 15, 2026
Due Date: August 15, 2026

Vendor: Global Tech Solutions LLC
Address: 450 Innovation Way, Suite 800, San Francisco, CA 94105
Tax ID / EIN: 94-3829102
Email: billing@globaltech.com | Phone: +1 (415) 555-0199

Billed To: Acme Enterprises Corp.
Contact Person: Sarah Jenkins (VP Procurement)
Email: s.jenkins@acme.com
Address: 100 Corporate Parkway, New York, NY 10001

Description:
1. Enterprise Cloud Subscription (Annual) - $45,000.00
2. Professional Services & Implementation - $12,500.00
Subtotal: $57,500.00
Tax (8.875%): $5,103.13
Total Amount Due: $62,603.13

Payment Terms: Net 30. Wire transfer to Account #9876543210 (Routing #021000021).
Note: Signature required on receipt. Outstanding balance subject to 1.5% late fee per month.`,
  },
  contract: {
    label: 'Sample Service Agreement',
    text: `CONFIDENTIAL MASTER SERVICES AGREEMENT

This Agreement is entered into on June 1, 2024, by and between Apex Systems Inc. ("Provider"), located at 220 Market St, Austin, TX 78701 (Contact: David Miller, CEO, david@apexsystems.io, Phone: +1 512-555-0144), and Horizon Logistics Ltd. ("Client"), located at 500 Freight Way, Chicago, IL 60607.

Term & Expiration:
This Agreement commences on June 1, 2024 and expires on May 31, 2025.

Total Contract Value: $120,000.00 payable in monthly installments of $10,000.00.

Key Terms & Risk Factors:
- Missing Execution Signature: Counterparty signature block is pending execution.
- Notice Period: Either party may terminate with 30 days written notice.
- Liability Cap: Limited to $100,000.00.
- Dispute Resolution: Binding arbitration in Travis County, Texas.
Governing Law: Laws of the State of Texas.`,
  },
};

export const DocumentAnalyzer: React.FC = () => {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    setSelectedFile(file);
    setLoadingPdf(true);
    setAnalysisResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let extracted = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        extracted += content.items.map((it: any) => it.str).join(' ') + '\n\n';
      }

      setRawText(extracted);
      toast.success(`Loaded PDF document (${pdf.numPages} pages)`);
    } catch (err: any) {
      toast.error('Failed to parse PDF text: ' + err.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleLoadSample = (sampleKey: string) => {
    const sample = SAMPLE_DOCUMENTS[sampleKey];
    if (sample) {
      setRawText(sample.text);
      setSelectedFile(null);
      setAnalysisResult(null);
      toast.info(`Loaded ${sample.label}`);
    }
  };

  const runAnalysis = async () => {
    if (!rawText.trim()) {
      toast.error('Please upload a PDF document or paste text to analyze.');
      return;
    }

    setAnalyzing(true);
    try {
      const data = await postApiJson<AnalysisResult>('/api/gemini/analyzer', {
        textContext: rawText,
      });

      setAnalysisResult(data);
      toast.success('Document analysis completed successfully!');

      saveAnalyzerReport({
        title: selectedFile ? `${selectedFile.name} Audit` : `${data.documentType} Audit Report`,
        documentType: data.documentType,
        confidenceScore: data.confidenceScore,
        executiveSummary: data.executiveSummary,
        entities: data.entities,
        risks: data.risks,
        actionItems: data.actionItems,
        folder: data.documentType === 'Invoice' ? 'Invoices' : data.documentType === 'Contract' ? 'Contracts' : 'General',
        tags: [data.documentType, 'AI Audit'],
      });

      if (selectedFile) {
        saveRecentFile({
          name: selectedFile.name,
          size: selectedFile.size,
          toolId: 'document-analyzer',
          toolName: 'Document Analyzer',
          status: 'processed',
        });
      }

      addActivityLog('Analyzed document type: ' + data.documentType, 'AI Tools');
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const exportJSON = () => {
    if (!analysisResult) return;
    const jsonStr = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpdf-analysis-${analysisResult.documentType.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported JSON analysis!');
  };

  const exportPDF = () => {
    if (!analysisResult) return;
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('SmartPDF AI v1.2 - Document Analysis Report', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
      doc.text(`Document Type: ${analysisResult.documentType} (Confidence: ${analysisResult.confidenceScore}%)`, 14, 33);

      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      let y = 45;

      // Executive Summary
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Executive Summary', 14, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(analysisResult.executiveSummary, 180);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 5 + 6;

      // Extracted Entities
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Key Extracted Entities', 14, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      const e = analysisResult.entities;
      const entitySummary = [
        `Persons: ${e.personNames?.join(', ') || 'None'}`,
        `Organizations: ${e.organizations?.join(', ') || 'None'}`,
        `Dates: ${e.dates?.join(', ') || 'None'}`,
        `Financial Amounts: ${e.amounts?.join(', ') || 'None'}`,
        `Emails: ${e.emails?.join(', ') || 'None'}`,
        `Phones: ${e.phoneNumbers?.join(', ') || 'None'}`,
        `IDs / Reg: ${e.ids?.join(', ') || 'None'}`,
      ];

      for (const line of entitySummary) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const wrapped = doc.splitTextToSize(line, 180);
        doc.text(wrapped, 14, y);
        y += wrapped.length * 4.5;
      }
      y += 4;

      // Risks
      if (analysisResult.risks && analysisResult.risks.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Detected Risks & Issues', 14, y);
        y += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        for (const risk of analysisResult.risks) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const riskText = `[${risk.severity.toUpperCase()}] ${risk.title}: ${risk.description}`;
          const wrapped = doc.splitTextToSize(riskText, 180);
          doc.text(wrapped, 14, y);
          y += wrapped.length * 4.5 + 2;
        }
        y += 4;
      }

      // Action Items
      if (analysisResult.actionItems && analysisResult.actionItems.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Action Items', 14, y);
        y += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        for (const item of analysisResult.actionItems) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const itemText = `• [Priority: ${item.priority.toUpperCase()}] ${item.task}`;
          const wrapped = doc.splitTextToSize(itemText, 180);
          doc.text(wrapped, 14, y);
          y += wrapped.length * 4.5 + 2;
        }
      }

      doc.save(`smartpdf-analysis-${analysisResult.documentType.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success('Exported PDF analysis report!');
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  const exportDocx = async () => {
    if (!analysisResult) return;
    try {
      const e = analysisResult.entities;

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: 'SmartPDF AI v1.2 - Enterprise Document Analysis',
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Document Type: `, bold: true }),
                  new TextRun(`${analysisResult.documentType} (Confidence: ${analysisResult.confidenceScore}%)`),
                ],
              }),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Executive Summary',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({ text: analysisResult.executiveSummary }),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Extracted Entities',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Person Names: ', bold: true }),
                  new TextRun(e.personNames?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Organizations: ', bold: true }),
                  new TextRun(e.organizations?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Dates: ', bold: true }),
                  new TextRun(e.dates?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Amounts: ', bold: true }),
                  new TextRun(e.amounts?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Phone Numbers: ', bold: true }),
                  new TextRun(e.phoneNumbers?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Emails: ', bold: true }),
                  new TextRun(e.emails?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Addresses: ', bold: true }),
                  new TextRun(e.addresses?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'IDs / Registration: ', bold: true }),
                  new TextRun(e.ids?.join(', ') || 'None'),
                ],
              }),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Detected Risks & Issues',
                heading: HeadingLevel.HEADING_2,
              }),
              ...analysisResult.risks.map(
                (r) =>
                  new Paragraph({
                    children: [
                      new TextRun({ text: `[${r.severity.toUpperCase()}] ${r.title}: `, bold: true }),
                      new TextRun(r.description),
                    ],
                  })
              ),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Action Items',
                heading: HeadingLevel.HEADING_2,
              }),
              ...analysisResult.actionItems.map(
                (a) =>
                  new Paragraph({
                    children: [
                      new TextRun({ text: `• [${a.priority.toUpperCase()}] `, bold: true }),
                      new TextRun(a.task),
                    ],
                  })
              ),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartpdf-analysis-${analysisResult.documentType.toLowerCase().replace(/\s+/g, '-')}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Exported DOCX report!');
    } catch (err: any) {
      toast.error('Failed to generate DOCX: ' + err.message);
    }
  };

  const copySummaryToClipboard = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult.executiveSummary);
    setCopiedSummary(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getDocBadgeColor = (type: string) => {
    switch (type) {
      case 'Invoice':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Contract':
      case 'Agreement':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Resume':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Bank Statement':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Aadhaar':
      case 'PAN':
      case 'Passport':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Medical Record':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Enterprise Document Analyzer - SmartPDF AI"
        description="Automated document classification, entity extraction, risk detection, and executive summaries with Gemini AI."
        toolName="Document Analyzer"
        path="/analyzer"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/20 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> SmartPDF AI v1.2 Enterprise
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileSearch className="w-7 h-7 text-red-500" /> Enterprise Document Analyzer
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Auto-detect document types, extract names, dates, amounts, and IDs, identify compliance risks, and generate action items instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadSample('invoice')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Sample Invoice
          </button>
          <button
            onClick={() => handleLoadSample('contract')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" /> Sample Contract
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Raw Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-red-400" /> 1. Upload or Paste Document
            </h2>

            <FileUploader onFilesSelected={handleFileSelect} accept=".pdf" title="Drop PDF document here" description="Upload invoice, contract, resume, or report PDF" />

            {loadingPdf && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> Extracting PDF content...
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Document Text Content ({rawText.length} characters)
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Upload a PDF above or paste text content here to analyze..."
                className="w-full h-44 bg-[#0A0A0C] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/50 resize-none font-mono"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={analyzing || !rawText.trim()}
              className="mt-4 w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Enterprise AI Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Results Dashboard */}
        <div className="lg:col-span-7">
          {!analysisResult && !analyzing && (
            <div className="h-full min-h-[400px] bg-[#121215] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Document Analyzed Yet</h3>
              <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
                Upload an Invoice, Contract, Resume, Bank Statement, Government ID (Aadhaar/PAN/Passport), or Medical Record to view full AI risk detection, entity extraction, and executive summaries.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSample('invoice')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                >
                  Try Invoice Sample
                </button>
                <button
                  onClick={() => handleLoadSample('contract')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                >
                  Try Contract Sample
                </button>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="h-full min-h-[400px] bg-[#121215] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Analyzing Document Structure</h3>
              <p className="text-slate-400 text-xs max-w-sm">
                Extracting entities, validating compliance risks, and compiling executive summaries with Gemini AI...
              </p>
            </div>
          )}

          {analysisResult && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Top Summary Header Bar */}
                <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDocBadgeColor(analysisResult.documentType)}`}>
                        {analysisResult.documentType}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Confidence Score: <strong className="text-white">{analysisResult.confidenceScore}%</strong>
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Analysis Dashboard</h2>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={exportPDF}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                      title="Export PDF Report"
                    >
                      <Download className="w-3.5 h-3.5 text-red-400" /> PDF
                    </button>
                    <button
                      onClick={exportDocx}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                      title="Export Word Document"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" /> DOCX
                    </button>
                    <button
                      onClick={exportJSON}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                      title="Export Raw JSON"
                    >
                      <FileCode className="w-3.5 h-3.5 text-amber-400" /> JSON
                    </button>
                  </div>
                </div>

                {/* Executive Summary Card */}
                <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-400" /> Executive Summary
                    </h3>
                    <button
                      onClick={copySummaryToClipboard}
                      className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Summary
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0A0C] p-4 rounded-xl border border-slate-800/60 whitespace-pre-line">
                    {analysisResult.executiveSummary}
                  </p>
                </div>

                {/* Extracted Entities Grid */}
                <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" /> Extracted Information Cards
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Persons */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <User className="w-4 h-4 text-blue-400" /> Person Names
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.entities.personNames?.length > 0 ? (
                          analysisResult.entities.personNames.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Organizations */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <Building2 className="w-4 h-4 text-purple-400" /> Organizations
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.entities.organizations?.length > 0 ? (
                          analysisResult.entities.organizations.map((org, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                              {org}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <Calendar className="w-4 h-4 text-amber-400" /> Dates
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.entities.dates?.length > 0 ? (
                          analysisResult.entities.dates.map((d, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Financial Amounts */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" /> Financial Amounts
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.entities.amounts?.length > 0 ? (
                          analysisResult.entities.amounts.map((amt, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                              {amt}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Emails & Phones */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <Mail className="w-4 h-4 text-cyan-400" /> Emails & Phone
                      </div>
                      <div className="space-y-1">
                        {analysisResult.entities.emails?.map((email, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-cyan-300">
                            <Mail className="w-3 h-3 text-cyan-500" /> {email}
                          </div>
                        ))}
                        {analysisResult.entities.phoneNumbers?.map((phone, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500" /> {phone}
                          </div>
                        ))}
                        {(!analysisResult.entities.emails?.length && !analysisResult.entities.phoneNumbers?.length) && (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* IDs & Addresses */}
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                        <FileCode className="w-4 h-4 text-rose-400" /> IDs & Addresses
                      </div>
                      <div className="space-y-1">
                        {analysisResult.entities.ids?.map((idNum, idx) => (
                          <div key={idx} className="text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block mr-1">
                            {idNum}
                          </div>
                        ))}
                        {analysisResult.entities.addresses?.map((addr, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" /> {addr}
                          </div>
                        ))}
                        {(!analysisResult.entities.ids?.length && !analysisResult.entities.addresses?.length) && (
                          <span className="text-xs text-slate-600 italic">None detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risks & Compliance */}
                <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk & Compliance Audit
                  </h3>

                  {analysisResult.risks?.length > 0 ? (
                    <div className="space-y-2.5">
                      {analysisResult.risks.map((risk, idx) => (
                        <div key={idx} className="bg-[#0A0A0C] border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-3">
                          <AlertTriangle
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              risk.severity === 'high' ? 'text-red-500' : risk.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{risk.title}</span>
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                  risk.severity === 'high'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : risk.severity === 'medium'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {risk.severity} Risk
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-normal">{risk.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0A0A0C] border border-slate-800/60 p-4 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No major compliance or execution risks detected in this document.
                    </div>
                  )}
                </div>

                {/* Action Items List */}
                <div className="bg-[#121215] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-red-400" /> Recommended Action Items
                  </h3>

                  {analysisResult.actionItems?.length > 0 ? (
                    <div className="space-y-2">
                      {analysisResult.actionItems.map((item, idx) => (
                        <div key={idx} className="bg-[#0A0A0C] border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <ChevronRight className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-xs text-slate-200 font-medium">{item.task}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              item.priority === 'high' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800'
                            }`}
                          >
                            {item.priority} priority
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3">No pending action items required.</div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
