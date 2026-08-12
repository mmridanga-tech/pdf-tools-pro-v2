import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { SEO } from '../components/SEO';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PowerPointConverterService } from '../services/powerPointConverterService';
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
  Presentation,
  Layers,
} from 'lucide-react';

export const PDFToPowerPoint: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

    if (ext !== '.pdf') {
      toast.error('Invalid file format. Please upload a PDF document (.pdf).');
      return;
    }

    setSelectedFile(file);
    toast.info(`Selected PDF document "${file.name}"`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Extracting PDF text structures and slide layouts...');

      const pptxBlob = await PowerPointConverterService.pdfToPowerPoint(selectedFile, {
        onProgress: (percent, statusMsg) => {
          updateProgress(percent, statusMsg || 'Generating PowerPoint slides...');
        },
      });

      setResultBlob(pptxBlob);
      const outFileName = selectedFile.name.replace(/\.pdf$/i, '') + '.pptx';
      setSuccess('PDF document converted to PowerPoint presentation successfully!');
      toast.success('Conversion complete! PowerPoint presentation ready for download.');

      saveRecentFile({
        name: outFileName,
        size: pptxBlob.size,
        toolId: 'pdf-to-powerpoint',
        toolName: 'PDF to PowerPoint',
        status: 'completed',
      });

      addActivityLog(`Converted ${selectedFile.name} to PowerPoint`, 'PDF to PowerPoint');
    } catch (err: any) {
      const msg = err?.message || 'Failed to convert PDF document to PowerPoint presentation.';
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
        toolName="PDF to PowerPoint Converter"
        description="Convert PDF pages into an editable PowerPoint presentation (.pptx) directly in your browser."
        path="/pdf-to-powerpoint"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <ToolHeader
          icon={Presentation}
          title="PDF to PowerPoint Converter"
          description="Transform PDF documents and slide exports into editable Microsoft PowerPoint presentations (.pptx) with 100% data privacy."
          badge="Slide Generator"
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
                title="Drop PDF Document to Convert to Presentation"
                description="Supports PDF documents, slide exports, and presentation PDFs up to 100MB"
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
                  <Layers className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Page-to-Slide Structural Mapping:</span>
                    <p className="text-slate-400 mt-0.5">
                      Each page of your PDF document is extracted into an editable slide containing structured OpenXML text frames.
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
                  <span>Convert PDF to PowerPoint (.pptx)</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Highlights Panel */}
          <div className="lg:col-span-4 space-y-6">
            <PremiumSidebarPanel
              toolName="PDF to PowerPoint"
              tips={[
                'Each PDF page becomes an individual slide in the PowerPoint presentation.',
                'Extracted text elements are converted into editable OpenXML slide text blocks.',
                '100% private in-browser conversion — no files are uploaded to external servers.',
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
          resultFileName={selectedFile ? selectedFile.name.replace(/\.pdf$/i, '') + '.pptx' : 'presentation.pptx'}
          onReset={handleReset}
          title="Converting PDF to PowerPoint"
        />
      </div>
    </motion.div>
  );
};
