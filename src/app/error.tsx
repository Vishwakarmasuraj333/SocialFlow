"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SocialFlowLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 text-center">
      <Link href="/" className="mb-8">
        <SocialFlowLogo size="lg" />
      </Link>

      <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        Something unexpected happened
      </h1>
      <p className="mt-3 text-sm text-slate-500 max-w-md">
        Our platform error handler caught an unhandled exception. Your data and tokens remain securely encrypted.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Button variant="primary" onClick={() => reset()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
