import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToolHeader } from '../components/ToolHeader';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { usePDFProcessor } from '../hooks/usePDFProcessor';
import { PDFService } from '../services/pdfService';
import { formatBytes } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  FileText,
  Eye,
  EyeOff,
  Printer,
  Copy,
  Edit3,
  MessageSquare,
  ShieldCheck,
  Key,
  Info,
} from 'lucide-react';

export const ProtectPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  // Granular Permissions
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: false,
    editing: false,
    annotating: true,
  });

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const { state, startProcessing, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected ${file.name}`);
  };

  const handleProtect = async () => {
    if (!selectedFile) return;

    if (!userPassword) {
      toast.warning('Please specify a password to open the PDF.');
      return;
    }

    if (userPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please check confirmation field.');
      return;
    }

    try {
      startProcessing('Applying password protection and encryption...');

      const protectedBlob = await PDFService.protectPDF(
        selectedFile,
        {
          userPassword,
          ownerPassword: ownerPassword || userPassword,
          permissions,
        },
        (percent, statusMsg) => {
          if (statusMsg) startProcessing(statusMsg);
        }
      );

      setResultBlob(protectedBlob);
      setSuccess('PDF document successfully encrypted and protected!');
      toast.success('PDF protected with password!');
    } catch (err: any) {
      const msg = err.message || 'Failed to encrypt PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUserPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    setResultBlob(null);
    reset();
  };

  const passwordsMatch = userPassword && confirmPassword && userPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && userPassword !== confirmPassword;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0A0A0B] py-14"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolHeader
          icon={Lock}
          title="Protect PDF with Password"
          description="Encrypt your PDF documents with passwords and granular permission controls (printing, copying, editing, annotating)."
          badge="Security"
        />

        {!selectedFile ? (
          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Select PDF file to protect"
            description="or drag and drop PDF file here"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141417]/90 backdrop-blur-sm rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* File Overview */}
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

            {/* Password Configuration */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Key className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Password Credentials</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary User Password */}
                <div>
                  <label htmlFor="user-password" className="block text-sm font-bold text-white mb-2">
                    Set Document Open Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="user-password"
                      type={showUserPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter strong password..."
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                      aria-label={showUserPassword ? 'Hide password' : 'Show password'}
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <PasswordStrengthMeter password={userPassword} />
                </div>

                {/* Confirm User Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-bold text-white mb-2">
                    Confirm Open Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showUserPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password..."
                      className={`w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-medium transition-colors ${
                        passwordsMismatch
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/40'
                          : passwordsMatch
                          ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30'
                          : 'border-slate-800 focus:ring-2 focus:ring-red-500/30'
                      }`}
                    />
                  </div>

                  {passwordsMismatch && (
                    <p className="mt-2 text-xs font-semibold text-red-400 flex items-center gap-1">
                      <span>✕</span> Passwords do not match.
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <span>✓</span> Passwords match successfully.
                    </p>
                  )}
                </div>
              </div>

              {/* Owner Password (Optional) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="owner-password" className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Owner Master Password</span>
                    <span className="text-xs font-normal text-slate-500">(Optional - for changing permissions)</span>
                  </label>
                </div>
                <div className="relative max-w-md">
                  <input
                    id="owner-password"
                    type={showOwnerPassword ? 'text' : 'password'}
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Leave blank to use main password..."
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    aria-label={showOwnerPassword ? 'Hide owner password' : 'Show owner password'}
                  >
                    {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  If omitted, your main password will be used for master permissions as well.
                </p>
              </div>
            </div>

            {/* Granular Permission Controls */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 pb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Document Permissions</h3>
              </div>
              <p className="text-xs text-slate-400">
                Choose which actions viewers with the user password are allowed to perform:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Printing */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    permissions.printing
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Printer className={`w-5 h-5 ${permissions.printing ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-white">Allow Printing</p>
                      <p className="text-xs text-slate-400">High-resolution document printing</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.printing}
                    onChange={(e) => setPermissions({ ...permissions, printing: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {/* Copying */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    permissions.copying
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Copy className={`w-5 h-5 ${permissions.copying ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-white">Allow Copying</p>
                      <p className="text-xs text-slate-400">Extract text, images, and content</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.copying}
                    onChange={(e) => setPermissions({ ...permissions, copying: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {/* Editing */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    permissions.editing
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Edit3 className={`w-5 h-5 ${permissions.editing ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-white">Allow Editing</p>
                      <p className="text-xs text-slate-400">Modify pages or assemble document</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.editing}
                    onChange={(e) => setPermissions({ ...permissions, editing: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {/* Annotating */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    permissions.annotating
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare
                      className={`w-5 h-5 ${permissions.annotating ? 'text-emerald-400' : 'text-slate-500'}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">Allow Annotating</p>
                      <p className="text-xs text-slate-400">Add comments, form inputs & notes</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.annotating}
                    onChange={(e) => setPermissions({ ...permissions, annotating: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProtect}
                disabled={!userPassword || userPassword !== confirmPassword}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-xl shadow-red-600/25 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                <span>Encrypt & Protect PDF</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal */}
        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={`${selectedFile?.name.replace(/\.pdf$/i, '')}_protected.pdf`}
          onReset={handleReset}
          title="Encrypting PDF Document"
        />
      </div>
    </motion.div>
  );
};
