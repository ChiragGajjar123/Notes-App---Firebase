'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles } from 'lucide-react';

/**
 * Premium, validated user Register panel.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    }

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

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
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
      await signUpWithEmail(email, password, name);
      router.push('/notes');
    } catch (err: any) {
      console.error('Email sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already in use by another account.');
      } else {
        setAuthError('Failed to create account. Please try again.');
      }
      setLoading(false);
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
            Join Aether workspace
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-white mb-2">
            Create account
          </h1>
          <p className="text-slate-400 text-sm">
            Sign up to get started with your secure notebook
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-md">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name-input"
              label="Full Name"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              error={nameError}
              disabled={loading}
              required
            />

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
              disabled={loading}
              required
            />

            <Input
              id="password-input"
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              error={passwordError}
              disabled={loading}
              required
            />

            <Input
              id="confirm-password-input"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmError('');
              }}
              error={confirmError}
              disabled={loading}
              required
            />

            <div className="pt-2">
              <Button
                id="btn-register-submit"
                type="submit"
                className="w-full py-3 text-sm font-semibold rounded-2xl"
                isLoading={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link 
            href="/login" 
            id="link-go-to-login"
            className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all"
          >
            Sign in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
