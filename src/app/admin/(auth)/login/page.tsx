'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { SocialFlowLogo } from '@/components/brand/logo';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/admin';
  const urlError = searchParams.get('error');

  // Form state (Unfilled so admin enters their own credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'forbidden'
      ? 'Access restricted: Administrator credentials with appropriate privileges are required.'
      : null
  );

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password. Please try again.');
        showToast(data.error || 'Authentication failed', 'error');
        setIsLoading(false);
        return;
      }

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError('Network connection error. Please verify your connection and try again.');
      setIsLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      const targetEmail = (forgotEmail || email).trim();
      if (!targetEmail) {
        showToast('Please enter your administrator email address', 'error');
        setIsForgotLoading(false);
        return;
      }
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      setForgotSuccess(true);
      const token = data.recoveryToken || data.devToken || data.token;
      if (token) {
        setResetToken(token);
      }
      showToast('Password recovery token generated successfully', 'success');
    } catch {
      showToast('Error requesting password recovery', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Handle setting new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      showToast('Recovery token is required', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters with upper, lower, number, and special character', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password updated! You can now sign in immediately.', 'success');
        setEmail(forgotEmail || email);
        setPassword(newPassword);
        setIsForgotModalOpen(false);
        setForgotSuccess(false);
        setResetToken(null);
        setError(null);
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch {
      showToast('Network error while resetting password', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex justify-center mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
            title="Return to SocialFlow Home"
          >
            <SocialFlowLogo size="lg" variant="dark" />
          </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Admin Sign In
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your administrative credentials to manage your platform
        </p>
      </div>

      {/* Clean Login Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50">

        {/* Security / Error Notification */}
        {error && (
          <div
            id="login-error-msg"
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed"
          >
            {urlError === 'forbidden' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="admin-email-input"
                type="email"
                required
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error && urlError !== 'forbidden') setError(null);
                }}
                placeholder="admin@yourdomain.com"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error-msg' : undefined}
                className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error && urlError !== 'forbidden') setError(null);
                }}
                placeholder="Enter your administrator password"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error-msg' : undefined}
                className="block w-full pl-10 pr-11 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-colors tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
              />
              <span>Remember this device</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setIsForgotModalOpen(true);
              }}
              className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !email.trim() || !password}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-1.5 font-medium">
        <span>Protected by SocialFlow Enterprise Security</span>
      </p>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Reset Admin Password</h2>
                  <p className="text-xs text-slate-400">Recover your admin credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccess(false);
                  setResetToken(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4 pt-1">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your administrator email address to generate a secure recovery token.
                </p>
                <div>
                  <label htmlFor="forgot-email-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@socialflow.io"
                    className="block w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="rounded-xl border-slate-800 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isForgotLoading}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
                  >
                    Get Recovery Token
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 pt-1">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Token generated for <b>{forgotEmail}</b></span>
                </div>

                {resetToken && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-900/50">
                    <span className="text-[10px] text-slate-400 block font-mono">Recovery Token:</span>
                    <span className="text-xs font-mono text-indigo-300 break-all">{resetToken}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="new-password-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    New Password (min 8 characters)
                  </label>
                  <input
                    id="new-password-input"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="block w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-new-password-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-new-password-input"
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="block w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isResetting}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
                  >
                    Save Password &amp; Sign In
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Suspense
        fallback={
          <div className="w-full max-w-[420px] p-8 text-center text-slate-500 text-xs">
            Loading Admin Access...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
