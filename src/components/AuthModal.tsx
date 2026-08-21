import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogOut
} from 'lucide-react';
import { UserSession } from '../types';
import { setStoredAuthToken, setStoredUserEmail } from '../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onUpdateSession: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onUpdateSession,
}) => {
  const [emailInput, setEmailInput] = useState(userSession.email);
  const [roleInput, setRoleInput] = useState<'user' | 'admin'>(userSession.role);
  const [planInput, setPlanInput] = useState<'free' | 'pro' | 'enterprise'>(userSession.plan);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `mock_token_${roleInput}_${emailInput}`;
    setStoredAuthToken(token);
    setStoredUserEmail(emailInput);

    onUpdateSession({
      ...userSession,
      email: emailInput,
      role: roleInput,
      plan: planInput,
      token,
    });
    onClose();
  };

  const handleLogout = () => {
    const defaultEmail = 'user@smartpdf.ai';
    const defaultToken = 'mock_token_user_user@smartpdf.ai';
    setStoredAuthToken(defaultToken);
    setStoredUserEmail(defaultEmail);

    onUpdateSession({
      uid: 'user_123',
      email: defaultEmail,
      role: 'user',
      plan: 'free',
      token: defaultToken,
      dailyAiLimit: 25,
      dailyAiUsed: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">User Account & Role</h3>
            <p className="text-xs text-slate-500">Manage your active authentication session</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Role:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['user', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleInput(r)}
                  className={`py-2 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer ${
                    roleInput === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subscription Plan Tier:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['free', 'pro', 'enterprise'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlanInput(p)}
                  className={`py-2 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer ${
                    planInput === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Reset Session
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
