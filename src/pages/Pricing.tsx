import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth } from '../lib/firebase';
import { SEO } from '../components/SEO';
import {
  Check,
  Zap,
  Shield,
  CreditCard,
  Building,
  Sparkles,
  Lock,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Pricing: React.FC = () => {
  const { user, openAuthModal, refreshBillingStatus } = useAuth();
  const toast = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlanModal, setSelectedPlanModal] = useState<'pro' | 'enterprise' | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Check URL parameters on mount for payment success / cancellation callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment_status');
    const provider = params.get('provider');

    if (status === 'success') {
      toast.success(`Payment confirmed via ${provider || 'payment provider'}! Updating your subscription...`);
      refreshBillingStatus();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancelled') {
      toast.info('Checkout session was cancelled.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!selectedPlanModal) return;

    setProcessingPayment(true);
    setPaymentErrorMessage(null);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const devToken = localStorage.getItem('mock_dev_token');
        if (devToken) headers['Authorization'] = `Bearer ${devToken}`;
      }

      const endpoint = paymentGateway === 'stripe' ? '/api/checkout/stripe' : '/api/checkout/razorpay';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan: selectedPlanModal }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || `Failed to initiate ${paymentGateway} checkout.`);
      }

      if (paymentGateway === 'stripe' && data.url) {
        // Securely redirect to Stripe-hosted Checkout Page
        window.location.href = data.url;
      } else if (paymentGateway === 'razorpay') {
        if ((window as any).Razorpay && data.orderId && data.keyId) {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'SmartPDF AI',
            description: `SmartPDF ${selectedPlanModal.toUpperCase()} Subscription`,
            order_id: data.orderId,
            handler: async function (_response: any) {
              toast.success('Razorpay payment completed! Verifying webhook confirmation...');
              setTimeout(() => {
                refreshBillingStatus();
                setSelectedPlanModal(null);
              }, 1500);
            },
            prefill: {
              name: user.name,
              email: user.email,
            },
            theme: {
              color: '#DC2626',
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          toast.success(`Razorpay checkout order #${data.orderId || 'created'} initialized! Order Amount: ₹${data.amount ? data.amount / 100 : 0}`);
          setTimeout(() => {
            refreshBillingStatus();
            setSelectedPlanModal(null);
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentErrorMessage(err.message || 'Payment checkout initialization failed.');
      toast.error(err.message || 'Checkout failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12">
      <SEO
        title="Pricing & Pro Subscription Plans - SmartPDF"
        description="Choose the ideal PDF tools & AI plan for individuals, teams, and enterprise workflows."
        path="/pricing"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Zap className="w-4 h-4" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Unlimited AI Document Power
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Start free with essential tools, or upgrade for unlimited file size, Gemini AI document intelligence, and team collaboration.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center p-1.5 bg-[#121215] border border-slate-800 rounded-2xl mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Free Plan</h3>
              <p className="text-xs text-slate-400 mb-6">Essential PDF utilities for personal tasks.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-500 font-semibold">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Basic Merge, Split, & Compress
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Max file size: 10 MB
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> 5 tasks per day
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <X className="w-4 h-4 text-slate-600" /> AI Document Chat & Assistant
                </li>
              </ul>
            </div>
            <button
              disabled={user?.plan === 'free'}
              className="w-full py-3 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              {user?.plan === 'free' ? 'Current Active Plan' : 'Free Tier'}
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="relative bg-gradient-to-b from-[#1c1214] via-[#121215] to-[#121215] border-2 border-red-500/60 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-red-600/10 transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Most Popular
            </div>

            <div>
              <h3 className="text-xl font-black text-white mb-1">SmartPDF Pro</h3>
              <p className="text-xs text-slate-400 mb-6">Full access to AI Chat, OCR, and unlimited tasks.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'yearly' ? '$12' : '$15'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-red-400" /> Unlimited PDF files & conversions
                </li>
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-red-400" /> Gemini AI Document Chat & Assistant
                </li>
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-red-400" /> Max file size: 500 MB
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" /> OCR Scanner (10+ Languages)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" /> Batch Processing & ZIP Export
                </li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlanModal('pro')}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-600/20 transition-all cursor-pointer"
            >
              {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-[#121215] border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Enterprise Team</h3>
              <p className="text-xs text-slate-400 mb-6">Shared workspaces, admin logs, and dedicated AI models.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'yearly' ? '$39' : '$49'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ seat / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-amber-400" /> Everything in Pro Plan
                </li>
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-amber-400" /> Shared Team Workspaces & Roles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Custom Cloud Storage Connectors
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Dedicated SLA & Priority Support
                </li>
              </ul>
            </div>
            <button
              onClick={() => setSelectedPlanModal('enterprise')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              {user?.plan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Gateway Modal */}
      <AnimatePresence>
        {selectedPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Checkout SmartPDF {selectedPlanModal.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400">Secure 256-bit SSL encrypted payment</p>
                </div>
                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gateway Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentGateway('stripe')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    paymentGateway === 'stripe'
                      ? 'bg-red-600/20 text-red-400 border-red-500'
                      : 'bg-[#18181d] text-slate-400 border-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Credit Card (Stripe)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('razorpay')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    paymentGateway === 'razorpay'
                      ? 'bg-red-600/20 text-red-400 border-red-500'
                      : 'bg-[#18181d] text-slate-400 border-slate-800'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Razorpay / UPI
                </button>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                {paymentErrorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentErrorMessage}</span>
                  </div>
                )}

                <div className="p-4 bg-[#18181d] border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Selected Plan:</span>
                    <span className="text-white font-extrabold uppercase">{selectedPlanModal} Plan</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Billing Cycle:</span>
                    <span className="text-slate-200 font-semibold capitalize">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Total Due Today:</span>
                    <span className="text-red-400 font-black text-sm">
                      {selectedPlanModal === 'enterprise'
                        ? billingCycle === 'yearly' ? '$39/mo' : '$49/mo'
                        : billingCycle === 'yearly' ? '$12/mo' : '$15/mo'}
                    </span>
                  </div>
                </div>

                {paymentGateway === 'stripe' ? (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                    You will be redirected to Stripe's 256-bit encrypted checkout server to enter payment details securely.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                    Creates a server-verified Razorpay order with instant UPI / NetBanking / Card settlement.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processingPayment ? (
                    <span className="inline-block animate-pulse">Initializing Gateway...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Proceed to {paymentGateway === 'stripe' ? 'Stripe Checkout' : 'Razorpay Order'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
