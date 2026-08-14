import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
} from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  emailVerified: boolean;
  createdAt: string;
  role: 'user' | 'admin';
  company?: string;
  jobTitle?: string;
  provider?: 'google' | 'email';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void> | void;
  updateProfile: (data: Partial<UserProfile>) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;
  refreshBillingStatus: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
}

const STORAGE_USER_KEY = 'smartpdf_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const refreshBillingStatus = async () => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const testToken = localStorage.getItem('mock_dev_token');
        if (testToken) headers['Authorization'] = `Bearer ${testToken}`;
      }

      const res = await fetch('/api/billing/status', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.plan && user) {
          setUser((prev) => (prev ? { ...prev, plan: data.plan } : prev));
        }
      }
    } catch (err) {
      console.warn('Billing status sync notice:', err);
    }
  };

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const newUserProfile: UserProfile = {
          id: `google_${fbUser.uid}`,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
          email: fbUser.email || '',
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.email || fbUser.uid}`,
          plan: 'free',
          emailVerified: fbUser.emailVerified ?? true,
          createdAt: new Date().toISOString().split('T')[0],
          role: fbUser.email && fbUser.email.includes('admin') ? 'admin' : 'user',
          company: 'Google Account',
          provider: 'google',
        };
        setUser(newUserProfile);
        setTimeout(refreshBillingStatus, 300);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  const login = async (email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      name: email.split('@')[0].replace('.', ' '),
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      plan: 'pro',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      role: email.includes('admin') ? 'admin' : 'user',
      provider: 'email',
    };
    setUser(newUser);
    setAuthModalOpen(false);
  };

  const googleLogin = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const newUserProfile: UserProfile = {
        id: `google_${fbUser.uid}`,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email || '',
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.email || fbUser.uid}`,
        plan: 'pro',
        emailVerified: fbUser.emailVerified ?? true,
        createdAt: new Date().toISOString().split('T')[0],
        role: fbUser.email && fbUser.email.includes('admin') ? 'admin' : 'user',
        company: 'Google Account',
        provider: 'google',
      };
      setUser(newUserProfile);
      setAuthModalOpen(false);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In popup was closed before completing sign in.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        throw new Error('Google Sign-In popup request was cancelled.');
      } else if (err?.code === 'auth/popup-blocked') {
        throw new Error('Google Sign-In popup was blocked by browser. Please allow popups.');
      }
      throw new Error(err?.message || 'Google Sign-In with Firebase failed.');
    }
  };

  const register = async (name: string, email: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      plan: 'free',
      emailVerified: false,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'user',
    };
    setUser(newUser);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signout errors
    }
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const sendPasswordReset = async (_email: string) => {
    await new Promise((r) => setTimeout(r, 500));
  };

  const sendEmailVerification = async () => {
    await new Promise((r) => setTimeout(r, 500));
    if (user) {
      setUser({ ...user, emailVerified: true });
    }
  };

  const upgradePlan = (plan: 'pro' | 'enterprise') => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        googleLogin,
        register,
        logout,
        updateProfile,
        sendPasswordReset,
        sendEmailVerification,
        upgradePlan,
        refreshBillingStatus,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
