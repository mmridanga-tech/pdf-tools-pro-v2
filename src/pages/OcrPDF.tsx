import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PagePreviewGrid } from '../components/PagePreviewGrid';
import { ToolHeader } from '../components/ToolHeader';
import { OcrLanguageSelector } from '../components/ocr/OcrLanguageSelector';
import { OcrProgressBar } from '../components/ocr/OcrProgressBar';
import { OcrResultsViewer } from '../components/ocr/OcrResultsViewer';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { OCROptions, OCRResultData } from '../types/pdfTypes';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { RecommendedArticles } from '../components/seo/RecommendedArticles';
import { RelatedTools } from '../components/seo/RelatedTools';
import {
  ScanText,
  FileType,
  Sparkles,
  FileText,
  Table as TableIcon,
  AlignLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const OcrPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [options, setOptions] = useState<OCROptions>({
    language: 'eng',
    outputFormat: 'pdf',
    enhanceResolution: true,
    detectTables: true,
    preserveFormatting: true,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activePage, setActivePage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');
  const [ocrData, setOcrData] = useState<OCRResultData | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (selectedFile) {
      const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        PDFService.getPageCount(selectedFile)
          .then((count) => setPageCount(count))
          .catch(() => setPageCount(1));
      } else {
        setPageCount(1);
      }
    }
  }, [selectedFile]);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setOcrData(null);
    setResultBlob(null);
    toast.info(`Selected ${file.name}`);
  };

  const handleRunOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressPercent(5);
    setStatusMessage('Initializing OCR Pro engine...');

    try {
      const result = await PDFService.ocrPDF(selectedFile, options, (percent, msg) => {
        setProgressPercent(percent);
        if (msg) setStatusMessage(msg);
      });

      setResultBlob(result.blob);
      setResultFileName(result.fileName);
      if (result.ocrData) {
        setOcrData(result.ocrData);
      }
      setIsProcessing(false);
      toast.success('OCR text recognition & layout detection completed!');
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err.message || 'An error occurred during OCR recognition.';
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPageCount(0);
    setIsProcessing(false);
    setProgressPercent(0);
    setStatusMessage('');
    setResultBlob(null);
    setResultFileName('');
    setOcrData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="OCR PDF"
        description="Extract text from scanned PDFs & images with high accuracy AI optical character recognition."
        path="/ocr-pdf"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ToolHeader
          icon={ScanText}
          title="Professional OCR Pro"
          description="Extract text from scanned PDFs & images with English and Bengali (বাংলা) support, automatic multi-page processing, table detection, paragraph preservation, and searchable PDF export."
          badge="AI Powered"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.bmp"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select scanned PDF or Image for OCR Pro"
            description="Supports PDF, PNG, JPG, WEBP • Multi-page & Bengali OCR supported"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8"
          >
            {/* Selected File Overview */}
            <div className="p-5 rounded-3xl bg-[#141417]/90 border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                Change Document
              </button>
            </div>

            {/* Document Pages Preview Grid */}
            {pageCount > 0 && selectedFile.type === 'application/pdf' && !ocrData && (
              <div className="bg-[#141417]/80 rounded-3xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Detected Pages ({pageCount})</span>
                </h3>
                <PagePreviewGrid pageCount={pageCount} />
              </div>
            )}

            {/* OCR Options Panel */}
            {!ocrData && (
              <div className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ScanText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">OCR Engine Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Language Selection Component */}
                  <OcrLanguageSelector
                    selectedLanguage={options.language}
                    onChange={(langCode) => setOptions({ ...options, language: langCode })}
                  />

                  {/* Output Format Selection */}
                  <div>
                    <label htmlFor="output-format" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileType className="w-4 h-4 text-amber-400" />
                      <span>Output Export Format</span>
                    </label>
                    <select
                      id="output-format"
                      value={options.outputFormat}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          outputFormat: e.target.value as 'pdf' | 'txt' | 'docx',
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="pdf">Searchable PDF (.pdf) - Scanned Image + Selectable Text</option>
                      <option value="docx">Microsoft Word Document (.docx) - Formatted Paragraphs & Tables</option>
                      <option value="txt">Plain Text Document (.txt) - Raw Extracted Text</option>
                    </select>
                  </div>
                </div>

                {/* Additional Feature Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  {/* Table Detection Toggle */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      options.detectTables
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TableIcon className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Detect Tables</p>
                        <p className="text-[11px] text-slate-400">Extract structured 2D grids</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.detectTables}
                      onChange={(e) => setOptions({ ...options, detectTables: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Paragraph Formatting Toggle */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      options.preserveFormatting
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlignLeft className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Preserve Layout</p>
                        <p className="text-[11px] text-slate-400">Keep paragraphs & spacing</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.preserveFormatting}
                      onChange={(e) => setOptions({ ...options, preserveFormatting: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Resolution Enhancement Toggle */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      options.enhanceResolution
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">High Resolution</p>
                        <p className="text-[11px] text-slate-400">2.5x upscale rendering</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.enhanceResolution}
                      onChange={(e) => setOptions({ ...options, enhanceResolution: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Processing Progress Indicator */}
                {isProcessing && (
                  <OcrProgressBar
                    progressPercent={progressPercent}
                    statusMessage={statusMessage}
                    activePage={activePage}
                    totalPages={totalPages || pageCount}
                  />
                )}

                {/* Submit Action Bar */}
                {!isProcessing && (
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRunOCR}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all cursor-pointer"
                    >
                      <ScanText className="w-5 h-5" />
                      <span>Start Professional OCR Recognition</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* OCR Results Viewer */}
            {ocrData && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ScanText className="w-5 h-5 text-amber-400" />
                    <span>OCR Recognition Results</span>
                  </h2>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Process Another Document</span>
                  </button>
                </div>

                <OcrResultsViewer
                  ocrData={ocrData}
                  resultBlob={resultBlob}
                  resultFileName={resultFileName}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Recommended Articles & Related Tools */}
        <div className="mt-16 space-y-12">
          <RecommendedArticles category="OCR & Text AI" limit={3} />
          <RelatedTools currentToolPath="/ocr-pdf" limit={4} />
        </div>
      </div>
    </motion.div>
  );
};
