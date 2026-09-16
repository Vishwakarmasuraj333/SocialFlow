'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { SocialFlowLogo } from '@/components/brand/logo';

export default function AdminForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setSubmitted(true);
      if (data.devToken) {
        setDevToken(data.devToken);
      }
      showToast('Recovery request submitted successfully', 'info');
    } catch {
      showToast('Network error processing request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200 mb-4">
          <SocialFlowLogo size="lg" variant="dark" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Admin Password Recovery
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Enter your authorized administrator email to generate a secure reset token.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/85 border border-slate-800/90 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl backdrop-blur-xl">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an active administrator account exists for <b>{email}</b>, token verification instructions have been generated.
              </p>

              {devToken && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/50 text-left space-y-1">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    Development Reset Link:
                  </span>
                  <Link
                    href={`/admin/reset-password?token=${devToken}`}
                    className="block text-xs text-indigo-300 hover:underline break-all font-mono"
                  >
                    /admin/reset-password?token={devToken}
                  </Link>
                </div>
              )}

              <Link href="/admin/login" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full rounded-xl">
                  Return to Admin Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@socialflow.io"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Send Recovery Instructions
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
