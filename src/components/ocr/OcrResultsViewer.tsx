import React, { useState } from 'react';
import { OCRResultData } from '../../types/pdfTypes';
import { OcrConfidenceIndicator } from './OcrConfidenceIndicator';
import { OcrTableViewer } from './OcrTableViewer';
import { downloadBlob } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Table as TableIcon,
  BookOpen,
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  FileCode,
  FileDown,
} from 'lucide-react';

interface OcrResultsViewerProps {
  ocrData: OCRResultData;
  resultBlob: Blob | null;
  resultFileName: string;
}

export const OcrResultsViewer: React.FC<OcrResultsViewerProps> = ({
  ocrData,
  resultBlob,
  resultFileName,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'tables' | 'pages' | 'raw'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);

  const toast = useToast();

  const handleCopyAll = () => {
    if (!ocrData.combinedText) return;
    navigator.clipboard.writeText(ocrData.combinedText);
    setCopiedAll(true);
    toast.success('All extracted text copied to clipboard!');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopyPage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPage(true);
    toast.success(`Page ${selectedPageIndex + 1} text copied!`);
    setTimeout(() => setCopiedPage(false), 2500);
  };

  const handleDownload = () => {
    if (resultBlob && resultFileName) {
      downloadBlob(resultBlob, resultFileName);
      toast.success(`Downloading ${resultFileName}`);
    }
  };

  // Collect all tables across pages
  const allTables = ocrData.pageResults.flatMap((p) => p.tables || []);

  const activePageData = ocrData.pageResults[selectedPageIndex] || ocrData.pageResults[0];

  return (
    <div className="bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Overview Top Bar */}
      <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>OCR Recognition Complete</span>
            </h3>
            <OcrConfidenceIndicator confidence={ocrData.overallConfidence} size="sm" />
          </div>
          <p className="text-xs text-slate-400">
            Processed {ocrData.pageResults.length} {ocrData.pageResults.length === 1 ? 'page' : 'pages'} •{' '}
            {ocrData.tablesCount} {ocrData.tablesCount === 1 ? 'table' : 'tables'} detected
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied All</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All Text</span>
              </>
            )}
          </button>

          {resultBlob && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download File ({resultFileName.split('.').pop()?.toUpperCase()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Sub Navigation */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-4 pt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-[#141417] text-amber-400 border-slate-800 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formatted Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-[#141417] text-amber-400 border-slate-800 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Tables ({allTables.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-[#141417] text-amber-400 border-slate-800 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Page-by-Page</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
              activeTab === 'raw'
                ? 'bg-[#141417] text-amber-400 border-slate-800 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Raw Plain Text</span>
          </button>
        </div>

        {/* Search Bar for Formatted Text */}
        {activeTab === 'text' && (
          <div className="relative mb-2 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in extracted text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* Tab 1: Formatted Text */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            {ocrData.pageResults.map((pRes) => {
              const displayParagraphs = searchQuery
                ? pRes.paragraphs.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
                : pRes.paragraphs;

              if (searchQuery && displayParagraphs.length === 0) return null;

              return (
                <div key={pRes.pageNumber} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Page {pRes.pageNumber}
                    </span>
                    <OcrConfidenceIndicator confidence={pRes.confidence} size="sm" />
                  </div>

                  <div className="space-y-3">
                    {displayParagraphs.map((para, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-slate-200 leading-relaxed font-sans p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Detected Tables */}
        {activeTab === 'tables' && <OcrTableViewer tables={allTables} />}

        {/* Tab 3: Page-by-Page View */}
        {activeTab === 'pages' && activePageData && (
          <div className="space-y-6">
            {/* Page Navigator */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                {ocrData.pageResults.map((p, idx) => (
                  <button
                    key={p.pageNumber}
                    type="button"
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedPageIndex === idx
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Page {p.pageNumber}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <OcrConfidenceIndicator confidence={activePageData.confidence} size="sm" />
                <button
                  type="button"
                  onClick={() => handleCopyPage(activePageData.text)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Page Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Side-by-side Page View (Canvas Scan vs Extracted Text) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scan Thumbnail */}
              {activePageData.canvasDataUrl ? (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 mb-2">Scanned Page View</p>
                  <img
                    src={activePageData.canvasDataUrl}
                    alt={`Scanned Page ${activePageData.pageNumber}`}
                    className="w-full h-auto max-h-[500px] object-contain rounded-xl border border-slate-800"
                  />
                </div>
              ) : (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-xs">
                  No page thumbnail available
                </div>
              )}

              {/* Extracted Text */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-amber-400">Recognized Page Text</p>
                <div className="max-h-[460px] overflow-y-auto space-y-2 pr-2 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activePageData.text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Raw Monospace Text */}
        {activeTab === 'raw' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {ocrData.combinedText}
          </div>
        )}
      </div>
    </div>
  );
};
