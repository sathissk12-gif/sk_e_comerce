'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    login,
    register,
    loginWithGoogle
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMsg('');
    setSuccessMsg('');
  }, [authModalTab, isAuthModalOpen]);

  // Try to initialize Google Identity Services if available
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const initGoogleGsi = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/auth/config`);
        if (res.ok) {
          const config = await res.json();
          if (config.googleClientId && window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: config.googleClientId,
              callback: async (response: any) => {
                setIsLoading(true);
                setErrorMsg('');
                const res = await loginWithGoogle(response.credential);
                setIsLoading(false);
                if (!res.success) {
                  setErrorMsg(res.error || 'Google login failed');
                }
              }
            });
            const googleBtnContainer = document.getElementById('google-gsi-button');
            if (googleBtnContainer) {
              window.google.accounts.id.renderButton(googleBtnContainer, {
                theme: 'outline',
                size: 'large',
                width: 340,
                text: 'continue_with'
              });
            }
          }
        }
      } catch (e) {
        console.warn('GSI init notice:', e);
      }
    };

    initGoogleGsi();
  }, [isAuthModalOpen, loginWithGoogle]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (activeTab === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please try again.');
      }
    } else {
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      const res = await register(name, email, password, phone);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      } else {
        setSuccessMsg('Account created successfully! You are now logged in.');
      }
    }
  };

  const handleQuickGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');

    // Trigger official Firebase Google Sign-In popup
    const res = await loginWithGoogle();

    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-card border border-warm-beige rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Decorative Accent Banner */}
        <div className="bg-deep-green text-cream px-6 py-4 flex items-center justify-between border-b border-deep-green-light">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/homely_logo.png"
              alt="Homely"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="text-xs font-bold text-muted-gold tracking-wide uppercase">
              Secure Account
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full text-cream/80 hover:text-cream hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-charcoal tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-secondary-text">
              {activeTab === 'login'
                ? 'Sign in to access your festive orders and saved addresses'
                : 'Join Homely for exclusive festive discounts & quick checkout'}
            </p>
          </div>

          {/* Google Sign-In Section */}
          <div className="space-y-3">
            <div id="google-gsi-button" className="flex justify-center" />
            <button
              type="button"
              onClick={handleQuickGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-warm-beige hover:border-sage bg-cream/50 hover:bg-warm-beige/40 text-charcoal text-xs font-bold shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {/* Official Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-warm-beige w-full" />
            <span className="bg-card px-3 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              or with email
            </span>
            <div className="border-t border-warm-beige w-full" />
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-warm-beige/50 rounded-xl border border-warm-beige text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-card text-deep-green shadow-sm font-black'
                  : 'text-secondary-text hover:text-charcoal'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-card text-deep-green shadow-sm font-black'
                  : 'text-secondary-text hover:text-charcoal'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sathish Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-cream/40 border border-warm-beige rounded-xl py-2 pl-10 pr-4 text-xs text-charcoal placeholder:text-secondary-text focus:outline-none focus:border-deep-green focus:bg-card transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-charcoal">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-cream/40 border border-warm-beige rounded-xl py-2 pl-10 pr-4 text-xs text-charcoal placeholder:text-secondary-text focus:outline-none focus:border-deep-green focus:bg-card transition-all"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal">
                  Phone Number <span className="text-[10px] font-normal text-secondary-text">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98410 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-cream/40 border border-warm-beige rounded-xl py-2 pl-10 pr-4 text-xs text-charcoal placeholder:text-secondary-text focus:outline-none focus:border-deep-green focus:bg-card transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal">Password</label>
                {activeTab === 'login' && (
                  <span className="text-[11px] font-semibold text-deep-green hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-cream/40 border border-warm-beige rounded-xl py-2 pl-10 pr-10 text-xs text-charcoal placeholder:text-secondary-text focus:outline-none focus:border-deep-green focus:bg-card transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-charcoal p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream text-xs font-bold shadow-md shadow-deep-green/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-gold" />
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
                  <ArrowRight className="w-4 h-4 text-muted-gold" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="pt-2 border-t border-warm-beige flex items-center justify-center gap-1.5 text-[11px] font-semibold text-secondary-text">
            <ShieldCheck className="w-3.5 h-3.5 text-deep-green" />
            <span>256-Bit Encrypted Session & Salted Bcrypt Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
