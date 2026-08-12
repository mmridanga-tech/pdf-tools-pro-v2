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
  Presentation,
  RefreshCw,
  Zap,
  Sliders,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const PowerPointToPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

    if (ext !== '.pptx') {
      toast.error('Invalid file format. Please upload a PowerPoint presentation (.pptx).');
      return;
    }

    setSelectedFile(file);
    toast.info(`Selected presentation "${file.name}"`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Unpacking PowerPoint presentation slides...');

      const pdfBlob = await PowerPointConverterService.powerPointToPDF(selectedFile, {
        onProgress: (percent, statusMsg) => {
          updateProgress(percent, statusMsg || 'Rendering presentation slides...');
        },
      });

      setResultBlob(pdfBlob);
      const outFileName = selectedFile.name.replace(/\.pptx$/i, '') + '.pdf';
      setSuccess('PowerPoint presentation converted to PDF successfully!');
      toast.success('Conversion complete! PDF ready for download.');

      saveRecentFile({
        name: outFileName,
        size: pdfBlob.size,
        toolId: 'powerpoint-to-pdf',
        toolName: 'PowerPoint to PDF',
        status: 'completed',
      });

      addActivityLog(`Converted ${selectedFile.name} to PDF`, 'PowerPoint to PDF');
    } catch (err: any) {
      const msg = err?.message || 'Failed to convert PowerPoint presentation to PDF.';
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
        toolName="PowerPoint to PDF Converter"
        description="Convert Microsoft PowerPoint presentations (.pptx) into PDF documents instantly directly in your browser."
        path="/powerpoint-to-pdf"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <ToolHeader
          icon={Presentation}
          title="PowerPoint to PDF Converter"
          description="Transform PowerPoint slide decks (.pptx) into viewable and printable PDF documents with 100% in-browser privacy."
          badge="Presentation Engine"
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
                accept=".pptx"
                multiple={false}
                title="Drop PowerPoint Presentation (.pptx)"
                description="Supports Microsoft PowerPoint presentations (.pptx) up to 100MB"
              />
            ) : (
              <div className="bg-[#0c0d14] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
                {/* File Information Card */}
                <div className="flex items-center justify-between p-4 bg-[#12131f] border border-white/[0.06] rounded-xl">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl shrink-0">
                      <Presentation className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Format: <span className="uppercase font-mono text-orange-400">PPTX</span> • Size: {formatBytes(selectedFile.size)}
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
                    <span className="font-semibold text-slate-200">Slide Extraction & PDF Assembly:</span>
                    <p className="text-slate-400 mt-0.5">
                      Extracts XML vector text elements and slide ordering directly from the OpenXML PPTX container to generate widescreen landscape PDF pages.
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
                  <span>Convert PowerPoint to PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Highlights Panel */}
          <div className="lg:col-span-4 space-y-6">
            <PremiumSidebarPanel
              toolName="PowerPoint to PDF"
              tips={[
                'Slides are converted into widescreen landscape PDF pages.',
                'Slide text and bullet items are extracted directly from OpenXML structures.',
                '100% client-side conversion — no slide data is sent to external servers.',
              ]}
              supportedFormats={['.pptx']}
              maxSizeMB={100}
            />
          </div>
        </div>

        {/* Processing and Success Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile ? selectedFile.name.replace(/\.pptx$/i, '') + '.pdf' : 'presentation.pdf'}
          onReset={handleReset}
          title="Converting PowerPoint Presentation"
        />
      </div>
    </motion.div>
  );
};
