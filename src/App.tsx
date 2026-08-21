import React, { useState, useEffect } from 'react';
import { ToolId, UserSession } from './types';
import { Navbar } from './components/Navbar';
import { ToolsGrid } from './components/ToolsGrid';
import { PdfProcessor } from './components/PdfProcessor';
import { AiDocumentChat } from './components/AiDocumentChat';
import { DocumentAnalyzerView } from './components/DocumentAnalyzerView';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { AdminSeoGenerator } from './components/AdminSeoGenerator';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/apiClient';
import { ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [chatInitialContext, setChatInitialContext] = useState<string>('');
  const { user, openAuthModal } = useAuth();

  const [userSession, setUserSession] = useState<UserSession>({
    uid: user?.id || 'guest_user',
    email: user?.email || '',
    role: user?.role || 'user',
    plan: user?.plan || 'free',
    token: '',
    dailyAiLimit: 25,
    dailyAiUsed: 0,
  });

  useEffect(() => {
    if (user) {
      setUserSession({
        uid: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        token: '',
        dailyAiLimit: user.plan === 'pro' ? 200 : user.plan === 'enterprise' ? 10000 : 25,
        dailyAiUsed: 0,
      });
    }
  }, [user]);

  const handlePlanUpdated = (newPlan: 'free' | 'pro' | 'enterprise') => {
    const limits = { free: 25, pro: 200, enterprise: 10000 };
    setUserSession((prev) => ({
      ...prev,
      plan: newPlan,
      dailyAiLimit: limits[newPlan],
    }));
  };

  const handleOpenAiChatWithText = (text: string) => {
    setChatInitialContext(text);
    setActiveTool('ai-chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        userSession={userSession}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAuth={() => openAuthModal('login')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTool === null && (
          <ToolsGrid onSelectTool={(toolId) => setActiveTool(toolId)} />
        )}

        {activeTool === 'ai-chat' && (
          <AiDocumentChat
            initialContext={chatInitialContext}
            userSession={userSession}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        )}

        {activeTool === 'ai-analyzer' && (
          <DocumentAnalyzerView
            onBack={() => setActiveTool(null)}
            userSession={userSession}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        )}

        {activeTool === 'telemetry' && (
          <TelemetryDashboard onBack={() => setActiveTool(null)} />
        )}

        {activeTool === 'admin-seo' && (
          <AdminSeoGenerator onBack={() => setActiveTool(null)} />
        )}

        {activeTool &&
          activeTool !== 'ai-chat' &&
          activeTool !== 'ai-analyzer' &&
          activeTool !== 'telemetry' &&
          activeTool !== 'admin-seo' && (
            <PdfProcessor
              toolId={activeTool}
              onBack={() => setActiveTool(null)}
              onOpenAiChatWithText={handleOpenAiChatWithText}
            />
          )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SmartPDF AI Pro — 100% Client-Side WebAssembly Privacy & Gemini Document Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              WASM Engine v2.4.0
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Powered by Gemini 3.6 Flash
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userSession={userSession}
        onPlanUpdated={handlePlanUpdated}
      />

      <AuthModal />
    </div>
  );
};

export default App;
