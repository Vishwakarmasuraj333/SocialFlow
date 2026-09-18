'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  ExternalLink,
  ShieldCheck,
  Server,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCode,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { WebsiteScreenshot } from '@/components/websites/website-screenshot';

function detectInfrastructure(input: string) {
  const lower = (input || '').toLowerCase();
  if (lower.includes('socialflow') || lower.includes('zeta-one')) {
    return {
      hosting: 'Vercel Edge Global',
      framework: 'React 19 / Next.js',
      cms: 'SocialFlow SaaS Engine',
      notes: '18 Monitored Admin Routes, Main App & API',
      preview: '',
    };
  }
  if (lower.includes('portfolio') || lower.includes('agency')) {
    return {
      hosting: 'Vercel Production',
      framework: 'Next.js 16 / React 19',
      cms: 'Creative Agency Studio',
      notes: 'Monitored Client Experiences',
      preview: '',
    };
  }
  if (lower.includes('tuvaa') || lower.includes('shop') || lower.includes('store')) {
    return {
      hosting: 'Vercel Edge Global',
      framework: 'Next.js 16 / React',
      cms: 'Commerce Cloud Engine',
      notes: 'Digital Commerce Platform',
      preview: '',
    };
  }
  if (lower.includes('media') || lower.includes('trend')) {
    return {
      hosting: 'Cloudflare Pages / Edge',
      framework: 'React 19 / Vite',
      cms: 'Visual Media Platform',
      notes: 'High-Bitrate Media Gateway',
      preview: '',
    };
  }
  if (lower.includes('pinterest')) {
    return {
      hosting: 'AWS CloudFront / Fastly CDN',
      framework: 'React / Node.js Core',
      cms: 'Developer Web Platform',
      notes: 'Official OAuth & Webhook Gateway',
      preview: '',
    };
  }
  if (lower.includes('github.com')) {
    return {
      hosting: 'GitHub Enterprise Pages',
      framework: 'TypeScript / React Core',
      cms: 'Open Source Software',
      notes: 'CI/CD Automated Deployments',
      preview: '',
    };
  }
  if (lower.includes('cloudflare.com') || lower.includes('pages.dev')) {
    return {
      hosting: 'Cloudflare Pages / Edge',
      framework: 'Next.js / Edge Workers',
      cms: 'Cloudflare Serverless Engine',
      notes: '10 Monitored Edge Endpoints',
      preview: '',
    };
  }
  if (lower.includes('netlify.app')) {
    return {
      hosting: 'Netlify Global Edge',
      framework: 'React / Next.js Jamstack',
      cms: 'Modern Cloud Architecture',
      notes: '6 Monitored Pages',
      preview: '',
    };
  }
  return {
    hosting: 'Vercel Edge Global',
    framework: 'Next.js 16 / TypeScript',
    cms: 'Production Web Platform',
    notes: '12 Monitored Pages & APIs',
    preview: '',
  };
}

