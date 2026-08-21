import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { ExcelConverterService } from '../services/excelConverterService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { saveRecentFile, addActivityLog } from '../utils/storageUtils';
import {
  PremiumSteps,
  PremiumSidebarPanel,
} from '../components/tool-ui';
import {
  FileText,
  RefreshCw,
  Zap,
  FileSpreadsheet,
  Table,
  ShieldCheck,
  Grid,
  Layers,
} from 'lucide-react';

export const PDFToExcel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

    if (ext !== '.pdf') {
      toast.error('Invalid file format. Please upload a PDF file (.pdf).');
      return;
    }

    setSelectedFile(file);
    toast.info(`Selected PDF document "${file.name}"`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Extracting PDF text structures and tables...');

      const xlsxBlob = await ExcelConverterService.pdfToExcel(selectedFile, {
        onProgress: (percent, statusMsg) => {
          updateProgress(percent, statusMsg || 'Parsing PDF table rows...');
        },
      });

      setResultBlob(xlsxBlob);
      const outFileName = selectedFile.name.replace(/\.pdf$/i, '') + '.xlsx';
      setSuccess('PDF tables converted to Excel workbook successfully!');
      toast.success('Conversion complete! Excel spreadsheet ready for download.');

      saveRecentFile({
        name: outFileName,
        size: xlsxBlob.size,
        toolId: 'pdf-to-excel',
        toolName: 'PDF to Excel',
        status: 'completed',
      });

      addActivityLog(`Converted ${selectedFile.name} to Excel`, 'PDF to Excel');
    } catch (err: any) {
      const msg = err?.message || 'Failed to convert PDF document to Excel workbook.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultBlob(null);
    reset();
  };

  const currentStep = resultBlob ? 3 : state.status === 'processing' ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090d] py-10 sm:py-14"
    >
      <SEO
        toolName="PDF to Excel Converter"
        description="Extract PDF tables and structured document data into an editable Excel spreadsheet (.xlsx) directly in your browser."
        path="/pdf-to-excel"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <ToolHeader
          icon={FileSpreadsheet}
          title="PDF to Excel Converter"
          description="Transform PDF tables, financial reports, and structured document data into editable Microsoft Excel workbooks (.xlsx) with 100% data privacy."
          badge="Table Extraction Engine"
        />

        {/* Step Progress */}
        <PremiumSteps currentStep={currentStep} />

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Conversion Area */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                accept=".pdf"
                multiple={false}
                title="Drop PDF Document with Tables"
                description="Supports PDF documents with tables, financial statements, or grid structures up to 100MB"
              />
            ) : (
              <div className="bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
                {/* File Information Card */}
                <div className="flex items-center justify-between p-4 bg-[#12131f] border border-white/[0.06] rounded-xl">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Format: <span className="uppercase font-mono text-red-400">PDF</span> • Size: {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/[0.06] transition-colors shrink-0"
                    title="Remove file"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Conversion Info Note */}
                <div className="p-4 bg-[#12131f]/60 border border-white/[0.06] rounded-xl flex items-start gap-3 text-xs text-slate-300">
                  <Table className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Automatic Table Grid Detection:</span>
                    <p className="text-slate-400 mt-0.5">
                      Text elements and table rows will be mapped directly into Excel worksheet rows and columns based on their geometric coordinates.
                    </p>
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Convert PDF to Excel (.xlsx)</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Highlights Panel */}
          <div className="lg:col-span-4 space-y-6">
            <PremiumSidebarPanel
              toolName="PDF to Excel"
              tips={[
                'Multi-page PDFs create individual worksheet tabs (Page_1, Page_2, etc.).',
                'Table cell boundaries are parsed using horizontal and vertical coordinate clustering.',
                '100% private client-side processing — no files leave your browser.',
              ]}
              supportedFormats={['.pdf']}
              maxSizeMB={100}
            />
          </div>
        </div>

        {/* Processing and Success Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile ? selectedFile.name.replace(/\.pdf$/i, '') + '.xlsx' : 'document.xlsx'}
          onReset={handleReset}
          title="Converting PDF to Excel"
        />
      </div>
    </motion.div>
  );
};
