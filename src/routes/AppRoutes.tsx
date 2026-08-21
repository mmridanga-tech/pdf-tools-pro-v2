import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from './ProtectedRoute';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';

const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })));
const MergePDF = lazy(() => import('../pages/MergePDF').then((m) => ({ default: m.MergePDF })));
const SplitPDF = lazy(() => import('../pages/SplitPDF').then((m) => ({ default: m.SplitPDF })));
const DeletePDFPages = lazy(() => import('../pages/DeletePDFPages').then((m) => ({ default: m.DeletePDFPages })));
const ExtractPDFPages = lazy(() => import('../pages/ExtractPDFPages').then((m) => ({ default: m.ExtractPDFPages })));
const RearrangePDFPages = lazy(() => import('../pages/RearrangePDFPages').then((m) => ({ default: m.RearrangePDFPages })));
const DuplicatePDFPages = lazy(() => import('../pages/DuplicatePDFPages').then((m) => ({ default: m.DuplicatePDFPages })));
const CompressPDF = lazy(() => import('../pages/CompressPDF').then((m) => ({ default: m.CompressPDF })));
const PDFToWord = lazy(() => import('../pages/PDFToWord').then((m) => ({ default: m.PDFToWord })));
const WordToPDF = lazy(() => import('../pages/WordToPDF').then((m) => ({ default: m.WordToPDF })));
const ExcelToPDF = lazy(() => import('../pages/ExcelToPDF').then((m) => ({ default: m.ExcelToPDF })));
const PDFToExcel = lazy(() => import('../pages/PDFToExcel').then((m) => ({ default: m.PDFToExcel })));
const PowerPointToPDF = lazy(() => import('../pages/PowerPointToPDF').then((m) => ({ default: m.PowerPointToPDF })));
const PDFToPowerPoint = lazy(() => import('../pages/PDFToPowerPoint').then((m) => ({ default: m.PDFToPowerPoint })));
const RotatePDF = lazy(() => import('../pages/RotatePDF').then((m) => ({ default: m.RotatePDF })));
const WatermarkPDF = lazy(() => import('../pages/WatermarkPDF').then((m) => ({ default: m.WatermarkPDF })));
const PageNumbersPDF = lazy(() => import('../pages/PageNumbersPDF').then((m) => ({ default: m.PageNumbersPDF })));
const OcrPDF = lazy(() => import('../pages/OcrPDF').then((m) => ({ default: m.OcrPDF })));
const ProtectPDF = lazy(() => import('../pages/ProtectPDF').then((m) => ({ default: m.ProtectPDF })));
const UnlockPDF = lazy(() => import('../pages/UnlockPDF').then((m) => ({ default: m.UnlockPDF })));
const SecurityPDF = lazy(() => import('../pages/SecurityPDF').then((m) => ({ default: m.SecurityPDF })));

// Image Tools
const ImageToPDF = lazy(() => import('../pages/ImageToPDF').then((m) => ({ default: m.ImageToPDF })));
const PDFToImage = lazy(() => import('../pages/PDFToImage').then((m) => ({ default: m.PDFToImage })));
const CompressImage = lazy(() => import('../pages/CompressImage').then((m) => ({ default: m.CompressImage })));
const ResizeImage = lazy(() => import('../pages/ResizeImage').then((m) => ({ default: m.ResizeImage })));

