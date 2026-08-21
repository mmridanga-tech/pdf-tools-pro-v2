import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  firebaseSendEmailVerification,
  firebaseUpdateProfile,
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
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void> | void;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;
  refreshBillingStatus: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const refreshBillingStatus = async () => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      if (!token) return;

      const res = await fetch('/api/billing/status', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const serverPlan = data?.plan || data?.data?.plan;
        if (serverPlan) {
          setUser((prev) => (prev ? { ...prev, plan: serverPlan } : prev));
        }
      }
    } catch (err) {
      console.warn('Billing status sync notice:', err);
    }
  };

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (fbUser) {
        const isInitialAdmin =
          fbUser.email === 'mmridanga@gmail.com' ||
          Boolean(fbUser.email && fbUser.email.includes('admin@smartpdf.ai'));

        const isGoogle = fbUser.providerData?.some((p) => p.providerId === 'google.com');

        const newUserProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || (isGoogle ? 'Google User' : 'User'),
          email: fbUser.email || '',
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fbUser.email || fbUser.uid)}`,
          plan: 'free',
          emailVerified: fbUser.emailVerified,
          createdAt: fbUser.metadata?.creationTime
            ? new Date(fbUser.metadata.creationTime).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          role: isInitialAdmin ? 'admin' : 'user',
          company: isGoogle ? 'Google Account' : undefined,
          provider: isGoogle ? 'google' : 'email',
        };

        setUser(newUserProfile);
        setIsLoading(false);

        // Sync billing status
        try {
          const token = await fbUser.getIdToken();
          if (token) {
            const res = await fetch('/api/billing/status', {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            });
            if (res.ok) {
              const bData = await res.json();
              const activePlan = bData?.plan || bData?.data?.plan;
              if (activePlan) {
                setUser((prev) => (prev ? { ...prev, plan: activePlan } : prev));
              }
            }
          }
        } catch {
          // Ignore billing background sync notice
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setAuthModalOpen(false);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (code === 'auth/user-disabled') {
        throw new Error('This user account has been disabled. Please contact support.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again in a few minutes or reset your password.');
      }
      throw new Error(err?.message || 'Failed to sign in with email and password.');
    }
  };

  const googleLogin = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider);
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

  const register = async (name: string, email: string, password?: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Please enter an email address and a secure password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (credential.user && name.trim()) {
        await firebaseUpdateProfile(credential.user, { displayName: name.trim() });
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please sign in.');
      } else if (code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(err?.message || 'Failed to create account.');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign out notice:', err);
    }
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (auth.currentUser && data.name) {
      try {
        await firebaseUpdateProfile(auth.currentUser, { displayName: data.name });
      } catch (err) {
        console.warn('Failed to update Firebase user profile:', err);
      }
    }
    if (user) {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!email) {
      throw new Error('Please provide an email address to receive password reset instructions.');
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        throw new Error('No user found with this email address.');
      } else if (err?.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(err?.message || 'Failed to send password reset email.');
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user session found.');
    }
    try {
      await firebaseSendEmailVerification(auth.currentUser);
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Too many verification requests. Please wait a moment before trying again.');
      }
      throw new Error(err?.message || 'Failed to send email verification.');
    }
  };

  const upgradePlan = (plan: 'pro' | 'enterprise') => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, plan } : null));
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
        isLoading,
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
