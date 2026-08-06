import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
import {
  PremiumSteps,
  PremiumUploadZone,
  PremiumFileCard,
  PremiumProgress,
  PremiumRecentFiles,
  PremiumSidebarPanel,
} from '../components/tool-ui';

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

  const currentStep = ocrData ? 3 : isProcessing ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#08090E] py-12"
    >
      <SEO
        toolName="OCR PDF"
        description="Extract text from scanned PDFs & images with high accuracy AI optical character recognition."
        path="/ocr-pdf"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ToolHeader
          icon={ScanText}
          title="Professional OCR Pro"
          description="Extract text from scanned PDFs & images with English and Bengali (বাংলা) support, automatic multi-page processing, table detection, paragraph preservation, and searchable PDF export."
          badge="AI Powered"
        />

        {/* Step Indicator */}
        <PremiumSteps currentStep={currentStep} />

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {!selectedFile ? (
              <PremiumUploadZone
                accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.bmp"
                multiple={false}
                onFilesSelected={handleFileSelected}
                title="Select scanned PDF or Image for OCR Pro"
                description="Supports PDF, PNG, JPG, WEBP • Multi-page & Bengali OCR supported"
                buttonText="Choose Document or Image"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                {/* Selected File Overview */}
                <PremiumFileCard
                  name={selectedFile.name}
                  size={selectedFile.size}
                  pageCount={pageCount}
                  onReplace={(newFile) => handleFileSelected([newFile])}
                  onRemove={handleReset}
                />

                {/* Document Pages Preview Grid */}
                {pageCount > 0 && selectedFile.type === 'application/pdf' && !ocrData && !isProcessing && (
                  <div className="bg-[#12131F]/90 rounded-[28px] border border-white/10 p-6 space-y-4 backdrop-blur-xl">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Detected Document Pages ({pageCount})</span>
                    </h3>
                    <PagePreviewGrid pageCount={pageCount} />
                  </div>
                )}

                {/* Progress State */}
                {isProcessing && (
                  <PremiumProgress
                    progress={progressPercent}
                    statusMessage={statusMessage || 'Performing OCR analysis...'}
                    stepName="OCR Recognition Engine"
                  />
                )}

                {/* OCR Options Panel */}
                {!ocrData && !isProcessing && (
                  <div className="bg-[#12131F]/90 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-8">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-4">
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
                          className="w-full bg-slate-950/80 border border-white/15 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors cursor-pointer"
                        >
                          <option value="pdf">Searchable PDF (.pdf) - Scanned Image + Selectable Text</option>
                          <option value="docx">Microsoft Word Document (.docx) - Formatted Paragraphs & Tables</option>
                          <option value="txt">Plain Text Document (.txt) - Raw Extracted Text</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Feature Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      {/* Table Detection Toggle */}
                      <label
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          options.detectTables
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TableIcon className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white">Detect Tables</p>
                            <p className="text-[11px] text-slate-400">Extract 2D grids</p>
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
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <AlignLeft className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white">Structure Text</p>
                            <p className="text-[11px] text-slate-400">Preserve paragraphs</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={options.preserveFormatting}
                          onChange={(e) => setOptions({ ...options, preserveFormatting: e.target.checked })}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </label>

                      {/* Image Resolution Enhancement */}
                      <label
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          options.enhanceResolution
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white">Enhance DPI</p>
                            <p className="text-[11px] text-slate-400">Pre-process contrast</p>
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

                    {/* Run OCR Action Button */}
                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleRunOCR}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
                      >
                        <ScanText className="w-5 h-5" />
                        <span>Run OCR & Extract Text</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* OCR Output Viewer */}
                {ocrData && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        Start New Scan
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

            <PremiumRecentFiles />
          </div>

          {/* Sidebar Panel Column */}
          <div className="lg:col-span-4 sticky top-6">
            <PremiumSidebarPanel
              toolName="OCR PDF"
              supportedFormats={['PDF (.pdf)', 'PNG (.png)', 'JPG (.jpg)', 'WEBP (.webp)']}
              tips={[
                'Supports multi-language optical character recognition including English and Bengali.',
                'Detects structured tables and converts them into editable Word or plain text grids.',
                'Outputs Searchable PDF with original image background and underlying invisible text layer.',
              ]}
            />
          </div>
        </div>

        {/* SEO Articles & Tools */}
        <RecommendedArticles category="ocr" />
        <RelatedTools currentToolPath="/ocr-pdf" />
      </div>
    </motion.div>
  );
};
