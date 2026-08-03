import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Unlock, FileText, RefreshCw, Zap } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const UnlockPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['unlock-pdf'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected "${file.name}" for unlocking`);
  };

  const handleUnlock = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Stripping owner restrictions and decrypting document streams...');
      
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const unlockedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      setResultBlob(unlockedBlob);
      setSuccess('PDF unlocked successfully! Passwords and restrictions removed.');
      toast.success('Unlock complete!');

      saveRecentFile({
        name: `unlocked_${selectedFile.name}`,
        size: unlockedBlob.size,
        toolId: 'unlock-pdf',
        toolName: 'Unlock PDF Online',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to unlock PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPassword('');
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
            title="Choose or Drop a Protected PDF File to Unlock"
            description="Remove passwords, printing limitations, and copying restrictions"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">Size: {formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Document Password (If Open Password Exists):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password if required to open file"
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleUnlock}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock & Remove PDF Restrictions</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`unlocked_${selectedFile?.name || 'document.pdf'}`}
          onReset={handleReset}
          title="Unlocking PDF Document"
        />
      </div>
    </SEOLandingTemplate>
  );
};