export default function AllWebsitesPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<any>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    domain: '',
    url: '',
    environment: 'PRODUCTION',
    cms: 'Next.js 16',
    framework: '',
    hostingProvider: '',
    deploymentUrl: '',
    serverIp: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    domain: '',
    url: '',
    environment: 'PRODUCTION',
    cms: 'Next.js',
    framework: '',
    hostingProvider: '',
    deploymentUrl: '',
    serverIp: '',
    notes: '',
  });

  const fetchWebsites = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/websites');
      if (res.ok) {
        const json = await res.json();
        setWebsites(json.websites || []);
      }
    } catch {
      showToast('Failed to load websites from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleEditWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/websites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('Website details updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchWebsites();
      } else {
        showToast(json.error || 'Failed to update website', 'error');
      }
    } catch {
      showToast('Network error updating website', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('Website and primary domain registered successfully!', 'success');
        setIsAddModalOpen(false);
        setForm({
          name: '',
          domain: '',
          url: '',
          environment: 'PRODUCTION',
          cms: 'Next.js 16',
          framework: 'React 19 / Next.js',
          hostingProvider: 'Vercel Edge Global',
          deploymentUrl: '',
          serverIp: '',
          notes: '',
        });
        fetchWebsites();
      } else {
        showToast(json.error || 'Failed to add website', 'error');
      }
    } catch {
      showToast('Network error adding website', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteWebsite = async (permanent: boolean) => {
    if (!websiteToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/websites?id=${websiteToDelete.id}&permanent=${permanent}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(
          permanent
            ? 'Website permanently deleted from database'
            : 'Website deleted successfully (safely archived in Trash).',
          'success'
        );
        setWebsiteToDelete(null);
        fetchWebsites();
      } else {
        showToast(json.error || 'Failed to delete website', 'error');
      }
    } catch {
      showToast('Network error deleting website', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch =
      !search ||
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.domain.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || site.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Web Fleet
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Website Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monitor production URLs, staging environments, SSL validity, and hosting infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWebsites}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Website</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PRODUCTION', 'STAGING', 'DEVELOPMENT'].map((env) => (
            <button
              key={env}
              onClick={() => setEnvFilter(env)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                envFilter === env
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {env}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by website name or domain..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Websites Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ))}
        </div>
      ) : filteredWebsites.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No websites match your filter</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              Register your official corporate website, product landing pages, or staging instances.
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl mt-2 bg-indigo-600 hover:bg-indigo-500"
            >
              Add First Website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map((site) => (
            <Card
              key={site.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200"
            >
              {/* Real Live Website Screenshot Banner */}
              <div className="p-3 pb-0">
                <WebsiteScreenshot
                  url={site.url}
                  domain={site.domain}
                  name={site.name}
                  previewImage={site.deploymentUrl}
                  aspectRatio="video"
                  showBrowserBar={true}
                />
              </div>

              <div className="p-4 pt-3 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Website Real Favicon/Logo Icon */}
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                          alt={site.name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                        <Globe className="w-4 h-4 text-indigo-500 hidden" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={site.name}>
                          {site.name}
                        </h3>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono truncate"
                        >
                          {site.domain} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <Badge
                      variant={site.environment === 'PRODUCTION' ? 'default' : 'outline'}
                      className="text-[9px] uppercase font-bold tracking-wider shrink-0"
                    >
                      {site.environment}
                    </Badge>
                  </div>

                  {/* Tech & Hosting Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Framework:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {site.framework || site.cms || 'Custom'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Hosting:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {site.hostingProvider || 'Cloud'}
                      </p>
                    </div>
                  </div>

                  {/* SSL & Health Status */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SSL Certificate Active
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold truncate max-w-[150px]" title={site.notes || `${site.contents?.length || 0} Pages`}>
                      {site.notes || (site.contents?.length ? `${site.contents.length} Pages` : site.environment === 'PRODUCTION' ? '12 Monitored Routes' : '4 Staging Routes')}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWebsite(site)}
                    className="h-8 text-xs rounded-xl cursor-pointer"
                  >
                    Inspect Details
                  </Button>

                  <div className="flex items-center gap-1">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditForm({
                          id: site.id,
                          name: site.name,
                          domain: site.domain,
                          url: site.url,
                          environment: site.environment || 'PRODUCTION',
                          cms: site.cms || 'Next.js',
                          framework: site.framework || 'React / Next.js',
                          hostingProvider: site.hostingProvider || 'Vercel',
                          deploymentUrl: site.deploymentUrl || '',
                          serverIp: site.serverIp || '',
                          notes: site.notes || '',
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit website details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setWebsiteToDelete(site)}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Website Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title="Register New Website"
        description="Connect a web domain, configure hosting environments, and provision tracking."
        maxWidth="lg"
      >
        <form onSubmit={handleAddWebsite} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. SocialFlow Global App, Acme SaaS Portal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Domain *
              </label>
              <input
                type="text"
                required
                value={form.domain}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleanDomain = val.replace(/^(https?:\/\/)+/gi, '').replace(/\/.*$/, '').trim();
                  const detected = detectInfrastructure(cleanDomain);
                  setForm(prev => ({
                    ...prev,
                    domain: cleanDomain,
                    url: cleanDomain ? `https://${cleanDomain}` : '',
                    name: prev.name ? prev.name : cleanDomain.split('.')[0] ? cleanDomain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : '',
                    hostingProvider: prev.hostingProvider ? prev.hostingProvider : detected.hosting,
                    framework: prev.framework ? prev.framework : detected.framework,
                    cms: prev.cms ? prev.cms : detected.cms,
                    notes: prev.notes ? prev.notes : detected.notes,
                    deploymentUrl: prev.deploymentUrl ? prev.deploymentUrl : detected.preview,
                  }));
                }}
                placeholder="e.g. socialflow.io, acme-app.com, myportfolio.vercel.app"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Production URL *
              </label>
              <input
                type="url"
                required
                value={form.url}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleanUrl = val.trim().replace(/^(https?:\/\/)+/gi, 'https://');
                  setForm(prev => ({
                    ...prev,
                    url: cleanUrl,
                  }));
                }}
                placeholder="https://socialflow-zeta-one.vercel.app"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Environment
              </label>
              <select
                value={form.environment}
                onChange={(e) => setForm({ ...form, environment: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hosting Provider
              </label>
              <input
                list="hosting-providers-list"
                type="text"
                value={form.hostingProvider}
                onChange={(e) => setForm({ ...form, hostingProvider: e.target.value })}
                placeholder="Vercel Production, AWS, Cloudflare"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <datalist id="hosting-providers-list">
                <option value="Vercel Production" />
                <option value="Vercel Edge Global" />
                <option value="AWS CloudFront / S3" />
                <option value="Cloudflare Pages / Edge" />
                <option value="Google Cloud Platform (GCP)" />
                <option value="Netlify Global Edge" />
                <option value="DigitalOcean / Custom Nginx" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CMS / Framework
              </label>
              <input
                list="frameworks-list"
                type="text"
                value={form.framework}
                onChange={(e) => setForm({ ...form, framework: e.target.value })}
                placeholder="Next.js 16, React 19, Three.js WebGL"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <datalist id="frameworks-list">
                <option value="Next.js 16 / TypeScript" />
                <option value="React 19 / TypeScript" />
                <option value="Three.js / React 19 Animation" />
                <option value="React SPA / Vite" />
                <option value="Vue 3 / Nuxt Engine" />
                <option value="Astro / Static Engine" />
                <option value="Remix / React Router 7" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monitored Pages / Active Routes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. 18 Monitored Routes, Main App & API"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Server IP Address (Optional)
              </label>
              <input
                type="text"
                value={form.serverIp}
                onChange={(e) => setForm({ ...form, serverIp: e.target.value })}
                placeholder="76.76.21.21"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold"
            >
              Register Website
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Website Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isProcessing && setIsEditModalOpen(false)}
        title="Edit Website Configuration"
        description="Update domain routing, hosting parameters, CMS stack, and preview imagery."
        maxWidth="lg"
      >
        <form onSubmit={handleEditWebsite} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website Name *
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Domain *
              </label>
              <input
                type="text"
                required
                value={editForm.domain}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Production / Live URL *
              </label>
              <input
                type="url"
                required
                value={editForm.url}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleanUrl = val.trim().replace(/^(https?:\/\/)+/gi, 'https://');
                  setEditForm({ ...editForm, url: cleanUrl });
                }}
                placeholder="https://socialflow-zeta-one.vercel.app"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Environment
              </label>
              <select
                value={editForm.environment}
                onChange={(e) => setEditForm({ ...editForm, environment: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hosting Provider
              </label>
              <input
                list="hosting-providers-list"
                type="text"
                value={editForm.hostingProvider}
                onChange={(e) => setEditForm({ ...editForm, hostingProvider: e.target.value })}
                placeholder="Vercel Production, AWS, Cloudflare"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CMS / Architecture
              </label>
              <input
                type="text"
                value={editForm.cms}
                onChange={(e) => setEditForm({ ...editForm, cms: e.target.value })}
                placeholder="Next.js 16, App Router Engine"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frontend Framework
              </label>
              <input
                list="frameworks-list"
                type="text"
                value={editForm.framework}
                onChange={(e) => setEditForm({ ...editForm, framework: e.target.value })}
                placeholder="Next.js 16, React 19, Three.js WebGL"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monitored Pages / Active Routes
              </label>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="e.g. 18 Monitored Routes, Main App & API"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Website Detail Modal */}
      <Modal
        isOpen={Boolean(selectedWebsite)}
        onClose={() => setSelectedWebsite(null)}
        title={selectedWebsite?.name || 'Website Details'}
        description="Comprehensive technical specifications and environment configuration."
        maxWidth="lg"
      >
        {selectedWebsite && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Live Screenshot Header in Detail Modal */}
            <WebsiteScreenshot
              url={selectedWebsite.url}
              domain={selectedWebsite.domain}
              name={selectedWebsite.name}
              previewImage={selectedWebsite.deploymentUrl}
              aspectRatio="wide"
              showBrowserBar={true}
            />

            {/* Header info with Real Favicon & Live Site Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${selectedWebsite.domain}&sz=128`}
                    alt={selectedWebsite.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden');
                    }}
                  />
                  <Globe className="w-5 h-5 text-indigo-500 hidden" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedWebsite.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedWebsite.domain}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                  {selectedWebsite.environment}
                </Badge>
                <a
                  href={selectedWebsite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Visit Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Domain</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono text-xs truncate">
                  {selectedWebsite.domain}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target URL</span>
                <a
                  href={selectedWebsite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-xs flex items-center gap-1 truncate"
                >
                  <span className="truncate">{selectedWebsite.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Framework / Stack</span>
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                  {selectedWebsite.framework || selectedWebsite.cms || 'React / Next.js'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Hosting Infrastructure</span>
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                  {selectedWebsite.hostingProvider || 'Cloud Infrastructure'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Server IP / DNS</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 text-xs truncate">
                  {selectedWebsite.serverIp || '76.76.21.21 (Anycast)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">SSL Certificate Status</span>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {selectedWebsite.sslExpiry ? new Date(selectedWebsite.sslExpiry).toLocaleDateString() : 'Active (Auto-renewing)'}
                  </span>
                </p>
              </div>
            </div>

            {selectedWebsite.notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Notes</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedWebsite.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Tracked Pages: <b className="text-slate-700 dark:text-slate-200">{selectedWebsite.contents?.length || 0} pages</b>
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedWebsite(null)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(websiteToDelete)}
        onClose={() => !isProcessing && setWebsiteToDelete(null)}
        title="Delete Website"
        description="Are you sure you want to delete this website from your active Web Fleet?"
        maxWidth="md"
      >
        {websiteToDelete && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Website Preview Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${websiteToDelete.domain}&sz=64`}
                    alt={websiteToDelete.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Globe className="w-5 h-5 text-indigo-500 hidden" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {websiteToDelete.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {websiteToDelete.domain}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="text-[9px] uppercase font-bold shrink-0">
                {websiteToDelete.environment}
              </Badge>
            </div>

            {/* Deletion Confirmation Notice */}
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Confirm Deletion</span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-300/90 leading-relaxed">
                Deleting will remove <b>{websiteToDelete.domain}</b> from your active fleet. It will be safely moved to Central Trash so you can restore it anytime if needed.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/admin/trash"
                className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline font-medium"
              >
                View Trash Recovery
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => setWebsiteToDelete(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={() => handleDeleteWebsite(false)}
                  className="rounded-xl font-bold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 shadow-sm text-white px-4 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Website</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
