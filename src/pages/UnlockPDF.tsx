import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import { Unlock, FileText, Eye, EyeOff, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const UnlockPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingEncryption, setCheckingEncryption] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setPassword('');
    setIsEncrypted(null);
    setCheckingEncryption(true);

    try {
      const encrypted = await PDFService.isPDFEncrypted(file);
      setIsEncrypted(encrypted);
      if (encrypted) {
        toast.info('Password protected document detected.');
      } else {
        toast.info('Selected document is not password protected.');
      }
    } catch {
      setIsEncrypted(true);
    } finally {
      setCheckingEncryption(false);
    }
  };

  const handleUnlock = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Decrypting PDF and stripping security restrictions...');
      const unlockedBlob = await PDFService.unlockPDF(
        selectedFile,
        password,
        (percent, statusMsg) => {
          if (statusMsg) startProcessing(statusMsg);
        }
      );

      setResultBlob(unlockedBlob);
      setSuccess('PDF unlocked successfully! All restrictions removed.');
      toast.success('PDF unlocked successfully!');
    } catch (err: any) {
      const msg = err.message || 'Incorrect password or failed to unlock PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsEncrypted(null);
    setPassword('');
    setResultBlob(null);
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <SEO
        toolName="Unlock PDF"
        description="Remove passwords and permissions security from locked PDF files instantly."
        path="/unlock-pdf"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Unlock}
          title="Unlock PDF Password"
          description="Remove passwords and permissions security from locked PDF files instantly."
          badge="Security"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select password-protected PDF"
            description="or drag and drop locked PDF file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* File Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Change File
              </button>
            </div>

            {/* Encryption Status Banner */}
            {checkingEncryption ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Checking PDF security status...</span>
              </div>
            ) : isEncrypted === false ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">This PDF is not password protected!</p>
                  <p className="text-xs text-emerald-400/80 mt-1">
                    You can process or download this file directly without unlocking.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Protected Document Detected</p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Please enter the user password below to decrypt and unlock this PDF.
                  </p>
                </div>
              </div>
            )}

            {/* Password Input Section */}
            {isEncrypted !== false && (
              <div className="space-y-4 pt-2">
                <label htmlFor="unlock-password" className="block text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-red-500" />
                  <span>Enter PDF Password</span>
                </label>
                <div className="relative max-w-lg">
                  <input
                    id="unlock-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUnlock}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all cursor-pointer"
              >
                <Unlock className="w-5 h-5" />
                <span>Unlock PDF Now</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Processing Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_unlocked.pdf`}
          onReset={handleReset}
          title="Decrypting PDF"
        />
      </div>
    </motion.div>
  );
};
