import React, { createContext, useContext, useState, useEffect } from 'react';

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
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
}

const STORAGE_USER_KEY = 'smartpdf_user_session';

const DEFAULT_MOCK_USER: UserProfile = {
  id: 'usr_8921a',
  name: 'Alex Vance',
  email: 'alex.vance@smartpdf.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  plan: 'pro',
  emailVerified: true,
  createdAt: '2026-01-15',
  role: 'admin',
  company: 'Apex Digital Systems',
  jobTitle: 'Principal Document Architect',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_MOCK_USER;
    } catch {
      return DEFAULT_MOCK_USER;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  const login = async (email: string) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      name: email.split('@')[0].replace('.', ' '),
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      plan: 'pro',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      role: email.includes('admin') ? 'admin' : 'user',
    };
    setUser(newUser);
    setAuthModalOpen(false);
  };

  const googleLogin = async () => {
    await new Promise((r) => setTimeout(r, 700));
    const googleUser: UserProfile = {
      id: 'google_usr_99',
      name: 'Alex Vance (Google)',
      email: 'alex.vance@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      plan: 'pro',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'user',
      company: 'Google Workspace',
      jobTitle: 'Senior Product Manager',
      provider: 'google',
    };
    setUser(googleUser);
    setAuthModalOpen(false);
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

  const logout = () => {
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
