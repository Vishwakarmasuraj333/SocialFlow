"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Zap,
  SlidersHorizontal,
  Key,
  Lock,
  Sparkles,
  Server,
} from "lucide-react";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import { useToast } from "@/components/ui/toast";

export default function AdminIntegrationsPage() {
  const { showToast } = useToast();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 20, configured: 0, pending: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch {
      showToast("Failed to load provider integrations status", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (platformKey: string) => {
    setTestingPlatform(platformKey);
    try {
      const res = await fetch(`/api/admin/integrations/${platformKey}/test`, {
        method: "POST",
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [platformKey]: data }));

      if (data.success) {
        showToast(
          `Verified ${data.displayName || platformKey.toUpperCase()} connection (${data.latencyMs}ms)`,
          "success"
        );
      } else {
        showToast(
          data.message || data.error || `Configuration incomplete for ${platformKey}`,
          "warning"
        );
      }
    } catch {
      showToast("Network error testing integration", "error");
    } finally {
      setTestingPlatform(null);
    }
  };

  const categories = [
    "All",
    "Social & Professional",
    "Video & Streaming",
    "Messaging & Community",
    "Decentralized & Publishing",
  ];

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.api.toLowerCase().includes(q) ||
      item.envKeys.some((k: string) => k.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>20 Certified Platform Integrations • Real OAuth 2.0 PKCE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Provider Integrations &amp; OAuth Health
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time verification of external developer credentials, cryptographic token storage, and authorized API scopes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIntegrations}
            isLoading={loading}
            className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Health</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Supported Platforms</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {summary.total} Networks
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Official API provider connectors</span>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ready / Configured</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {summary.configured} Live
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Credentials loaded in environment</span>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configuration Pending</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {summary.pending} Available
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Add keys to .env to activate</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider, API or env key..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      </div>

      {/* Provider Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIntegrations.map((item) => {
          const test = testResults[item.key];
          const isTesting = testingPlatform === item.key;

          return (
            <div
              key={item.key}
              className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm overflow-hidden"
            >
              {/* Brand Top Highlight Accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                style={{
                  backgroundColor: item.brandColor || "#6366F1",
                  opacity: item.isConfigured ? 1 : 0.4,
                }}
              />

              <div className="space-y-4">
                {/* Header: Icon, Name, API Version, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                      <SocialPlatformIcon platform={item.key} size="md" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </h2>
                        {item.isConfigured ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live & Ready" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400" title="Setup Required" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                        {item.api}
                      </span>
                    </div>
                  </div>

                  <Badge
                    className={`text-[10px] font-bold px-2 py-0.5 ${
                      item.isConfigured
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                    }`}
                  >
                    {item.isConfigured ? "READY" : "CONFIGURATION REQUIRED"}
                  </Badge>
                </div>

                {/* Required Environment Variables with Real Status */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Required Environment Variables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.envStatus.map((env: any) => (
                      <span
                        key={env.key}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium border ${
                          env.configured
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {env.configured ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{env.key}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scopes Section */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Official Authorized OAuth Scopes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.scopes.map((s: string) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-mono border border-indigo-200/50 dark:border-indigo-900/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inline Test Results if available */}
                {test && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs ${
                      test.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-0.5">
                      <span>{test.success ? "Verification Passed" : "Check Failed"}</span>
                      {test.latencyMs !== undefined && (
                        <span className="font-mono">{test.latencyMs}ms</span>
                      )}
                    </div>
                    <p className="text-[11px] leading-tight">{test.message || test.error}</p>
                  </div>
                )}
              </div>

              {/* Card Footer: Security Badge, Docs Link, Test Connection */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>AES-256-GCM Guarded</span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={item.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>Developer Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(item.key)}
                    isLoading={isTesting}
                    className="rounded-xl text-[11px] font-bold h-7 px-3 gap-1 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Test Connection</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
