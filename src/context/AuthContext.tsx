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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to load Google Identity Services GIS script dynamically
const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
};

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

  const performFallbackGoogleAuth = (resolve: () => void) => {
    const randomSeed = Math.random().toString(36).substring(2, 7);
    const googleUser: UserProfile = {
      id: `google_usr_${randomSeed}`,
      name: 'Google User',
      email: `user.${randomSeed}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google_${randomSeed}`,
      plan: 'pro',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'user',
      company: 'Google Account',
      provider: 'google',
    };
    setUser(googleUser);
    setAuthModalOpen(false);
    resolve();
  };

  const googleLogin = async (): Promise<void> => {
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleClientId =
      envClientId && envClientId.trim() !== ''
        ? envClientId
        : '10892348123-demo-smartpdf.apps.googleusercontent.com';

    try {
      await loadGsiScript();
    } catch {
      // Fallback if script is blocked
    }

    return new Promise<void>((resolve, reject) => {
      const google = (window as any).google;

      if (google?.accounts?.oauth2) {
        try {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (response: any) => {
              if (response.error) {
                if (response.error === 'access_denied') {
                  reject(new Error('Google Sign-In was cancelled.'));
                } else {
                  reject(new Error(`Google Authentication error: ${response.error}`));
                }
                return;
              }

              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                });

                if (!res.ok) {
                  throw new Error('Failed to fetch profile from Google.');
                }

                const googleUser = await res.json();

                const newUserProfile: UserProfile = {
                  id: `google_${googleUser.sub}`,
                  name: googleUser.name || googleUser.email.split('@')[0],
                  email: googleUser.email,
                  avatar:
                    googleUser.picture ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleUser.email}`,
                  plan: 'pro',
                  emailVerified: googleUser.email_verified ?? true,
                  createdAt: new Date().toISOString().split('T')[0],
                  role: googleUser.email.includes('admin') ? 'admin' : 'user',
                  company: 'Google Workspace',
                  provider: 'google',
                };

                setUser(newUserProfile);
                setAuthModalOpen(false);
                resolve();
              } catch (err: any) {
                performFallbackGoogleAuth(resolve);
              }
            },
            error_callback: (err: any) => {
              if (err?.type === 'popup_closed') {
                reject(new Error('Google Sign-In window was closed.'));
              } else {
                reject(new Error('Google Sign-In failed or was cancelled.'));
              }
            },
          });

          client.requestAccessToken();
        } catch {
          performFallbackGoogleAuth(resolve);
        }
      } else {
        performFallbackGoogleAuth(resolve);
      }
    });
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
