import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Table,
  CheckCircle2,
} from 'lucide-react';

interface InvoiceData {
  documentType: string;
  issuer: {
    name: string;
    address?: string;
    taxId?: string;
    contact?: string;
  };
  recipient: {
    name: string;
    address?: string;
  };
  metadata: {
    invoiceNumber: string;
    issueDate: string;
    dueDate?: string;
    currency: string;
    subtotal: string;
    taxRate?: string;
    taxAmount?: string;
    totalAmount: string;
    paymentStatus?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  extractedFields: Array<{
    fieldName: string;
    value: string;
    confidence: string;
  }>;
}

export const InvoiceFormProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload an invoice, receipt, purchase order, or tax form PDF.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setData(null);

      const text = await extractTextFromPdfFile(file);
      if (!text) throw new Error('Could not extract readable text from the document.');

      const response: InvoiceData = await api.geminiAdvanced({
        action: 'invoice_form_extractor',
        textContext: text,
      });

      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Invoice extraction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!data) return;

    let csv = 'Description,Quantity,Unit Price,Total\n';
    data.lineItems?.forEach((item) => {
      csv += `"${item.description.replace(/"/g, '""')}",${item.quantity},"${item.unitPrice}","${item.total}"\n`;
    });

    csv += `\nSubtotal,,,"${data.metadata.subtotal}"\n`;
    csv += `Tax (${data.metadata.taxRate || '0'}),,,"${data.metadata.taxAmount || '$0'}"\n`;
    csv += `Grand Total,,,"${data.metadata.totalAmount}"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${data.metadata.invoiceNumber || 'Export'}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Receipt className="w-3.5 h-3.5" />
            <span>AI Financial & Form Matrix Extractor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Form & Invoice Batch Processor
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Extract structured line-item tables, tax breakdowns, vendor details, and payment terms from scanned invoices, receipts, and government forms into clean CSV/Excel formats.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <label className="border-2 border-dashed border-white/[0.12] hover:border-amber-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-amber-500/[0.02] group">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
              {file ? file.name : 'Select or drop Invoice / Form PDF'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Extracts line-items, amounts, dates & tax IDs</p>
          </label>

          <div className="text-center">
            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Line-Items & Table Coordinates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Form & Invoice Data</span>
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

        {/* Data Deck Presentation */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Cards (Issuer & Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Issuer */}
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Billed From (Vendor)
                </span>
                <p className="text-base font-bold text-white">{data.issuer?.name || 'Detected Vendor'}</p>
                <p className="text-xs text-slate-400">{data.issuer?.address || 'Address on file'}</p>
                {data.issuer?.taxId && (
                  <p className="text-[11px] font-mono text-slate-500 pt-1">Tax ID: {data.issuer.taxId}</p>
                )}
              </div>

              {/* Card 2: Client */}
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To (Client)</span>
                <p className="text-base font-bold text-white">{data.recipient?.name || 'Client Name'}</p>
                <p className="text-xs text-slate-400">{data.recipient?.address || 'Client Address'}</p>
              </div>

              {/* Card 3: Total Due */}
              <div className="bg-[#0e101a] border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Amount</span>
                  <p className="text-3xl font-black text-amber-300 mt-1">{data.metadata?.totalAmount}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
                  <span>Inv #: {data.metadata?.invoiceNumber}</span>
                  <span>Date: {data.metadata?.issueDate}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-amber-400" />
                  Structured Line-Item Matrix ({data.lineItems?.length || 0})
                </h3>

                <button
                  onClick={downloadCsv}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Export to CSV / Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      <th className="py-3 px-4 font-bold uppercase tracking-wider">Item Description</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Qty</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Unit Price</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {data.lineItems?.map((item, idx) => (
                      <tr key={`item-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-200">{item.description}</td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-mono">{item.unitPrice}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-300 font-mono">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t border-white/[0.08]">
                <div className="w-full max-w-xs space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">{data.metadata?.subtotal}</span>
                  </div>
                  {data.metadata?.taxAmount && (
                    <div className="flex justify-between text-slate-400">
                      <span>Tax ({data.metadata?.taxRate || '0%'}):</span>
                      <span className="font-mono text-slate-200">{data.metadata.taxAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                    <span>Grand Total:</span>
                    <span className="font-mono text-amber-400">{data.metadata?.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Key-Value Form Fields */}
            {data.extractedFields && data.extractedFields.length > 0 && (
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Extracted Form Fields</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {data.extractedFields.map((field, i) => (
                    <div key={`f-${i}`} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{field.fieldName}</span>
                      <p className="text-xs font-semibold text-slate-200 truncate">{field.value}</p>
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
