import React from "react";
import Link from "next/link";
import { SocialFlowLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 text-center">
      <Link href="/" className="mb-8">
        <SocialFlowLogo size="lg" />
      </Link>

      <span className="text-6xl font-black font-mono text-indigo-500 mb-2">404</span>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        Looks like this page went off the social grid.
      </h1>
      <p className="mt-3 text-sm text-slate-500 max-w-md">
        The requested URL could not be found or has been relocated. Return to your workspace or home.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="primary" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            Home Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
