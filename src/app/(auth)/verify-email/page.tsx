import React from "react";
import Link from "next/link";
import { SocialFlowLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-6">
        <Link href="/" className="inline-block">
          <SocialFlowLogo size="lg" />
        </Link>

        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verified</h1>
          <p className="text-xs text-slate-500 mt-2">
            Your work email address has been verified in our authentication records. Your workspace is fully active and ready to connect social channels.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary" className="w-full gap-2">
              <span>Go to Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
