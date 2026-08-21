import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Image as ImageIcon, RefreshCw, Zap, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const JPGToPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['jpg-to-pdf'];
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFilesSelected = (files: File[]) => {
    setImageFiles((prev) => [...prev, ...files]);
    toast.info(`Added ${files.length} image(s) to list`);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageFiles.length) return;
    const updated = [...imageFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImageFiles(updated);
  };

  const handleConvert = async () => {
    if (imageFiles.length === 0) return;

    try {
      startProcessing('Embedding images into multi-page PDF document...');
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        let embeddedImage;

        if (file.type.includes('png')) {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      setResultBlob(pdfBlob);
      setSuccess('Images converted and combined into PDF successfully!');
      toast.success('Conversion complete!');

      saveRecentFile({
        name: 'converted_images.pdf',
        size: pdfBlob.size,
        toolId: 'jpg-to-pdf',
        toolName: 'JPG to PDF',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to convert images to PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setImageFiles([]);
    setResultBlob(null);
    reset();
  };

  return (
    <SEOLandingTemplate data={data}>
      <div className="space-y-6">
        {imageFiles.length === 0 ? (
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={true}
            title="Choose or Drop Images (JPG, PNG, WebP)"
            description="Convert photos, document scans, or receipts into a clean PDF"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <span>Selected Images ({imageFiles.length})</span>
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {imageFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === imageFiles.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Convert {imageFiles.length} Image(s) to PDF</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName="converted_images.pdf"
          onReset={handleReset}
          title="Converting JPG Images to PDF"
        />
      </div>
    </SEOLandingTemplate>
  );
};
