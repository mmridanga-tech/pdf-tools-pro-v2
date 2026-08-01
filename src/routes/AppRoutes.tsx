import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })));
const MergePDF = lazy(() => import('../pages/MergePDF').then((m) => ({ default: m.MergePDF })));
const SplitPDF = lazy(() => import('../pages/SplitPDF').then((m) => ({ default: m.SplitPDF })));
const CompressPDF = lazy(() => import('../pages/CompressPDF').then((m) => ({ default: m.CompressPDF })));
const PDFToWord = lazy(() => import('../pages/PDFToWord').then((m) => ({ default: m.PDFToWord })));
const WordToPDF = lazy(() => import('../pages/WordToPDF').then((m) => ({ default: m.WordToPDF })));
const RotatePDF = lazy(() => import('../pages/RotatePDF').then((m) => ({ default: m.RotatePDF })));
const WatermarkPDF = lazy(() => import('../pages/WatermarkPDF').then((m) => ({ default: m.WatermarkPDF })));
const PageNumbersPDF = lazy(() => import('../pages/PageNumbersPDF').then((m) => ({ default: m.PageNumbersPDF })));
const OcrPDF = lazy(() => import('../pages/OcrPDF').then((m) => ({ default: m.OcrPDF })));
const ProtectPDF = lazy(() => import('../pages/ProtectPDF').then((m) => ({ default: m.ProtectPDF })));
const UnlockPDF = lazy(() => import('../pages/UnlockPDF').then((m) => ({ default: m.UnlockPDF })));
const SecurityPDF = lazy(() => import('../pages/SecurityPDF').then((m) => ({ default: m.SecurityPDF })));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-slate-400">
    <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
    <span className="text-sm font-semibold tracking-wide">Loading Tool...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/rotate" element={<RotatePDF />} />
          <Route path="/watermark" element={<WatermarkPDF />} />
          <Route path="/page-numbers" element={<PageNumbersPDF />} />
          <Route path="/ocr-pdf" element={<OcrPDF />} />
          <Route path="/protect-pdf" element={<ProtectPDF />} />
          <Route path="/unlock-pdf" element={<UnlockPDF />} />
          <Route path="/pdf-security" element={<SecurityPDF />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </>
  );
};

