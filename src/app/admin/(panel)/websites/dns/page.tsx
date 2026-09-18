'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Shield,
  Layers,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

function DnsContent() {
  const searchParams = useSearchParams();
  const initialDomainId = searchParams.get('domainId') || '';

  const { showToast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState(initialDomainId);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    type: 'A',
    name: '@',
    content: '',
    ttl: 3600,
    priority: '',
    proxied: true,
  });

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/admin/domains');
      if (res.ok) {
        const json = await res.json();
        const domainList = json.domains || [];
        setDomains(domainList);
        if (domainList.length > 0) {
          const currentValid = domainList.some((d: any) => d.id === selectedDomainId);
          const targetId = currentValid ? selectedDomainId : (initialDomainId || domainList[0].id);
          setSelectedDomainId(targetId);
          fetchRecords(targetId);
        } else {
          setIsLoading(false);
        }
      }
    } catch {
      setIsLoading(false);
    }
  };

  const fetchRecords = async (domainId?: string) => {
    const idToFetch = domainId || selectedDomainId;
    if (!idToFetch) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/dns?domainId=${idToFetch}`);
      if (res.ok) {
        const json = await res.json();
        setRecords(json.records || []);
      }
    } catch {
      showToast('Failed to load DNS records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    if (selectedDomainId) {
      fetchRecords(selectedDomainId);
    }
  }, [selectedDomainId]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomainId) {
      showToast('Select a domain first', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const method = editingRecord ? 'PATCH' : 'POST';
      const body = editingRecord
        ? { id: editingRecord.id, ...form }
        : { domainId: selectedDomainId, ...form };

      const res = await fetch('/api/admin/dns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(editingRecord ? 'DNS record updated!' : 'DNS record published live!', 'success');
        setIsAddModalOpen(false);
        setEditingRecord(null);
        setForm({
          type: 'A',
          name: '@',
          content: '',
          ttl: 3600,
          priority: '',
          proxied: true,
        });
        fetchRecords();
      } else {
        showToast(json.error || 'Failed to save DNS record', 'error');
      }
    } catch {
      showToast('Network error saving DNS record', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/dns?id=${recordToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast('DNS record permanently deleted from zones', 'success');
        setRecordToDelete(null);
        fetchRecords();
      } else {
        showToast(json.error || 'Failed to delete DNS record', 'error');
      }
    } catch {
      showToast('Network error deleting record', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEdit = (rec: any) => {
    setEditingRecord(rec);
    setForm({
      type: rec.type,
      name: rec.name,
      content: rec.content,
      ttl: rec.ttl,
      priority: rec.priority !== null ? String(rec.priority) : '',
      proxied: rec.proxied,
    });
    setIsAddModalOpen(true);
  };

  const activeDomain = domains.find((d) => d.id === selectedDomainId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/websites/domains" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Domains
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            DNS Zone Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure A, AAAA, CNAME, MX, TXT, and NS records with instant validation and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRecords()}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setForm({
                type: 'A',
                name: '@',
                content: '',
                ttl: 3600,
                priority: '',
                proxied: true,
              });
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Record</span>
          </Button>
        </div>
      </div>

      {/* Domain Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Zone:</span>
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.domain}
              </option>
            ))}
          </select>
        </div>

        {activeDomain && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>DNS Provider: <b>{activeDomain.dnsProvider || 'Cloudflare'}</b></span>
            <span>•</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {records.length} Records
            </Badge>
          </div>
        )}
      </div>

      {/* Records Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <Globe className="h-8 w-8 text-slate-400 mx-auto" />
            <p>No DNS records found for this domain zone</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Content / Value</th>
                  <th className="py-3 px-4">TTL</th>
                  <th className="py-3 px-4">Proxy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {rec.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {rec.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {rec.content}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {rec.ttl === 1 ? 'Auto' : `${rec.ttl}s`}
                    </td>
                    <td className="py-3 px-4">
                      {rec.proxied ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          Proxied
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">DNS Only</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(rec)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRecordToDelete(rec)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit DNS Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title={editingRecord ? 'Edit DNS Record' : 'Add New DNS Record'}
        description="Configure DNS routing for apex domain, subdomains, or mail servers."
        maxWidth="md"
      >
        <form onSubmit={handleSaveRecord} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Record Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="A">A (IPv4 Address)</option>
                <option value="AAAA">AAAA (IPv6 Address)</option>
                <option value="CNAME">CNAME (Alias)</option>
                <option value="MX">MX (Mail Server)</option>
                <option value="TXT">TXT (Verification/SPF)</option>
                <option value="NS">NS (Nameserver)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Record Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="@ or www or mail"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Content / Value *
            </label>
            <input
              type="text"
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={form.type === 'A' ? '76.76.21.21' : form.type === 'CNAME' ? 'cname.vercel-dns.com' : 'Target value'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                TTL (Seconds)
              </label>
              <select
                value={form.ttl}
                onChange={(e) => setForm({ ...form, ttl: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value={1}>Auto</option>
                <option value={300}>300 (5 mins)</option>
                <option value={3600}>3600 (1 hour)</option>
                <option value={86400}>86400 (1 day)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.proxied}
                  onChange={(e) => setForm({ ...form, proxied: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Cloudflare Proxy</span>
              </label>
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
              {editingRecord ? 'Save Changes' : 'Publish DNS Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={Boolean(recordToDelete)}
        onClose={() => !isProcessing && setRecordToDelete(null)}
        title="Remove DNS Record"
        description="Are you sure you want to remove this record from the active zone?"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          {/* Record Details Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Record Type</span>
              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                {recordToDelete?.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Host / Name</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {recordToDelete?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Value</span>
              <span className="font-mono text-slate-600 dark:text-slate-400 truncate max-w-[240px]">
                {recordToDelete?.content}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <p className="text-[11px] leading-relaxed">
              Traffic routed through this DNS record will immediately cease resolving across public nameservers upon removal.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setRecordToDelete(null)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleDeleteRecord}
              className="rounded-xl text-xs font-bold shadow-sm"
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DnsManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading DNS Zones...</div>}>
      <DnsContent />
    </Suspense>
  );
}
