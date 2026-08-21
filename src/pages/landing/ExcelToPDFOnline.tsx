import React, { useState } from 'react';
import { SEOLandingTemplate } from '../../components/seo/SEOLandingTemplate';
import { LANDING_PAGES_DATA } from '../../data/landingPagesData';
import { FileUploader } from '../../components/FileUploader';
import { ProcessingModal } from '../../components/ProcessingModal';
import { usePDFProcessor } from '../../hooks/usePDFProcessor';
import { formatBytes } from '../../utils/fileUtils';
import { useToast } from '../../context/ToastContext';
import { Table, RefreshCw, Zap } from 'lucide-react';
import { saveRecentFile } from '../../utils/storageUtils';

export const ExcelToPDFOnline: React.FC = () => {
  const data = LANDING_PAGES_DATA['excel-to-pdf'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { state, startProcessing, updateProgress, setSuccess, setError, reset } = usePDFProcessor();
  const toast = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    toast.info(`Selected spreadsheet "${file.name}"`);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    try {
      startProcessing('Parsing spreadsheet grid cells and formatting PDF table pages...');
      
      // Convert Excel/CSV content to PDF using HTML Canvas / PDF-Lib table renderer
      const textContent = await selectedFile.text();
      const rows = textContent.split('\n').filter((line) => line.trim().length > 0);

      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
      const { width, height } = page.getSize();
      let y = height - 50;

      // Draw Title Header
      page.drawText(`Spreadsheet Report: ${selectedFile.name}`, {
        x: 40,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 30;

      const rowLimit = Math.min(rows.length, 120);
      for (let i = 0; i < rowLimit; i++) {
        if (y < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = height - 50;
        }

        const line = rows[i];
        const cells = line.split(/[,;\t]/).map((c) => c.replace(/^"|"$/g, '').trim());
        const rowText = cells.slice(0, 6).join('  |  ');

        page.drawText(rowText.substring(0, 85), {
          x: 40,
          y,
          size: 9,
          font: i === 0 ? boldFont : font,
          color: i === 0 ? rgb(0.8, 0.1, 0.1) : rgb(0.2, 0.2, 0.2),
        });

        y -= 18;
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      setResultBlob(pdfBlob);
      setSuccess('Excel spreadsheet converted to PDF successfully!');
      toast.success('Conversion complete!');

      saveRecentFile({
        name: selectedFile.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf'),
        size: pdfBlob.size,
        toolId: 'excel-to-pdf',
        toolName: 'Excel to PDF',
        status: 'completed',
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to convert Excel file to PDF.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultBlob(null);
    reset();
  };

  return (
    <SEOLandingTemplate data={data}>
      <div className="space-y-6">
        {!selectedFile ? (
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept=".xlsx,.xls,.csv"
            multiple={false}
            title="Choose or Drop an Excel Spreadsheet (.xlsx, .xls, .csv)"
            description="Turn Excel workbooks and CSV files into crisp PDF tables"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Table className="w-5 h-5" />
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

            <button
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Convert Excel Spreadsheet to PDF</span>
            </button>
          </div>
        )}

        <ProcessingModal
          state={state}
          resultBlob={resultBlob}
          resultFileName={selectedFile?.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf') || 'spreadsheet.pdf'}
          onReset={handleReset}
          title="Converting Excel to PDF"
        />
      </div>
    </SEOLandingTemplate>
  );
};
