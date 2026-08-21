import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Lock, FileText, RefreshCw, Zap, Eye, EyeOff } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const ProtectPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['protect-pdf'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected "${file.name}" for encryption`);
  };

  const handleProtect = async () => {
    if (!selectedFile) return;
    if (!password) {
      toast.warning('Please specify an open password.');
      return;
    }

    try {
      startProcessing('Applying 256-bit AES encryption and setting permission flags...');
      
      const { PDFService } = await import('../../services/pdfService');
      const encryptedBlob = await PDFService.protectPDF(
        selectedFile,
        {
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: true,
            copying: false,
            editing: false,
            annotating: true,
          },
        },
        (pct, msg) => {
          if (msg) startProcessing(msg);
        }
      );

      setResultBlob(encryptedBlob);
      setSuccess('PDF document encrypted with 256-bit AES protection successfully!');
      toast.success('Encryption complete!');

      saveRecentFile({
        name: `protected_${selectedFile.name}`,
        size: encryptedBlob.size,
        toolId: 'protect-pdf',
        toolName: 'Protect PDF Online',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to encrypt PDF.';
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
            title="Choose or Drop a PDF File to Encrypt"
            description="Add passwords and restrict printing/copying with 256-bit AES encryption"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
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
                Set Document Open Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleProtect}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Encrypt PDF Document Now</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`protected_${selectedFile?.name || 'document.pdf'}`}
          onReset={handleReset}
          title="Encrypting PDF Document"
        />
      </div>
    </SEOLandingTemplate>
  );
};
