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
  Table,
  RefreshCw,
  Zap,
  FileSpreadsheet,
  Sliders,
} from 'lucide-react';

export const ExcelToPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      toast.error('Invalid file format. Please upload an Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    setSelectedFile(file);
    toast.info(`Selected spreadsheet "${file.name}"`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Reading spreadsheet worksheets and structure...');
      
      const pdfBlob = await ExcelConverterService.excelToPDF(selectedFile, {
        pageSize,
        orientation,
        onProgress: (percent, statusMsg) => {
          updateProgress(percent, statusMsg || 'Generating PDF tables...');
        },
      });

      setResultBlob(pdfBlob);
      const outFileName = selectedFile.name.replace(/\.(xlsx|xls|csv)$/i, '') + '.pdf';
      setSuccess('Excel spreadsheet converted to PDF successfully!');
      toast.success('Conversion complete! PDF ready for download.');

      saveRecentFile({
        name: outFileName,
        size: pdfBlob.size,
        toolId: 'excel-to-pdf',
        toolName: 'Excel to PDF',
        status: 'completed',
      });

      addActivityLog(`Converted ${selectedFile.name} to PDF`, 'Excel to PDF');
    } catch (err: any) {
      const msg = err?.message || 'Failed to convert Excel spreadsheet to PDF.';
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
        toolName="Excel to PDF Converter"
        description="Convert Excel spreadsheets (.xlsx, .xls) and CSV files into formatted PDF tables instantly in your browser."
        path="/excel-to-pdf-tool"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <ToolHeader
          icon={FileSpreadsheet}
          title="Excel to PDF Converter"
          description="Transform Excel workbooks (.xlsx, .xls) and CSV spreadsheets into formatted PDF table documents with 100% data privacy."
          badge="Spreadsheet Engine"
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
                accept=".xlsx,.xls,.csv"
                multiple={false}
                title="Drop Excel Spreadsheet or CSV File"
                description="Supports Microsoft Excel (.xlsx, .xls) and CSV table files up to 50MB"
              />
            ) : (
              <div className="bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
                {/* File Information Card */}
                <div className="flex items-center justify-between p-4 bg-[#12131f] border border-white/[0.06] rounded-xl">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
                      <Table className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Format: <span className="uppercase font-mono text-emerald-400">{selectedFile.name.split('.').pop()}</span> • Size: {formatBytes(selectedFile.size)}
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

                {/* Conversion Settings Options */}
                <div className="p-4 bg-[#12131f]/60 border border-white/[0.06] rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sliders className="w-4 h-4 text-red-400" />
                    <span>PDF Page Setup</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Page Size */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Page Size</label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                        className="w-full bg-[#08090d] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="a4">A4 (Standard)</option>
                        <option value="letter">US Letter</option>
                      </select>
                    </div>

                    {/* Page Orientation */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Orientation</label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                        className="w-full bg-[#08090d] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape (Recommended for wide tables)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Convert Excel to PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Highlights Panel */}
          <div className="lg:col-span-4 space-y-6">
            <PremiumSidebarPanel
              toolName="Excel to PDF"
              tips={[
                'Use Landscape orientation for wide spreadsheets with many columns.',
                'Worksheet names are automatically embedded as page headings.',
                '100% private in-browser conversion with WebAssembly memory.',
              ]}
              supportedFormats={['.xlsx', '.xls', '.csv']}
              maxSizeMB={50}
            />
          </div>
        </div>

        {/* Processing and Success Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile ? selectedFile.name.replace(/\.(xlsx|xls|csv)$/i, '') + '.pdf' : 'spreadsheet.pdf'}
          onReset={handleReset}
          title="Converting Excel Spreadsheet"
        />
      </div>
    </motion.div>
  );
};
