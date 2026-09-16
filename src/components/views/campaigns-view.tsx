'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Share2,
  CheckCircle2,
  Trash2,
  Edit2,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Target,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface CampaignItem {
  id: string;
  name: string;
  objective: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  color: string;
  status: string;
  postsCount: number;
  publishedCount: number;
  scheduledCount: number;
  createdAt: string;
}

export default function CampaignsView() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('ALL');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('AWARENESS');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      showToast('Failed to load campaigns from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setObjective('AWARENESS');
    setBudget('');
    setStartDate('');
    setEndDate('');
    setColor('#6366f1');
    setIsModalOpen(true);
  };

  const openEditModal = (camp: CampaignItem) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setObjective(camp.objective || 'AWARENESS');
    setBudget(camp.budget !== null ? camp.budget.toString() : '');
    setStartDate(camp.startDate ? camp.startDate.split('T')[0] : '');
    setEndDate(camp.endDate ? camp.endDate.split('T')[0] : '');
    setColor(camp.color || '#6366f1');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const method = editingCampaign ? 'PATCH' : 'POST';
      const body = {
        ...(editingCampaign ? { id: editingCampaign.id } : {}),
        name: name.trim(),
        objective,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        color,
      };

      const res = await fetch('/api/campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(
          editingCampaign
            ? 'Campaign updated successfully!'
            : 'New strategic campaign initialized!',
          'success'
        );
        setIsModalOpen(false);
        fetchCampaigns();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save campaign', 'error');
      }
    } catch {
      showToast('Network error saving campaign', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/campaigns?id=${campaignToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Campaign "${campaignToDelete.name}" deleted permanently`, 'success');
        setCampaignToDelete(null);
        fetchCampaigns();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete campaign', 'error');
      }
    } catch {
      showToast('Network error deleting campaign', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesObjective =
      objectiveFilter === 'ALL' || c.objective === objectiveFilter;
    const matchesSearch =
      search === '' || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesObjective && matchesSearch;
  });

  // Aggregated KPIs
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalPosts = campaigns.reduce((acc, c) => acc + (c.postsCount || 0), 0);
  const totalPublished = campaigns.reduce((acc, c) => acc + (c.publishedCount || 0), 0);
  const totalInQueue = campaigns.reduce((acc, c) => acc + (c.scheduledCount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Social Operations
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Marketing Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Group multi-channel posts under structured strategic initiatives, track cumulative reach, and allocate budgets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaigns}
            isLoading={isLoading}
            className="rounded-xl border-slate-200 dark:border-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Campaigns</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {campaigns.length}
          </p>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Allocated Budget</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalBudget.toLocaleString()}
          </p>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Linked Posts</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalPosts}
          </p>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Published / In Queue</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalPublished} <span className="text-xs font-normal text-slate-400">/ {totalInQueue}</span>
          </p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'AWARENESS', 'CONVERSIONS', 'ENGAGEMENT', 'TRAFFIC', 'RETENTION'].map((obj) => (
            <button
              key={obj}
              onClick={() => setObjectiveFilter(obj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                objectiveFilter === obj
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {obj === 'ALL' ? 'All Objectives' : obj}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {campaigns.length === 0 ? 'No active marketing campaigns' : 'No matching campaigns'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {campaigns.length === 0
                ? 'Create strategic initiatives to orchestrate content delivery across all target social networks and track cumulative impact.'
                : 'Try adjusting your objective filter or search terms.'}
            </p>
            {campaigns.length === 0 && (
              <Button size="sm" onClick={openCreateModal} className="rounded-xl mt-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create First Campaign
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((c) => (
            <Card
              key={c.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all hover-lift"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
                      style={{ backgroundColor: c.color || '#6366f1' }}
                    />
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </CardTitle>
                  </div>
                  <Badge variant="default" className="text-[9px] uppercase font-bold tracking-wider shrink-0">
                    {c.objective}
                  </Badge>
                </div>

                {/* KPI metrics bar */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Posts</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono">{c.postsCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Published</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{c.publishedCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Budget</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                      {c.budget ? `$${c.budget.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                {(c.startDate || c.endDate) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Start'}
                      {' → '}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Status & CRUD buttons */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 h-3.5" />
                  {c.scheduledCount > 0 ? `${c.scheduledCount} in queue` : 'Active'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    title="Edit Campaign"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCampaignToDelete(c)}
                    title="Delete Campaign"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingCampaign ? 'Edit Marketing Campaign' : 'Initialize New Campaign'}
        description="Define structured goals, budgets, and lifecycle parameters."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Global Growth Sprint"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Strategic Objective
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="AWARENESS">Brand Awareness</option>
                <option value="CONVERSIONS">Lead Conversions</option>
                <option value="ENGAGEMENT">Audience Engagement</option>
                <option value="TRAFFIC">Website Traffic</option>
                <option value="RETENTION">Customer Retention</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Budget (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2">
              {['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Delete Campaign "{campaignToDelete.name}"?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This action cannot be undone. Associated posts will remain preserved in the system with their campaign tag unlinked.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCampaignToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/20"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
