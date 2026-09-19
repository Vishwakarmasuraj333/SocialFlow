'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  Globe,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Layers,
  ChevronRight,
  Search,
  Image as ImageIcon,
} from 'lucide-react';

interface TrashedItem {
  id: string;
  category: 'websites' | 'domains' | 'locations' | 'posts' | 'media';
  title: string;
  subtitle?: string;
  trashedAt?: string;
  originalData: any;
}

export default function AdminTrashPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'websites' | 'domains' | 'locations' | 'posts' | 'media'>('all');
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trash');
      const data = await res.json();
      if (res.ok) {
        const transformed: TrashedItem[] = [
          ...(data.websites || []).map((w: any) => ({
            id: w.id,
            category: 'websites' as const,
            title: w.name,
            subtitle: w.domain || w.url,
            trashedAt: w.updatedAt,
            originalData: w,
          })),
          ...(data.domains || []).map((d: any) => ({
            id: d.id,
            category: 'domains' as const,
            title: d.domain,
            subtitle: `Registrar: ${d.registrar || 'Default'} | SSL: ${d.sslStatus || 'N/A'}`,
            trashedAt: d.updatedAt,
            originalData: d,
          })),
          ...(data.locations || []).map((l: any) => ({
            id: l.id,
            category: 'locations' as const,
            title: l.name,
            subtitle: `${l.type} - ${l.city || ''} ${l.country || ''}`,
            trashedAt: l.updatedAt,
            originalData: l,
          })),
          ...(data.posts || []).map((p: any) => ({
            id: p.id,
            category: 'posts' as const,
            title: p.title || (p.globalContent?.slice(0, 50) + '...') || 'Untitled Post',
            subtitle: `Author: ${p.author?.name || 'Admin'} | Targets: ${p.targets?.length || 0}`,
            trashedAt: p.deletedAt || p.updatedAt,
            originalData: p,
          })),
          ...(data.media || []).map((m: any) => ({
            id: m.id,
            category: 'media' as const,
            title: m.originalName,
            subtitle: `Folder: ${m.folder} • Type: ${m.resourceType || 'image'} • Size: ${Math.round((m.sizeBytes || 0) / 1024)} KB`,
            trashedAt: m.deletedAt || m.updatedAt,
            originalData: m,
          })),
        ];
        setItems(transformed);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load trash items' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error loading trash' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleSelectAll = () => {
    const visible = filteredItems.map((i) => i.id);
    if (selectedIds.length === visible.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visible);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRestore = async (item: TrashedItem) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: item.category,
          action: 'RESTORE',
          id: item.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Restored successfully' });
        setSelectedIds((prev) => prev.filter((i) => i !== item.id));
        fetchTrash();
      } else {
        setMessage({ type: 'error', text: data.error || 'Restore failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handlePermanentDelete = (item: TrashedItem) => {
    setConfirmModal({
      isOpen: true,
      title: `Permanently Delete "${item.title}"?`,
      description:
        'This operation is irreversible. All related records and historical traces will be permanently erased from the database.',
      action: async () => {
        setProcessing(true);
        try {
          const res = await fetch('/api/admin/trash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: item.category,
              action: 'PERMANENT_DELETE',
              id: item.id,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ type: 'success', text: data.message || 'Permanently deleted' });
            setSelectedIds((prev) => prev.filter((i) => i !== item.id));
            fetchTrash();
          } else {
            setMessage({ type: 'error', text: data.error || 'Failed to delete' });
          }
        } catch (err: any) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setProcessing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleBulkAction = (action: 'RESTORE' | 'PERMANENT_DELETE') => {
    if (!selectedIds.length) return;

    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    const isDelete = action === 'PERMANENT_DELETE';

    setConfirmModal({
      isOpen: true,
      title: isDelete
        ? `Permanently Delete ${selectedIds.length} Item(s)?`
        : `Restore ${selectedIds.length} Item(s)?`,
      description: isDelete
        ? 'You are about to irreversibly delete all selected items permanently from the database.'
        : 'Selected items will be restored to their active state across their respective modules.',
      action: async () => {
        setProcessing(true);
        try {
          const categories: ('websites' | 'domains' | 'locations' | 'posts' | 'media')[] = [
            'websites',
            'domains',
            'locations',
            'posts',
            'media',
          ];

          for (const cat of categories) {
            const catIds = selectedItems.filter((i) => i.category === cat).map((i) => i.id);
            if (catIds.length > 0) {
              await fetch('/api/admin/trash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  category: cat,
                  action,
                  ids: catIds,
                }),
              });
            }
          }

          setMessage({
            type: 'success',
            text: `${selectedIds.length} item(s) ${isDelete ? 'permanently deleted' : 'restored successfully'}!`,
          });
          setSelectedIds([]);
          fetchTrash();
        } catch (err: any) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setProcessing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleEmptyAllTrash = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Empty Entire Central Trash?',
      description:
        'CRITICAL ACTION: This will PERMANENTLY ERASE all soft-deleted items across the company workspace. This action cannot be undone.',
      action: async () => {
        setProcessing(true);
        try {
          const res = await fetch('/api/admin/trash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'EMPTY_ALL_TRASH' }),
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ type: 'success', text: data.message || 'Trash emptied completely' });
            setSelectedIds([]);
            fetchTrash();
          } else {
            setMessage({ type: 'error', text: data.error || 'Failed to empty trash' });
          }
        } catch (err: any) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setProcessing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'websites':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'domains':
        return <Layers className="w-4 h-4 text-emerald-500" />;
      case 'locations':
        return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'posts':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'media':
        return <ImageIcon className="w-4 h-4 text-pink-500" />;
      default:
        return <Trash2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'websites':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            Website
          </span>
        );
      case 'domains':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Domain
          </span>
        );
      case 'locations':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            Location
          </span>
        );
      case 'posts':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            Post
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20">
            Media Asset
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Central Trash Bin
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Enterprise retention depot. Restore mistakenly deleted assets or permanently purge them from the database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTrash}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
          {items.length > 0 && (
            <button
              onClick={handleEmptyAllTrash}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty All Trash
            </button>
          )}
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border animate-slide-up ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span className="text-xs sm:text-sm font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Items', count: items.length },
              {
                id: 'websites',
                label: 'Websites',
                count: items.filter((i) => i.category === 'websites').length,
              },
              {
                id: 'domains',
                label: 'Domains',
                count: items.filter((i) => i.category === 'domains').length,
              },
              {
                id: 'locations',
                label: 'Locations',
                count: items.filter((i) => i.category === 'locations').length,
              },
              {
                id: 'posts',
                label: 'Posts',
                count: items.filter((i) => i.category === 'posts').length,
              },
              {
                id: 'media',
                label: 'Media Assets',
                count: items.filter((i) => i.category === 'media').length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition"
          />
        </div>
      </div>

      {/* Bulk Action Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-sm animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {selectedIds.length} item(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('RESTORE')}
              disabled={processing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Selected
            </button>
            <button
              onClick={() => handleBulkAction('PERMANENT_DELETE')}
              disabled={processing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Permanently
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Scanning trash repositories...
            </span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-3.5 text-slate-400 dark:text-slate-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Trash is completely clean
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
              No soft-deleted assets match your criteria. When assets, domains, or posts are archived or removed, they stage here safely before permanent database destruction.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredItems.length > 0 &&
                          selectedIds.length === filteredItems.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Asset / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Archived Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={`${item.category}-${item.id}`}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group ${
                          isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                              {getCategoryIcon(item.category)}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md font-mono">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getCategoryBadge(item.category)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {item.trashedAt
                            ? new Date(item.trashedAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestore(item)}
                              disabled={processing}
                              title="Restore asset"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(item)}
                              disabled={processing}
                              title="Delete permanently"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch-Friendly Card View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={`mobile-${item.category}-${item.id}`}
                    className={`p-4 space-y-3 transition ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="mt-1 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                              {getCategoryIcon(item.category)}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {item.title}
                            </span>
                            {getCategoryBadge(item.category)}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>Archived:</span>
                      <span className="font-mono">
                        {item.trashedAt
                          ? new Date(item.trashedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={processing}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        disabled={processing}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.action}
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/20"
              >
                {processing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
