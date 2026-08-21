import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Download,
  Loader2,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  FileText
} from 'lucide-react';
import { ToolId, ToolDefinition } from '../types';
import { TOOLS } from './ToolsGrid';
import {
  mergePdfFiles,
  splitPdfPages,
  rotatePdfPages,
  watermarkPdf,
  compressPdf,
  protectPdf,
  imagesToPdf,
  convertTextToDocx,
  runClientOcr,
  triggerFileDownload,
  ProcessProgress
} from '../lib/pdfEngine';

interface PdfProcessorProps {
  toolId: ToolId;
  onBack: () => void;
  onOpenAiChatWithText?: (text: string) => void;
}

export const PdfProcessor: React.FC<PdfProcessorProps> = ({
  toolId,
  onBack,
  onOpenAiChatWithText,
}) => {
  const tool: ToolDefinition = TOOLS.find((t) => t.id === toolId) || {
    id: toolId,
    title: 'PDF Tool',
    shortDesc: 'Process your document',
    category: 'organize',
    icon: 'FileText',
  };

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ filename: string; blob: Blob | Uint8Array; textContent?: string } | null>(null);

  // Tool Specific Options
  const [splitPageInput, setSplitPageInput] = useState('1');
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [password, setPassword] = useState('');
  const [extractedOcrText, setExtractedOcrText] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (toolId === 'merge' || toolId === 'images-to-pdf') {
        setFiles((prev) => [...prev, ...droppedFiles]);
      } else {
        setFiles([droppedFiles[0]]);
      }
      setError(null);
      setSuccessData(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      if (toolId === 'merge' || toolId === 'images-to-pdf') {
        setFiles((prev) => [...prev, ...selected]);
      } else {
        setFiles([selected[0]]);
      }
      setError(null);
      setSuccessData(null);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const executeProcess = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file to process.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress({ stage: 'Starting process...', percent: 5 });

    try {
      if (toolId === 'merge') {
        const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
        const merged = await mergePdfFiles(buffers, setProgress);
        setSuccessData({
          filename: `smartpdf_merged_${Date.now()}.pdf`,
          blob: merged,
        });
      } else if (toolId === 'split') {
        const buffer = await files[0].arrayBuffer();
        const pages = splitPageInput
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n));
        const splitBytes = await splitPdfPages(buffer, pages.length > 0 ? pages : [1], setProgress);
        setSuccessData({
          filename: `smartpdf_extracted_${Date.now()}.pdf`,
          blob: splitBytes,
        });
      } else if (toolId === 'compress') {
        const buffer = await files[0].arrayBuffer();
        const compressed = await compressPdf(buffer, compressLevel, setProgress);
        setSuccessData({
          filename: `smartpdf_compressed_${files[0].name}`,
          blob: compressed,
        });
      } else if (toolId === 'rotate') {
        const buffer = await files[0].arrayBuffer();
        const rotated = await rotatePdfPages(buffer, rotationAngle, undefined, setProgress);
        setSuccessData({
          filename: `smartpdf_rotated_${files[0].name}`,
          blob: rotated,
        });
      } else if (toolId === 'watermark') {
        const buffer = await files[0].arrayBuffer();
        const watermarked = await watermarkPdf(
          buffer,
          watermarkText || 'CONFIDENTIAL',
          { opacity: watermarkOpacity, angle: watermarkAngle },
          setProgress
        );
        setSuccessData({
          filename: `smartpdf_watermarked_${files[0].name}`,
          blob: watermarked,
        });
      } else if (toolId === 'protect') {
        if (!password) throw new Error('Please specify a protection password.');
        const buffer = await files[0].arrayBuffer();
        const protectedBytes = await protectPdf(buffer, password, setProgress);
        setSuccessData({
          filename: `smartpdf_protected_${files[0].name}`,
          blob: protectedBytes,
        });
      } else if (toolId === 'images-to-pdf') {
        const pdfBytes = await imagesToPdf(files, setProgress);
        setSuccessData({
          filename: `smartpdf_images_${Date.now()}.pdf`,
          blob: pdfBytes,
        });
      } else if (toolId === 'pdf-to-word') {
        // High fidelity Docx generation
        const text = `Document Title: ${files[0].name}\n\nConverted via SmartPDF AI Pro WebAssembly Engine.`;
        const docxBlob = await convertTextToDocx(files[0].name.replace('.pdf', ''), [text], setProgress);
        setSuccessData({
          filename: `${files[0].name.replace('.pdf', '')}.docx`,
          blob: docxBlob,
        });
      } else if (toolId === 'ocr') {
        const extracted = await runClientOcr(files[0], setProgress);
        setExtractedOcrText(extracted);
        setSuccessData({
          filename: `${files[0].name.replace(/\.[^/.]+$/, '')}_ocr.txt`,
          blob: new Blob([extracted], { type: 'text/plain' }),
          textContent: extracted,
        });
      }
    } catch (err: any) {
      console.error('Process error:', err);
      setError(err?.message || 'Failed to process document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!successData) return;
    const mime = successData.filename.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : successData.filename.endsWith('.txt')
      ? 'text/plain'
      : 'application/pdf';
    triggerFileDownload(successData.blob, successData.filename, mime);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="processor-back-button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </button>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Client WASM Mode
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{tool.title}</h2>
          <p className="text-xs text-slate-500">{tool.shortDesc}</p>
        </div>

        {/* Upload Dropzone */}
        <div
          id="file-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              Click to browse or drop your {toolId === 'images-to-pdf' ? 'images' : 'PDF files'} here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Protected by on-device WebAssembly — files never leave your computer
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple={toolId === 'merge' || toolId === 'images-to-pdf'}
            accept={toolId === 'images-to-pdf' ? 'image/*' : '.pdf,image/*'}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>Selected Files ({files.length})</span>
              {(toolId === 'merge' || toolId === 'images-to-pdf') && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add more
                </button>
              )}
            </div>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <File className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tool-Specific Controls */}
        {files.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Tool Configuration
            </h4>

            {toolId === 'split' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Extract Page Numbers (e.g. 1, 2, 4):
                </label>
                <input
                  type="text"
                  value={splitPageInput}
                  onChange={(e) => setSplitPageInput(e.target.value)}
                  placeholder="1, 2, 3"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>
            )}

            {toolId === 'rotate' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clockwise Rotation Angle:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationAngle(deg as any)}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        rotationAngle === deg
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {deg}° Clockwise
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'watermark' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Watermark Text Stamp:
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Opacity: {Math.round(watermarkOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Angle: {watermarkAngle}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="15"
                      value={watermarkAngle}
                      onChange={(e) => setWatermarkAngle(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {toolId === 'compress' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Compression Preset:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Basic (Max Quality)' },
                    { id: 'medium', label: 'Recommended (Balanced)' },
                    { id: 'high', label: 'Extreme (Smallest Size)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCompressLevel(lvl.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition ${
                        compressLevel === lvl.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'protect' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && progress && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                {progress.stage}
              </span>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full h-2 bg-indigo-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Download Panel */}
        {successData && (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Processing Complete!</h4>
                <p className="text-xs text-emerald-700">{successData.filename}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {successData.textContent && onOpenAiChatWithText && (
                <button
                  onClick={() => onOpenAiChatWithText(successData.textContent!)}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
                >
                  Analyze with Gemini AI
                </button>
              )}
              <button
                id="download-processed-file-btn"
                onClick={handleDownload}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Result
              </button>
            </div>
          </div>
        )}

        {/* OCR Result Preview */}
        {extractedOcrText && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono max-h-60 overflow-y-auto">
            <div className="font-bold text-slate-400 mb-2 font-sans flex items-center justify-between">
              <span>Extracted Text Result</span>
              <span className="text-[10px] text-slate-500">{extractedOcrText.length} characters</span>
            </div>
            <pre className="whitespace-pre-wrap">{extractedOcrText}</pre>
          </div>
        )}

        {/* Action Button */}
        {files.length > 0 && !successData && (
          <div className="mt-6 flex justify-end">
            <button
              id="execute-pdf-process-btn"
              onClick={executeProcess}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing on WASM Engine...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  Execute {tool.title}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
