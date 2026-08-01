import React, { useState } from 'react';
import { Table, Copy, Check, FileSpreadsheet, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface OcrTableViewerProps {
  tables: string[][][]; // Array of tables (rows x cells)
}

export const OcrTableViewer: React.FC<OcrTableViewerProps> = ({ tables }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const toast = useToast();

  if (!tables || tables.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
        <Table className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No tabular data detected</p>
        <p className="text-xs text-slate-500 mt-1">
          Enable "Detect Tables" option if your document contains structured forms, spreadsheets, or financial reports.
        </p>
      </div>
    );
  }

  const handleCopyTable = (tableData: string[][], index: number, format: 'tsv' | 'csv' | 'md') => {
    let output = '';
    if (format === 'tsv') {
      output = tableData.map((row) => row.join('\t')).join('\n');
    } else if (format === 'csv') {
      output = tableData
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');
    } else {
      output = tableData.map((row) => `| ${row.join(' | ')} |`).join('\n');
    }

    navigator.clipboard.writeText(output);
    setCopiedIdx(index);
    toast.success(`Table ${index + 1} copied as ${format.toUpperCase()}!`);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            Detected Tables ({tables.length} {tables.length === 1 ? 'table' : 'tables'})
          </h3>
        </div>
      </div>

      {tables.map((tableData, tIdx) => (
        <div
          key={tIdx}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
        >
          {/* Table Header Controls */}
          <div className="p-3.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Table #{tIdx + 1} ({tableData.length} rows)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyTable(tableData, tIdx, 'tsv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedIdx === tIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Excel/TSV</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyTable(tableData, tIdx, 'csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Copy CSV</span>
              </button>
            </div>
          </div>

          {/* Table Render Grid */}
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300">
                  {tableData[0]?.map((cell, cIdx) => (
                    <th key={cIdx} className="p-2.5 font-bold border-r border-slate-800/60 last:border-r-0">
                      {cell || `Col ${cIdx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 text-slate-300 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-r border-slate-800/60 last:border-r-0">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
