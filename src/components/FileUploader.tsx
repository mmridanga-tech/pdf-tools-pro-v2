import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, FilePlus, ShieldCheck, Cloud } from 'lucide-react';
import { motion } from 'motion/react';
import { CloudDrivePickerModal } from './CloudDrivePickerModal';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

/**
 * Validate whether a given file matches the accept specification.
 * Supports:
 * - exact extensions: .png, .jpg, .jpeg, .pdf, .doc, .docx, .webp, .svg
 * - MIME types: image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, application/pdf
 * - wildcard MIMEs: image/*
 */
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

    // Extension match
    if (token.startsWith('.')) {
      if (ext === token) return true;
      if (token === '.jpg' && (ext === '.jpeg' || ext === '.jpg')) return true;
      if (token === '.jpeg' && (ext === '.jpg' || ext === '.jpeg')) return true;
    }
    // Wildcard MIME match (e.g. image/*)
    else if (token.endsWith('/*')) {
      const mainType = token.split('/')[0];
      if (type.startsWith(mainType + '/')) return true;
      if (
        mainType === 'image' &&
        ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp'].includes(ext)
      ) {
        return true;
      }
    }
    // Exact MIME match
    else {
      if (type === token) return true;
      if (
        (token === 'image/jpeg' || token === 'image/jpg') &&
        (type === 'image/jpeg' || type === 'image/jpg' || ext === '.jpg' || ext === '.jpeg')
      ) {
        return true;
      }
      if (token === 'image/png' && (type === 'image/png' || ext === '.png')) return true;
      if (token === 'image/webp' && (type === 'image/webp' || ext === '.webp')) return true;
      if (
        (token === 'image/svg+xml' || token === 'image/svg') &&
        (type === 'image/svg+xml' || type === 'image/svg' || ext === '.svg')
      ) {
        return true;
      }
      if (token === 'application/pdf' && (type === 'application/pdf' || ext === '.pdf')) return true;
    }
  }

  return false;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '.pdf',
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
  title = 'Select PDF files',
  description = 'or drag and drop PDFs here',
  buttonText,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getComputedButtonText = () => {
    if (buttonText) return buttonText;
    const acc = (accept || '').toLowerCase();
    if (
      acc.includes('image') ||
      acc.includes('.png') ||
      acc.includes('.jpg') ||
      acc.includes('.jpeg') ||
      acc.includes('.webp') ||
      acc.includes('.svg')
    ) {
      return multiple ? 'Choose Image Files' : 'Choose Image File';
    }
    if (acc.includes('doc') || acc.includes('word')) {
      return multiple ? 'Choose Word Files' : 'Choose Word File';
    }
    if (acc.includes('pdf')) {
      return multiple ? 'Choose PDF Files' : 'Select PDF File';
    }
    return multiple ? 'Choose Files' : 'Select File';
  };

  const validateAndPassFiles = (fileList: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Validate format against accept rules
      if (!isFileAccepted(file, accept)) {
        setErrorMsg(`Invalid file format: ${file.name}. Expected valid ${accept} files.`);
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setErrorMsg(`File ${file.name} exceeds the maximum limit of ${maxSizeMB}MB.`);
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
        whileHover={{ scale: 1.005 }}
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
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all p-10 md:p-14 text-center flex flex-col items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
          isDragging
            ? 'border-red-500 bg-red-500/10 scale-[1.01] shadow-2xl shadow-red-500/20'
            : 'border-slate-800/90 hover:border-red-500/50 bg-[#141417]/90 hover:bg-[#18181d] shadow-xl hover:shadow-2xl'
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

        {/* Subtle hover gradient behind icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/15 transition-all pointer-events-none" />

        <motion.div
          whileHover={{ scale: 1.1, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-tr from-red-600/20 to-rose-500/20 text-red-500 border border-red-500/30 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-md"
        >
          {multiple ? <FilePlus className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-400 mb-8 max-w-sm font-normal">{description}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all cursor-pointer"
          >
            {getComputedButtonText()}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsCloudPickerOpen(true);
            }}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm shadow-lg transition-all cursor-pointer gap-2"
          >
            <Cloud className="w-4 h-4 text-red-400" />
            <span>Import from Cloud Drive</span>
          </motion.button>
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

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <span>Max file size: {maxSizeMB}MB</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Client-side encrypted
          </span>
        </div>
      </motion.div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm flex items-center gap-3 shadow-lg"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="font-medium">{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
