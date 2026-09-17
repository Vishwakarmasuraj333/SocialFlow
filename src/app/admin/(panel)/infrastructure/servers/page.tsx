'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Server,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function ServersManagementPage() {
  const { showToast } = useToast();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    type: 'CLOUD_SERVER',
    provider: 'AWS EC2',
    environment: 'PRODUCTION',
    region: 'us-east-1 (N. Virginia)',
    publicIp: '',
    privateIp: '',
    status: 'RUNNING',
    os: 'Ubuntu 24.04 LTS',
    cpu: '4 vCPU',
    ram: '16 GB RAM',
    storage: '160 GB NVMe SSD',
    notes: '',
  });

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/infrastructure');
      if (res.ok) {
        const json = await res.json();
        setAssets(json.assets || []);
      }
    } catch {
      showToast('Failed to load infrastructure assets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const method = editingAsset ? 'PATCH' : 'POST';
      const body = {
        ...(editingAsset ? { id: editingAsset.id } : {}),
        name: form.name,
        type: form.type,
        provider: form.provider,
        environment: form.environment,
        region: form.region,
        publicIp: form.publicIp,
        privateIp: form.privateIp,
        status: form.status,
        os: form.os,
        resourcesJson: JSON.stringify({ cpu: form.cpu, ram: form.ram, storage: form.storage }),
        notes: form.notes,
      };

      const res = await fetch('/api/admin/infrastructure', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(editingAsset ? 'Infrastructure asset updated!' : 'New server provisioned and tracked!', 'success');
        setIsAddModalOpen(false);
        setEditingAsset(null);
        fetchAssets();
      } else {
        showToast(json.error || 'Failed to save asset', 'error');
      }
    } catch {
      showToast('Network error saving asset', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/infrastructure?id=${assetToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast('Infrastructure asset permanently deleted', 'success');
        setAssetToDelete(null);
        fetchAssets();
      } else {
        showToast(json.error || 'Failed to delete asset', 'error');
      }
    } catch {
      showToast('Network error deleting asset', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEdit = (asset: any) => {
    setEditingAsset(asset);
    let parsedSpecs: any = {};
    try {
      if (asset.resourcesJson) parsedSpecs = JSON.parse(asset.resourcesJson);
    } catch {}
    setForm({
      name: asset.name,
      type: asset.type,
      provider: asset.provider,
      environment: asset.environment,
      region: asset.region || '',
      publicIp: asset.publicIp || '',
      privateIp: asset.privateIp || '',
      status: asset.status,
      os: asset.os || '',
      cpu: parsedSpecs.cpu || '4 vCPU',
      ram: parsedSpecs.ram || '16 GB RAM',
      storage: parsedSpecs.storage || '160 GB SSD',
      notes: asset.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const filteredAssets = assets.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.provider.toLowerCase().includes(q) ||
      a.publicIp?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Cloud Infrastructure
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Servers & VPS Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage company-owned virtual private servers, cloud instances, and dedicated server compute.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssets}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingAsset(null);
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Provision Server</span>
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter servers by name, provider, or IP address..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <Badge variant="outline" className="text-[10px] font-mono">
          {filteredAssets.length} Assets
        </Badge>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
          <Server className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No servers or infrastructure assets registered yet</p>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl mt-3 bg-indigo-600 hover:bg-indigo-500"
          >
            Provision First Server
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            let specs: any = {};
            try {
              if (asset.resourcesJson) specs = JSON.parse(asset.resourcesJson);
            } catch {}

            return (
              <Card
                key={asset.id}
                className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {asset.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-mono">
                        {asset.provider} • {asset.region || 'Default Region'}
                      </p>
                    </div>

                    <Badge
                      variant={asset.status === 'RUNNING' ? 'success' : 'outline'}
                      className="text-[9px] uppercase font-bold tracking-wider shrink-0"
                    >
                      {asset.status}
                    </Badge>
                  </div>

                  {/* IP & OS specs */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Public IP:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{asset.publicIp || 'Dynamic'}</span>
                    </div>
                    {asset.privateIp && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>VPC IP:</span>
                        <span>{asset.privateIp}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>OS:</span>
                      <span>{asset.os || 'Linux'}</span>
                    </div>
                  </div>

                  {/* Hardware Specs Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {specs.cpu || '4 vCPU'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {specs.ram || '16 GB'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {specs.storage || '160 GB SSD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {asset.environment}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(asset)}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAssetToDelete(asset)}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provision Server Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title={editingAsset ? 'Edit Server Configuration' : 'Provision Infrastructure Server'}
        description="Configure compute specifications, cloud provider, and network endpoints."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAsset} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. prod-api-cluster-01"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asset Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="CLOUD_SERVER">Cloud Instance (EC2/GCE)</option>
                <option value="VPS">VPS (DigitalOcean/Linode)</option>
                <option value="DEDICATED_SERVER">Dedicated Bare Metal</option>
                <option value="CONTAINER">Container Service (ECS/K8s)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cloud Provider
              </label>
              <input
                type="text"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="AWS, Google Cloud, DigitalOcean, Hetzner"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Region / Data Center
              </label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="us-east-1, eu-central-1"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Public IPv4 Address
              </label>
              <input
                type="text"
                value={form.publicIp}
                onChange={(e) => setForm({ ...form, publicIp: e.target.value })}
                placeholder="34.201.89.44"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Private VPC IPv4 Address
              </label>
              <input
                type="text"
                value={form.privateIp}
                onChange={(e) => setForm({ ...form, privateIp: e.target.value })}
                placeholder="10.0.4.12"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating System
              </label>
              <input
                type="text"
                value={form.os}
                onChange={(e) => setForm({ ...form, os: e.target.value })}
                placeholder="Ubuntu 24.04 LTS, Debian 12, Alpine"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compute Specs (vCPU / RAM / Disk)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={form.cpu}
                  onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                  placeholder="4 vCPU"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center"
                />
                <input
                  type="text"
                  value={form.ram}
                  onChange={(e) => setForm({ ...form, ram: e.target.value })}
                  placeholder="16 GB"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center"
                />
                <input
                  type="text"
                  value={form.storage}
                  onChange={(e) => setForm({ ...form, storage: e.target.value })}
                  placeholder="160 GB"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center"
                />
              </div>
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
              {editingAsset ? 'Update Configuration' : 'Provision Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Asset Modal */}
      <Modal
        isOpen={Boolean(assetToDelete)}
        onClose={() => !isProcessing && setAssetToDelete(null)}
        title="Delete Infrastructure Asset?"
        description="Confirm permanent deletion of this server from infrastructure records."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm permanent purge for: <b>&quot;{assetToDelete?.name}&quot;</b> ({assetToDelete?.provider}).
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setAssetToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleDeleteAsset}
              className="rounded-xl font-medium"
            >
              Delete Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
