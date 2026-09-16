'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  Globe,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function WebsiteContentPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    type: 'BLOG_POST',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
  });

  const fetchWebsites = async () => {
    try {
      const res = await fetch('/api/admin/websites');
      if (res.ok) {
        const json = await res.json();
        setWebsites(json.websites || []);
        if (json.websites?.length > 0 && !selectedWebsiteId) {
          setSelectedWebsiteId(json.websites[0].id);
        }
      }
    } catch {}
  };

  const fetchContents = async (siteId?: string) => {
    const idToFetch = siteId || selectedWebsiteId;
    setIsLoading(true);
    try {
      const url = idToFetch ? `/api/admin/web-content?websiteId=${idToFetch}` : '/api/admin/web-content';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setContents(json.contents || []);
      }
    } catch {
      showToast('Failed to load website content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      fetchContents(selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsiteId) {
      showToast('Please select a target website first', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const body = editingItem
        ? { id: editingItem.id, ...form }
        : { websiteId: selectedWebsiteId, ...form };

      const res = await fetch('/api/admin/web-content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(editingItem ? 'Content updated successfully!' : 'New content published to CMS!', 'success');
        setIsAddModalOpen(false);
        setEditingItem(null);
        setForm({
          type: 'BLOG_POST',
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          status: 'DRAFT',
          metaTitle: '',
          metaDescription: '',
          canonicalUrl: '',
        });
        fetchContents();
      } else {
        showToast(json.error || 'Failed to save content', 'error');
      }
    } catch {
      showToast('Network error saving web content', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/web-content?id=${itemToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        showToast('Article permanently deleted from CMS', 'success');
        setItemToDelete(null);
        fetchContents();
      } else {
        showToast(json.error || 'Failed to delete content', 'error');
      }
    } catch {
      showToast('Network error deleting content', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      type: item.type,
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt || '',
      status: item.status,
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      canonicalUrl: item.canonicalUrl || '',
    });
    setIsAddModalOpen(true);
  };

  const filtered = contents.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/websites" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Websites
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Website Content & CMS Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Author, schedule, and distribute SEO-optimized blog posts, articles, and landing pages across websites.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContents()}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Article</span>
          </Button>
        </div>
      </div>

      {/* Target Website Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Site:</span>
          <select
            value={selectedWebsiteId}
            onChange={(e) => setSelectedWebsiteId(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.domain})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content by title or slug..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No content published for this website</p>
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl mt-3 bg-indigo-600 hover:bg-indigo-500"
            >
              Draft First Article
            </Button>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.status === 'PUBLISHED' ? 'success' : 'outline'} className="text-[9px] uppercase font-bold">
                    {item.status}
                  </Badge>
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono truncate">
                  Slug: /{item.slug} • Meta Title: {item.metaTitle || item.title}
                </p>
                {item.excerpt && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                    {item.excerpt}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(item)}
                  className="h-8 text-xs rounded-xl"
                >
                  <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setItemToDelete(item)}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Article Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title={editingItem ? 'Edit Article & SEO' : 'Draft New Website Article'}
        description="Publish web content with canonical URLs, meta tags, and structured data."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Article Headline / Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Next-Generation Social Media Architecture for Global Brands"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="next-gen-social-media-architecture"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Publication Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published Live</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Summary / Excerpt
              </label>
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief introductory snippet for search engines..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Article Body Content *
              </label>
              <textarea
                rows={5}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write full markdown or rich content here..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="Under 60 chars for Google SERP"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical URL (Optional)
              </label>
              <input
                type="url"
                value={form.canonicalUrl}
                onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                placeholder="https://socialflow.io/blog/..."
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
              {editingItem ? 'Save Updates' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isProcessing && setItemToDelete(null)}
        title="Delete Content?"
        description="This action will permanently purge this article from the website database."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm permanent deletion for: <b>&quot;{itemToDelete?.title}&quot;</b>.
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setItemToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleDelete}
              className="rounded-xl font-bold"
            >
              Confirm Real Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
