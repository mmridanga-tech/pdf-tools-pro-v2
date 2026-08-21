import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { PDFService } from '../../services/pdfService';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Image as ImageIcon, RefreshCw, Zap, FileText } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const PDFToJPGOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['pdf-to-jpg'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    try {
      const pageCount = await PDFService.getPageCount(file);
      setTotalPages(pageCount);
      toast.info(`Loaded "${file.name}" (${pageCount} pages)`);
    } catch {
      toast.error('Could not read PDF.');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Rendering PDF pages onto high-DPI HTML5 canvas...');
      
      // Render first page as JPG image for instant demonstration
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Could not create canvas context.');

      await page.render({ canvasContext: context, viewport, canvas } as any).promise;

      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to extract image from PDF.');
          return;
        }
        setResultBlob(blob);
        setSuccess('PDF page rendered to high-resolution JPG successfully!');
        toast.success('Conversion complete!');

        saveRecentFile({
          name: selectedFile.name.replace(/\.pdf$/i, '_page1.jpg'),
          size: blob.size,
          toolId: 'pdf-to-jpg',
          toolName: 'PDF to JPG',
          status: 'completed',
        });
      }, 'image/jpeg', 0.92);
    } catch (err: any) {
      const msg = err.message || 'Failed to convert PDF to JPG.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTotalPages(0);
    setResultBlob(null);
    reset();
  };

  return (
    <SEOLandingTemplate data={data}>
      <div className="space-y-6">
        {!selectedFile ? (
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept=".pdf"
            multiple={false}
            title="Choose or Drop a PDF File to Convert to JPG"
            description="Render PDF document pages into high-resolution JPG or PNG images"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • {totalPages} Page(s)
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Convert PDF Pages to High-Res JPG</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile?.name.replace(/\.pdf$/i, '_page1.jpg') || 'page.jpg'}
          onReset={handleReset}
          title="Converting PDF to JPG"
        />
      </div>
    </SEOLandingTemplate>
  );
};