// Modules 1-9 Additions
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const PdfChat = lazy(() => import('../pages/PdfChat').then((m) => ({ default: m.PdfChat })));
const AiAssistant = lazy(() => import('../pages/AiAssistant').then((m) => ({ default: m.AiAssistant })));
const DocumentAnalyzer = lazy(() => import('../pages/DocumentAnalyzer').then((m) => ({ default: m.DocumentAnalyzer })));
const TeamWorkspace = lazy(() => import('../pages/TeamWorkspace').then((m) => ({ default: m.TeamWorkspace })));
const AdminPanel = lazy(() => import('../pages/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const AdminContentGenerator = lazy(() => import('../pages/AdminContentGenerator').then((m) => ({ default: m.AdminContentGenerator })));
const Pricing = lazy(() => import('../pages/Pricing').then((m) => ({ default: m.Pricing })));
const CloudStoragePage = lazy(() => import('../pages/CloudStorage').then((m) => ({ default: m.CloudStoragePage })));
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })));
const HelpCenter = lazy(() => import('../pages/HelpCenter').then((m) => ({ default: m.HelpCenter })));
// Legal & Policy Pages
const PrivacyPolicy = lazy(() => import('../pages/LegalPages').then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('../pages/LegalPages').then((m) => ({ default: m.TermsOfService })));
const CookiesPolicy = lazy(() => import('../pages/CookiePolicy').then((m) => ({ default: m.CookiePolicy })));
const SecurityTrust = lazy(() => import('../pages/SecurityTrust').then((m) => ({ default: m.SecurityTrust })));
const Disclaimer = lazy(() => import('../pages/LegalPages').then((m) => ({ default: m.Disclaimer })));
const AboutUs = lazy(() => import('../pages/LegalPages').then((m) => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('../pages/LegalPages').then((m) => ({ default: m.ContactUs })));
const EditorialPolicy = lazy(() => import('../pages/EditorialPolicy').then((m) => ({ default: m.EditorialPolicy })));
const ReviewProcess = lazy(() => import('../pages/ReviewProcess').then((m) => ({ default: m.ReviewProcess })));
const AIContentPolicy = lazy(() => import('../pages/AIContentPolicy').then((m) => ({ default: m.AIContentPolicy })));
const BlogHome = lazy(() => import('../pages/BlogHome').then((m) => ({ default: m.BlogHome })));
const BlogPost = lazy(() => import('../pages/BlogPost').then((m) => ({ default: m.BlogPost })));
const AuthorProfile = lazy(() => import('../pages/AuthorProfile').then((m) => ({ default: m.AuthorProfile })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// SEO Landing Pages
const MergePDFOnline = lazy(() => import('../pages/landing/MergePDFOnline').then((m) => ({ default: m.MergePDFOnline })));
const SplitPDFOnline = lazy(() => import('../pages/landing/SplitPDFOnline').then((m) => ({ default: m.SplitPDFOnline })));
const CompressPDFOnline = lazy(() => import('../pages/landing/CompressPDFOnline').then((m) => ({ default: m.CompressPDFOnline })));
const PDFToWordOnline = lazy(() => import('../pages/landing/PDFToWordOnline').then((m) => ({ default: m.PDFToWordOnline })));
const WordToPDFOnline = lazy(() => import('../pages/landing/WordToPDFOnline').then((m) => ({ default: m.WordToPDFOnline })));
const ExcelToPDFOnline = lazy(() => import('../pages/landing/ExcelToPDFOnline').then((m) => ({ default: m.ExcelToPDFOnline })));
const JPGToPDFOnline = lazy(() => import('../pages/landing/JPGToPDFOnline').then((m) => ({ default: m.JPGToPDFOnline })));
const PDFToJPGOnline = lazy(() => import('../pages/landing/PDFToJPGOnline').then((m) => ({ default: m.PDFToJPGOnline })));
const ProtectPDFOnline = lazy(() => import('../pages/landing/ProtectPDFOnline').then((m) => ({ default: m.ProtectPDFOnline })));
const UnlockPDFOnline = lazy(() => import('../pages/landing/UnlockPDFOnline').then((m) => ({ default: m.UnlockPDFOnline })));

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
    <span className="text-sm font-semibold tracking-wide">Loading Module...</span>
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
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/delete-pages" element={<DeletePDFPages />} />
          <Route path="/extract-pages" element={<ExtractPDFPages />} />
          <Route path="/rearrange-pages" element={<RearrangePDFPages />} />
          <Route path="/duplicate-pages" element={<DuplicatePDFPages />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/excel-to-pdf-tool" element={<ExcelToPDF />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/powerpoint-to-pdf" element={<PowerPointToPDF />} />
          <Route path="/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
          <Route path="/rotate" element={<RotatePDF />} />
          <Route path="/watermark" element={<WatermarkPDF />} />
          <Route path="/page-numbers" element={<PageNumbersPDF />} />
          <Route path="/ocr-pdf" element={<OcrPDF />} />
          <Route path="/protect-pdf" element={<ProtectPDF />} />
          <Route path="/protect-pdf-online" element={<ProtectPDFOnline />} />
          <Route path="/unlock-pdf" element={<UnlockPDF />} />
          <Route path="/unlock-pdf-online" element={<UnlockPDFOnline />} />
          <Route path="/pdf-security" element={<SecurityPDF />} />

          {/* SEO Landing Pages */}
          <Route path="/merge-pdf-online" element={<MergePDFOnline />} />
          <Route path="/split-pdf-online" element={<SplitPDFOnline />} />
          <Route path="/compress-pdf-online" element={<CompressPDFOnline />} />
          <Route path="/pdf-to-word-online" element={<PDFToWordOnline />} />
          <Route path="/word-to-pdf-online" element={<WordToPDFOnline />} />
          <Route path="/excel-to-pdf" element={<ExcelToPDFOnline />} />
          <Route path="/jpg-to-pdf" element={<JPGToPDFOnline />} />
          <Route path="/pdf-to-jpg" element={<PDFToJPGOnline />} />

          {/* Image Tools */}
          <Route path="/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/pdf-to-image" element={<PDFToImage />} />
          <Route path="/compress-image" element={<CompressImage />} />
          <Route path="/resize-image" element={<ResizeImage />} />

          {/* New Platform Modules */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/chat-pdf" element={<PdfChat />} />
          <Route path="/ai-chat" element={<PdfChat />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/document-analyzer" element={<DocumentAnalyzer />} />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-workspace"
            element={
              <ProtectedRoute>
                <TeamWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspaces"
            element={
              <ProtectedRoute>
                <TeamWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/content-generator" element={<AdminContentGenerator />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/cloud-storage"
            element={
              <ProtectedRoute>
                <CloudStoragePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiesPolicy />} />
          <Route path="/cookie-policy" element={<CookiesPolicy />} />
          <Route path="/security" element={<SecurityTrust />} />
          <Route path="/trust" element={<SecurityTrust />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/review-process" element={<ReviewProcess />} />
          <Route path="/ai-content-policy" element={<AIContentPolicy />} />
          <Route path="/blog" element={<BlogHome />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/author/mridanga-mondal" element={<AuthorProfile />} />
          <Route path="/author/:authorSlug" element={<AuthorProfile />} />
          <Route path="/404" element={<NotFoundPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <AuthModal />
    </>
  );
};
