'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialFlowLogo } from '@/components/brand/logo';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to admin login
    const timer = setTimeout(() => {
      router.replace('/admin/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex justify-center mb-2">
          <SocialFlowLogo size="md" variant="dark" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Public Registration Disabled</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          SocialFlow is an enterprise Admin-Only platform. Public user registration and self-signup are strictly prohibited. Only pre-provisioned administrative accounts may access the system.
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          Redirecting to Admin Portal...
        </p>
        <div className="pt-2">
          <Link href="/admin/login">
            <Button size="sm" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500">
              Go to Admin Login Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
