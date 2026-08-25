import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FilePlus, ShieldCheck, Cloud, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { CloudDrivePickerModal } from '../CloudDrivePickerModal';

interface PremiumUploadZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  supportedTypesText?: string;
}

const isFileAccepted = (file: File, acceptString: string): boolean => {
  if (!acceptString || acceptString === '*') return true;
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const ext = '.' + (name.split('.').pop() || '');

  const tokens = acceptString
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (token === '*' || token === '*/*') return true;
    if (token.startsWith('.')) {
      if (ext === token) return true;
      if (token === '.jpg' && (ext === '.jpeg' || ext === '.jpg')) return true;
      if (token === '.jpeg' && (ext === '.jpg' || ext === '.jpeg')) return true;
    } else if (token.endsWith('/*')) {
      const mainType = token.split('/')[0];
      if (type.startsWith(mainType + '/')) return true;
      if (
        mainType === 'image' &&
        ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp'].includes(ext)
      ) {
        return true;
      }
    } else {
      if (type === token) return true;
      if (
        (token === 'image/jpeg' || token === 'image/jpg') &&
        (type === 'image/jpeg' || type === 'image/jpg' || ext === '.jpg' || ext === '.jpeg')
      ) {
        return true;
      }
      if (token === 'image/png' && (type === 'image/png' || ext === '.png')) return true;
      if (token === 'image/webp' && (type === 'image/webp' || ext === '.webp')) return true;
      if (token === 'application/pdf' && (type === 'application/pdf' || ext === '.pdf')) return true;
    }
  }
  return false;
};

export const PremiumUploadZone: React.FC<PremiumUploadZoneProps> = ({
  accept = '.pdf',
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
  title = 'Select PDF documents',
  description = 'Drag & drop your files here or choose from your computer',
  buttonText,
  className = '',
  supportedTypesText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultButtonText = buttonText || (multiple ? 'Choose Files' : 'Select Document');
  const fileTypesLabel = supportedTypesText || accept.replace(/,/g, ' • ').toUpperCase();

  const validateAndPassFiles = (fileList: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!isFileAccepted(file, accept)) {
        setErrorMsg(`Unsupported file format: ${file.name}. Allowed formats: ${accept}`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMsg(`File "${file.name}" exceeds the maximum limit of ${maxSizeMB}MB.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(e.target.files);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        tabIndex={0}
        role="button"
        aria-label={`${title} - ${description}`}
        whileHover={{ scale: 1.004 }}
        whileTap={{ scale: 0.995 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`relative group cursor-pointer rounded-[28px] border-2 border-dashed transition-all p-8 sm:p-12 md:p-16 text-center flex flex-col items-center justify-center overflow-hidden focus:outline-none focus:ring-4 focus:ring-red-500/20 ${
          isDragging
            ? 'border-red-500 bg-red-500/10 scale-[1.01] shadow-[0_20px_50px_rgba(239,68,68,0.25)]'
            : 'border-white/15 hover:border-red-500/60 bg-[#10111A]/80 hover:bg-[#151624] shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Ambient Hover Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all pointer-events-none" />

        {/* Animated Icon Container */}
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-2xl bg-gradient-to-tr from-red-600/20 via-rose-500/15 to-slate-900 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-red-400 group-hover:text-white group-hover:bg-red-600 transition-all duration-300 shadow-xl"
        >
          {multiple ? <FilePlus className="w-8 h-8 sm:w-10 sm:h-10" /> : <Upload className="w-8 h-8 sm:w-10 sm:h-10" />}
        </motion.div>

        {/* Main Title & Subtitle */}
        <h3 className="text-xl sm:text-3xl font-black text-white mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-base text-slate-300/80 mb-8 max-w-md font-normal leading-relaxed">
          {description}
        </p>

        {/* Button Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(239,68,68,0.35)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <span>{defaultButtonText}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCloudPickerOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md cursor-pointer gap-2.5 active:scale-[0.98]"
          >
            <Cloud className="w-4.5 h-4.5 text-red-400" />
            <span>Import from Cloud</span>
          </button>
        </div>

        <CloudDrivePickerModal
          isOpen={isCloudPickerOpen}
          onClose={() => setIsCloudPickerOpen(false)}
          mode="import"
          onFilesImported={(files) => {
            if (files.length > 0) {
              validateAndPassFiles(files);
            }
          }}
        />

        {/* Security & Format Badges */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5 text-slate-300">
            <FileText className="w-3.5 h-3.5 text-red-400" />
            <span>Formats: {fileTypesLabel}</span>
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span>Max file size: {maxSizeMB}MB</span>
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Private</span>
          </span>
        </div>
      </motion.div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-sm flex items-center gap-3 shadow-xl backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="font-semibold">{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
