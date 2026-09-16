'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function DomainsManagementPage() {
  const { showToast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    domain: '',
    registrar: 'Cloudflare',
    dnsProvider: 'Cloudflare DNS',
    sslStatus: 'ACTIVE',
  });

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/domains');
      if (res.ok) {
        const json = await res.json();
        setDomains(json.domains || []);
      }
    } catch {
      showToast('Failed to load domains from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('Domain registered and verified successfully!', 'success');
        setIsAddModalOpen(false);
        setForm({
          domain: '',
          registrar: 'Cloudflare',
          dnsProvider: 'Cloudflare DNS',
          sslStatus: 'ACTIVE',
        });
        fetchDomains();
      } else {
        showToast(json.error || 'Failed to add domain', 'error');
      }
    } catch {
      showToast('Network error adding domain', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDomain = async (permanent: boolean) => {
    if (!domainToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/domains?id=${domainToDelete.id}&permanent=${permanent}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Domain removed', 'success');
        setDomainToDelete(null);
        fetchDomains();
      } else {
        showToast(json.error || 'Failed to delete domain', 'error');
      }
    } catch {
      showToast('Network error deleting domain', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDomains = domains.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.domain.toLowerCase().includes(q) || d.registrar?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/websites" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Websites
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Domain Names & Renewal Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage company-owned apex domains, SSL renewal reminders, and registrar integrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDomains}
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
            <span>Add Domain</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter domains by name or registrar..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <Badge variant="outline" className="text-[10px] font-mono">
          {filteredDomains.length} Domains
        </Badge>
      </div>

      {/* Domains Table / Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
            ))}
          </div>
        ) : filteredDomains.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
            <Globe className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No domains registered yet</p>
          </Card>
        ) : (
          filteredDomains.map((domain) => (
            <Card
              key={domain.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {domain.domain}
                  </span>
                  <Badge variant="success" className="text-[9px] uppercase font-bold">
                    Verified
                  </Badge>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 text-xs">
                    Registrar: <b>{domain.registrar || 'Direct'}</b>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> SSL Active
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    Renews: {domain.expiryDate ? new Date(domain.expiryDate).toLocaleDateString() : 'Auto-Renew'}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    {domain._count?.dnsRecords || 2} DNS Records
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link href={`/admin/websites/dns?domainId=${domain.id}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl">
                    Manage DNS
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDomainToDelete(domain)}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title="Register Company Domain"
        description="Connect a domain name to track registrar expiration, DNS records, and SSL health."
        maxWidth="md"
      >
        <form onSubmit={handleAddDomain} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Apex Domain Name *
            </label>
            <input
              type="text"
              required
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="e.g. socialflow.io"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registrar Provider
            </label>
            <input
              type="text"
              value={form.registrar}
              onChange={(e) => setForm({ ...form, registrar: e.target.value })}
              placeholder="Cloudflare, Namecheap, GoDaddy, Route 53"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
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
              Register Domain
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Domain Confirmation Modal */}
      <Modal
        isOpen={Boolean(domainToDelete)}
        onClose={() => !isProcessing && setDomainToDelete(null)}
        title="Delete Domain Name?"
        description="Choose whether to archive this domain or permanently purge it from the database."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm deletion for: <b>&quot;{domainToDelete?.domain}&quot;</b>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Move to Archive
              </span>
              <p className="text-[11px] text-slate-500">
                Recoverable at any time from Central Trash.
              </p>
              <Button
                variant="outline"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleDeleteDomain(false)}
                className="w-full text-xs font-semibold rounded-lg"
              >
                Archive Domain
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Real Delete (Permanent)
              </span>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                Permanently purge domain and all associated DNS records.
              </p>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleDeleteDomain(true)}
                className="w-full text-xs font-bold rounded-lg"
              >
                Delete Forever
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setDomainToDelete(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
