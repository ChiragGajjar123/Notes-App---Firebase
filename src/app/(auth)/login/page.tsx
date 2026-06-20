'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Sparkles } from 'lucide-react';

/**
 * Premium, validated user Login panel.
 */
export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, sendResetEmail, checkEmailExists } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot Password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [sending, setSending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  // Run on mount to check if there is an active cooldown from a previous session
  useEffect(() => {
    const lastSentStr = localStorage.getItem('lastPasswordResetEmailSent');
    if (lastSentStr) {
      const lastSent = parseInt(lastSentStr, 10);
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (elapsed < 60) {
        setCooldownTime(60 - elapsed);
      }
    }
  }, []);

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldownTime <= 0) return;
    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleOpenForgotModal = () => {
    setForgotEmail(email);
    setForgotEmailError('');
    setForgotSuccess('');
    setForgotError('');
    setIsForgotOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotEmailError('');
    setForgotSuccess('');
    setForgotError('');

    if (!forgotEmail) {
      setForgotEmailError('Email address is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotEmailError('Please enter a valid email format');
      return;
    }

    if (cooldownTime > 0) {
      setForgotError(`Please wait ${cooldownTime} seconds before requesting another email.`);
      return;
    }

    setSending(true);
    try {
      const exists = await checkEmailExists(forgotEmail);
      if (!exists) {
        setForgotError('No account found with this email address.');
        setSending(false);
        return;
      }

      await sendResetEmail(forgotEmail);
      setForgotSuccess('Password reset email sent! Check your inbox.');
      localStorage.setItem('lastPasswordResetEmailSent', Date.now().toString());
      setCooldownTime(60);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setForgotError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setForgotError('Invalid email format.');
      } else if (err.code === 'auth/too-many-requests') {
        setForgotError('Too many requests. Please try again later.');
      } else {
        setForgotError('Failed to send reset email. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    
    if (!email) {
      setEmailError('Email address is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email format');
      valid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }
    
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setAuthError('');
    
    try {
      await signInWithEmail(email, password);
      // Forced route transition
      router.push('/notes');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        setAuthError('Incorrect email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Access temporarily locked due to too many failed requests. Please try later.');
      } else {
        setAuthError('Login failed. Please check your credentials and try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
      router.push('/notes');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Google Sign-In was unsuccessful. Please retry.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 text-slate-100">
      {/* Decorative glass gradients */}
      <div className="absolute top-[-25%] left-[-20%] w-[60%] h-[60%] bg-brand-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-20%] w-[60%] h-[60%] bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-xs font-semibold mb-3 border border-brand-500/20">
            <Sparkles size={13} className="animate-pulse" />
            Workspace Real-time sync
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to access your notes from any device
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email-input"
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={emailError}
              disabled={loading || googleLoading}
              required
            />

            <div className="w-full space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label 
                  htmlFor="password-input" 
                  className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1"
                >
                  Password
                </label>
                <button
                  id="btn-forgot-password-trigger"
                  type="button"
                  onClick={handleOpenForgotModal}
                  disabled={loading || googleLoading}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline transition-colors focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password-input"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                error={passwordError}
                disabled={loading || googleLoading}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                id="btn-login-submit"
                type="submit"
                className="w-full py-3 text-sm font-semibold rounded-2xl"
                isLoading={loading}
                disabled={googleLoading}
              >
                Sign In with Email
              </Button>
            </div>
          </form>

          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-[#0b101c] px-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
              Or connect via
            </span>
          </div>

          <button
            id="btn-login-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-bold rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            )}
            <span className="text-sm font-semibold">Sign In with Google</span>
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account yet?{' '}
          <Link 
            href="/register" 
            id="link-go-to-register"
            className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all"
          >
            Create account
          </Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {forgotError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center animate-pulse">
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center">
              {forgotSuccess}
            </div>
          )}

          <Input
            id="forgot-email-input"
            label="Email Address"
            placeholder="name@example.com"
            type="email"
            value={forgotEmail}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              setForgotEmailError('');
            }}
            error={forgotEmailError}
            disabled={sending}
            required
          />

          <div className="pt-2">
            <Button
              id="btn-forgot-submit"
              type="submit"
              className="w-full py-3 text-sm font-semibold rounded-2xl"
              isLoading={sending}
              disabled={cooldownTime > 0}
            >
              {cooldownTime > 0 ? `Resend Link in ${cooldownTime}s` : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
