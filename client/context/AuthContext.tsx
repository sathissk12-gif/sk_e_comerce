'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getApiBaseUrl } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential?: string, mockProfile?: { name: string; email: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'homely_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Verify stored token on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid, clear
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed. Please check credentials.' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Please make sure the server is online.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed.' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Please make sure the server is online.' };
    }
  };

  const loginWithGoogle = async (
    credential?: string,
    mockProfile?: { name: string; email: string; avatarUrl?: string }
  ) => {
    try {
      let idToken = credential;
      let profile = mockProfile;

      // Real Firebase Google popup authentication
      if (!credential && !mockProfile && typeof window !== 'undefined') {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          idToken = await fbUser.getIdToken();
          profile = {
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            avatarUrl: fbUser.photoURL || undefined,
          };
        } catch (popupErr: any) {
          console.error('Firebase Google Sign-In Error:', popupErr);
          if (popupErr.code === 'auth/popup-closed-by-user') {
            return { success: false, error: 'Google sign-in was cancelled.' };
          }
          if (popupErr.code === 'auth/cancelled-popup-request') {
            return { success: false, error: 'Sign-in popup was cancelled.' };
          }
          if (popupErr.code === 'auth/unauthorized-domain') {
            const domain = window.location.hostname;
            return {
              success: false,
              error: `Domain '${domain}' is not authorized in Firebase. Please add '${domain}' to Authorized Domains in Firebase Console > Authentication > Settings.`,
            };
          }
          if (popupErr.code === 'auth/operation-not-allowed') {
            return {
              success: false,
              error: 'Google Sign-In is disabled. Please enable Google provider in Firebase Console > Authentication > Sign-in method.',
            };
          }
          if (popupErr.code === 'auth/popup-blocked') {
            return {
              success: false,
              error: 'Pop-up was blocked by your browser. Please allow pop-ups for this site.',
            };
          }
          return {
            success: false,
            error: popupErr.message || `Google sign-in error (${popupErr.code || 'unknown'})`,
          };
        }
      }

      if (!idToken && !profile?.email) {
        return { success: false, error: 'No Google account credentials received. Please try again.' };
      }

      const res = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: idToken, clientMockProfile: profile }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Google authentication failed.' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error connecting to authentication server.' };
    }
  };

  const logout = () => {
    try {
      firebaseSignOut(auth).catch(() => {});
    } catch (e) {}
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
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
