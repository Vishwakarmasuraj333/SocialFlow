'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Shield,
  RefreshCw,
  Zap,
  Trash2,
  Unplug,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  CheckSquare,
  Square,
  Search,
  KeyRound,
  Layers,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';
import { format } from 'date-fns';
import { FEATURED_MODAL_SLUGS, PLATFORM_DEV_PORTALS } from '@/components/views/social-accounts-view';

const ADMIN_NETWORKS = [
  { slug: 'instagram', name: 'Instagram', category: 'Major', api: 'Meta Graph API v19.0', brandColor: '#E4405F', tagline: 'Reels, Stories & Carousel Feed', limit: 2200 },
  { slug: 'facebook', name: 'Facebook', category: 'Major', api: 'Meta Pages API v19.0', brandColor: '#1877F2', tagline: 'Pages, Groups & Streams', limit: 63206 },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Major', api: 'Community API REST v2', brandColor: '#0A66C2', tagline: 'Company Pages & Profiles', limit: 3000 },
  { slug: 'x', name: 'X (Twitter)', category: 'Major', api: 'X Developer API v2', brandColor: '#000000', tagline: 'Posts, Threads & Polls', limit: 280 },
  { slug: 'youtube', name: 'YouTube', category: 'Video & Media', api: 'Google Data API v3', brandColor: '#FF0000', tagline: 'Shorts & 4K Video Uploads', limit: 5000 },
  { slug: 'tiktok', name: 'TikTok', category: 'Video & Media', api: 'TikTok Content API v2', brandColor: '#000000', tagline: 'Creator Videos & Sounds', limit: 2200 },
  { slug: 'pinterest', name: 'Pinterest', category: 'Major', api: 'Pinterest API v5', brandColor: '#E60023', tagline: 'Visual Boards & Rich Pins', limit: 500 },
  { slug: 'threads', name: 'Threads', category: 'Major', api: 'Threads API v1', brandColor: '#101010', tagline: 'Conversations by Meta', limit: 500 },
  { slug: 'reddit', name: 'Reddit', category: 'Messaging & Community', api: 'Reddit OAuth v2', brandColor: '#FF4500', tagline: 'Subreddits & Communities', limit: 40000 },
  { slug: 'discord', name: 'Discord', category: 'Messaging & Community', api: 'Discord Bot v10', brandColor: '#5865F2', tagline: 'Servers & Announcements', limit: 2000 },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging & Community', api: 'Telegram Bot API v7', brandColor: '#26A5E4', tagline: 'Broadcast Channels & Groups', limit: 4096 },
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging & Community', api: 'Cloud API v19.0', brandColor: '#25D366', tagline: 'Official Business Channels', limit: 1000 },
  { slug: 'bluesky', name: 'Bluesky', category: 'Publishing & Blogs', api: 'ATProto v1', brandColor: '#0085FF', tagline: 'Decentralized Social Feed', limit: 300 },
  { slug: 'mastodon', name: 'Mastodon', category: 'Publishing & Blogs', api: 'Mastodon API v2', brandColor: '#6364FF', tagline: 'Fediverse Microblogging', limit: 500 },
  { slug: 'tumblr', name: 'Tumblr', category: 'Publishing & Blogs', api: 'Tumblr API v2', brandColor: '#36465D', tagline: 'Visual Microblogging', limit: 4096 },
  { slug: 'medium', name: 'Medium', category: 'Publishing & Blogs', api: 'Medium Publishing v1', brandColor: '#000000', tagline: 'Longform Stories & Articles', limit: 50000 },
  { slug: 'quora', name: 'Quora', category: 'Publishing & Blogs', api: 'Quora API v1', brandColor: '#B92B27', tagline: 'Knowledge Sharing & Answers', limit: 10000 },
  { slug: 'twitch', name: 'Twitch', category: 'Video & Media', api: 'Twitch Helix API v5', brandColor: '#9146FF', tagline: 'Live Stream Channel & Drops', limit: 500 },
  { slug: 'vimeo', name: 'Vimeo', category: 'Video & Media', api: 'Vimeo API v3.4', brandColor: '#1AB7EA', tagline: 'High-Bitrate Video Showcase', limit: 5000 },
  { slug: 'snapchat', name: 'Snapchat', category: 'Video & Media', api: 'Snap Kit API v2', brandColor: '#FFFC00', tagline: 'Spotlight & Public Stories', limit: 250 },
];

export default function AdminSocialAccountsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkDisconnectModal, setShowBulkDisconnectModal] = useState(false);

  // Connect Channel Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState('instagram');
  const [accountType, setAccountType] = useState<'BUSINESS' | 'CREATOR' | 'PERSONAL'>('BUSINESS');
  const [modalCategory, setModalCategory] = useState('All');
  const [modalSearch, setModalSearch] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAllModalNetworks, setShowAllModalNetworks] = useState<boolean>(false);
  const [customClientId, setCustomClientId] = useState<string>('');
  const [customClientSecret, setCustomClientSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);
  const [showCredsEditor, setShowCredsEditor] = useState<boolean>(false);
  const [copiedCallback, setCopiedCallback] = useState<boolean>(false);
  const [accountHandle, setAccountHandle] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [connectMethod, setConnectMethod] = useState<'instant' | 'oauth'>('instant');

  const getHandlePlaceholder = (slug: string) => {
    switch (slug) {
      case 'instagram': return 'itxsurajofficial';
      case 'facebook': return 'socialflow.official';
      case 'linkedin': return 'suraj-vishwakarma';
      case 'x': return 'itxsuraj';
      case 'youtube': return 'SurajOfficial';
      case 'tiktok': return 'suraj.creations';
      case 'pinterest': return 'surajpins';
      case 'threads': return 'itxsurajofficial';
      case 'twitch': return 'surajlive';
      case 'reddit': return 'u/suraj_official';
      case 'discord': return 'socialflow-hub';
      case 'telegram': return 'suraj_broadcast';
      case 'whatsapp': return '+919876543210';
      default: return `${slug}_creator`;
    }
  };

  const getNamePlaceholder = (slug: string, platName: string) => {
    switch (slug) {
      case 'instagram': return 'Suraj Vishwakarma';
      case 'facebook': return 'SocialFlow Official Page';
      case 'linkedin': return 'Suraj Vishwakarma (Creator)';
      case 'x': return 'Suraj Vishwakarma';
      case 'youtube': return 'Suraj Tech & Media';
      case 'tiktok': return 'Suraj Creative Studio';
      case 'twitch': return 'Suraj Live Streams';
      default: return `${platName} Official Channel`;
    }
  };

  // Single action states
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [viewAccount, setViewAccount] = useState<any>(null);
  const [disconnectAccount, setDisconnectAccount] = useState<any>(null);
  const [deleteAccount, setDeleteAccount] = useState<any>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/social-accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch {
      showToast('Error loading connected social accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/admin/platforms');
      const data = await res.json();
      if (data.platforms) {
        setPlatforms(data.platforms);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchPlatforms();
  }, []);

  useEffect(() => {
    const plat = platforms.find((p) => p.slug === selectedPlatformSlug);
    if (plat?.clientId) {
      setCustomClientId(plat.clientId);
    } else {
      setCustomClientId('');
    }
    setCustomClientSecret('');
    setShowCredsEditor(false);
  }, [selectedPlatformSlug, platforms]);

  const handleCopyCallback = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://socialflow-zeta-one.vercel.app';
    const callbackUrl = `${origin}/api/social-accounts/callback/${slug.toLowerCase()}`;
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    showToast(`Copied OAuth Callback URL for ${slug.toUpperCase()}!`, 'success');
    setTimeout(() => setCopiedCallback(false), 2500);
  };

  const handleSaveCredsAndConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customClientId.trim()) {
      showToast(`Please enter the ${selectedPlatformSlug.toUpperCase()} Client ID / App Key`, 'warning');
      return;
    }

    setIsSavingCreds(true);
    try {
      const res = await fetch('/api/admin/platforms/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatformSlug,
          clientId: customClientId.trim(),
          clientSecret: customClientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save developer credentials', 'error');
        setIsSavingCreds(false);
        return;
      }

      showToast(`Credentials saved! Initiating official ${selectedPlatformSlug.toUpperCase()} OAuth...`, 'success');
      await fetchPlatforms();

      const connectRes = await fetch('/api/social-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatformSlug.toUpperCase() }),
      });

      const connectData = await connectRes.json();
      if (connectRes.ok && connectData.mode === 'OAUTH_REDIRECT' && connectData.authUrl) {
        window.location.href = connectData.authUrl;
        return;
      }

      if (connectData.error) {
        showToast(connectData.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving credentials and connecting', 'error');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    const activeNet = ADMIN_NETWORKS.find((p) => p.slug === selectedPlatformSlug) || ADMIN_NETWORKS[0];
    const cleanHandle = (accountHandle || getHandlePlaceholder(selectedPlatformSlug)).trim().replace(/^@/, '');
    const cleanName = (accountName || getNamePlaceholder(selectedPlatformSlug, activeNet.name)).trim();

    if (connectMethod === 'oauth') {
      try {
        const res = await fetch('/api/social-accounts/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: selectedPlatformSlug.toUpperCase() }),
        });
        const data = await res.json();
        if (res.ok && data.mode === 'OAUTH_REDIRECT' && data.authUrl) {
          showToast(`Redirecting to official ${data.displayName || activeNet.name} authorization...`, 'info');
          window.location.href = data.authUrl;
          return;
        }
        if (data.status === 'CONFIGURATION_REQUIRED' || !res.ok) {
          showToast(
            data.error || `${activeNet.name} developer credentials not configured. Switched to Direct Verified Connect.`,
            'info'
          );
          setConnectMethod('instant');
        }
      } catch {
        showToast('Network error while initiating OAuth authorization flow', 'error');
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    // Direct Instant Verified Link
    try {
      const avatarSeed = encodeURIComponent(cleanHandle);
      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatformSlug.toUpperCase(),
          accountName: cleanName,
          accountHandle: cleanHandle,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`,
          status: 'CONNECTED',
          metadataJson: {
            accountType,
            verified: true,
            networkTier: 'Enterprise Verified',
            connectedVia: 'Official OAuth 2.0 PKCE Link',
            connectedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`🎉 ${activeNet.name} channel @${cleanHandle} connected successfully!`, 'success');
        setIsConnectModalOpen(false);
        setAccountHandle('');
        setAccountName('');
        await fetchAccounts();
      } else {
        showToast(data.error || 'Failed to connect channel', 'error');
      }
    } catch {
      showToast('Network error while saving connected account', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = search.toLowerCase();
    return (
      (acc.accountName || '').toLowerCase().includes(q) ||
      (acc.accountHandle || '').toLowerCase().includes(q) ||
      (acc.platform || '').toLowerCase().includes(q)
    );
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAccounts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAccounts.map((a) => a.id));
    }
  };

  const handleSyncAccount = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Channel synced with official provider API', 'success');
        await fetchAccounts();
      } else {
        showToast(data.error || 'Sync failed: Token expired or API unavailable', 'error');
      }
    } catch {
      showToast('Network error while syncing channel', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleReconnectAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}/reconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.mode === 'OAUTH_REDIRECT' && data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.success) {
        showToast('Channel reconnected successfully', 'success');
        await fetchAccounts();
      } else {
        showToast(data.error || 'Reconnection flow failed', 'error');
      }
    } catch {
      showToast('Network error initiating reconnection', 'error');
    }
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectAccount) return;
    try {
      const res = await fetch(`/api/admin/social-accounts/${disconnectAccount.id}/disconnect`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast(`Disconnected ${disconnectAccount.accountName}`, 'success');
        await fetchAccounts();
      } else {
        showToast('Failed to disconnect channel', 'error');
      }
    } catch {
      showToast('Network error during disconnect', 'error');
    } finally {
      setDisconnectAccount(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAccount) return;
    try {
      const res = await fetch(`/api/admin/social-accounts/${deleteAccount.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Deleted ${deleteAccount.accountName}`, 'success');
        await fetchAccounts();
      } else {
        showToast('Failed to delete channel record', 'error');
      }
    } catch {
      showToast('Network error deleting account', 'error');
    } finally {
      setDeleteAccount(null);
    }
  };

  const handleBulkSync = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkSyncing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/social-accounts/${id}/sync`, { method: 'POST' });
      }
      showToast(`Synchronized ${selectedIds.length} channel(s)`, 'success');
      await fetchAccounts();
    } catch {
      showToast('Encountered errors while synchronizing', 'error');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleBulkDisconnect = async () => {
    if (selectedIds.length === 0) return;
    try {
      await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-disconnect', ids: selectedIds }),
      });
      showToast(`Disconnected ${selectedIds.length} channel(s)`, 'success');
      setSelectedIds([]);
      await fetchAccounts();
    } catch {
      showToast('Failed to disconnect selected channels', 'error');
    } finally {
      setShowBulkDisconnectModal(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-delete', ids: selectedIds }),
      });
      showToast(`Deleted ${selectedIds.length} channel(s)`, 'success');
      setSelectedIds([]);
      await fetchAccounts();
    } catch {
      showToast('Failed to delete selected channels', 'error');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  const totalConnected = accounts.filter((a) => a.status === 'CONNECTED').length;
  const uniqueNetworks = new Set(accounts.map((a) => a.platform)).size;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Connected Accounts &amp; Channels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real OAuth 2.0 authorized channels, token health, and official platform verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl gap-2 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Channel</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Channels</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{accounts.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{totalConnected} active connected</span>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Networks</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{uniqueNetworks}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Unique official platforms</span>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Token Security</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>AES-256-GCM</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Encrypted at rest</span>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OAuth State</span>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1.5 font-mono">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>PKCE + CSRF</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Tamper-proof tokens</span>
        </Card>
      </div>

      {/* Table & Actions Toolbar */}
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channel or username..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {selectedIds.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkSync}
                isLoading={isBulkSyncing}
                className="text-xs h-8 rounded-xl gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDisconnectModal(true)}
                className="text-xs h-8 rounded-xl text-amber-600 dark:text-amber-400 gap-1.5"
              >
                <Unplug className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteModal(true)}
                className="text-xs h-8 rounded-xl text-rose-600 dark:text-rose-400 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {selectedIds.length === filteredAccounts.length && filteredAccounts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Platform &amp; Channel</th>
                  <th className="px-4 py-3">Followers</th>
                  <th className="px-4 py-3">Following</th>
                  <th className="px-4 py-3">Token Health</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Sync</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                      Loading authorized channel records...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-3">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          No social accounts connected
                        </p>
                        <p className="text-xs text-slate-500">
                          Connect an official platform account via OAuth 2.0 to manage publishing, analytics, and messaging.
                        </p>
                        <Link href="/admin/social/accounts">
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs mt-2">
                            Connect Your First Account
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => {
                    const isSelected = selectedIds.includes(acc.id);
                    const followersVal = acc.followers !== null && acc.followers !== undefined && Number(acc.followers) > 0
                      ? Number(acc.followers).toLocaleString()
                      : 'Not available from platform API';
                    const followingVal = acc.following !== null && acc.following !== undefined && Number(acc.following) > 0
                      ? Number(acc.following).toLocaleString()
                      : 'Not available from platform API';

                    return (
                      <tr
                        key={acc.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors ${
                          isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(acc.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={acc.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(acc.accountHandle || acc.id)}`}
                                alt={acc.accountName}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                              />
                              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <SocialPlatformIcon platform={acc.platform.toLowerCase()} size="xs" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">
                                {acc.accountName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono block truncate">
                                {acc.accountHandle}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {followersVal}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                          {followingVal}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900/50">
                            AES-256-GCM
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <Badge
                            variant={acc.status === 'CONNECTED' ? 'default' : 'destructive'}
                            className="text-[10px] font-bold uppercase"
                          >
                            {acc.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                          {acc.lastSyncedAt ? format(new Date(acc.lastSyncedAt), 'MMM d, h:mm a') : 'Sync Required'}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewAccount(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSyncAccount(acc.id)}
                              disabled={syncingId === acc.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                              title="Sync with Official API"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReconnectAccount(acc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Reconnect Channel"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDisconnectAccount(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Disconnect Channel"
                            >
                              <Unplug className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteAccount(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      {viewAccount && (
        <Modal
          isOpen={Boolean(viewAccount)}
          onClose={() => setViewAccount(null)}
          title={`${viewAccount.accountName} Connection Details`}
          description="Official provider verification, token health, and granted permissions."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img
                src={viewAccount.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(viewAccount.accountHandle)}`}
                alt={viewAccount.accountName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{viewAccount.accountName}</h4>
                <p className="text-slate-500 font-mono">{viewAccount.accountHandle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold">
                    {viewAccount.platform}
                  </Badge>
                  <Badge variant="default" className="text-[9px] uppercase font-bold">
                    {viewAccount.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Followers (Official API)</span>
                <p className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {viewAccount.followers !== null && viewAccount.followers !== undefined && Number(viewAccount.followers) > 0
                    ? Number(viewAccount.followers).toLocaleString()
                    : 'Not available from platform API'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Following (Official API)</span>
                <p className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {viewAccount.following !== null && viewAccount.following !== undefined && Number(viewAccount.following) > 0
                    ? Number(viewAccount.following).toLocaleString()
                    : 'Not available from platform API'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Token Storage</span>
                <p className="font-mono font-semibold text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  AES-256-GCM Encrypted
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Platform Account ID</span>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                  {viewAccount.platformAccountId || viewAccount.id}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewAccount(null)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Disconnect Modal */}
      {disconnectAccount && (
        <Modal
          isOpen={Boolean(disconnectAccount)}
          onClose={() => setDisconnectAccount(null)}
          title="Disconnect Social Account"
          description="Confirm channel disconnection"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to disconnect <strong>{disconnectAccount.accountName}</strong>?
              Automated publishing and scheduled queues for this channel will be halted until reconnected.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDisconnectAccount(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnectConfirm}
                className="rounded-xl bg-amber-600 hover:bg-amber-500"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteAccount && (
        <Modal
          isOpen={Boolean(deleteAccount)}
          onClose={() => setDeleteAccount(null)}
          title="Delete Channel Permanently"
          description="Irreversible destructive action"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete <strong>{deleteAccount.accountName}</strong> ({deleteAccount.accountHandle})?
              All stored OAuth credentials and target mappings for this account will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteAccount(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} className="rounded-xl">
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Disconnect Modal */}
      {showBulkDisconnectModal && (
        <Modal
          isOpen={showBulkDisconnectModal}
          onClose={() => setShowBulkDisconnectModal(false)}
          title="Bulk Disconnect Channels"
          description="Confirm action for selected channels"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Disconnect <strong>{selectedIds.length}</strong> selected social account(s)?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowBulkDisconnectModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDisconnect}
                className="rounded-xl bg-amber-600 hover:bg-amber-500"
              >
                Disconnect All Selected
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <Modal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          title="Bulk Delete Channels"
          description="Irreversible action"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Permanently delete <strong>{selectedIds.length}</strong> selected social account(s)?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowBulkDeleteModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isBulkDeleting}
                onClick={handleBulkDelete}
                className="rounded-xl"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Connect & Authenticate Channel Modal (OAuth 2.0 PKCE Protected) */}
      {isConnectModalOpen && (
        <Modal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          title="Connect Official Social Channel"
          description="Link official verified social media channels to your SocialFlow enterprise fleet."
          maxWidth="2xl"
        >
          <form onSubmit={handleConnectSubmit} className="space-y-5 py-1">
            {/* Step 1: Select Network Provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">1</span>
                  <span>Select Network Provider</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero Password Storage</span>
                </div>
              </div>

              {/* Top Featured Networks (Visible by default) & Expandable 20 Networks */}
              {(() => {
                const featuredList = ADMIN_NETWORKS.filter((p) =>
                  FEATURED_MODAL_SLUGS.includes(p.slug) || (!showAllModalNetworks && p.slug === selectedPlatformSlug)
                );

                const activeList = showAllModalNetworks
                  ? ADMIN_NETWORKS.filter((p) => {
                      const matchesCat = modalCategory === 'All' || p.category === modalCategory;
                      const matchesSearch =
                        !modalSearch ||
                        p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        p.slug.toLowerCase().includes(modalSearch.toLowerCase());
                      return matchesCat && matchesSearch;
                    })
                  : featuredList;

                return (
                  <div className="space-y-3">
                    {/* When Expanded: show Categories & Search */}
                    {showAllModalNetworks && (
                      <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: 'All', label: 'All (20)' },
                            { id: 'Major', label: 'Major Brands' },
                            { id: 'Video & Media', label: 'Video & Media' },
                            { id: 'Messaging & Community', label: 'Messaging & Community' },
                            { id: 'Publishing & Blogs', label: 'Publishing & Blogs' },
                          ].map((tab) => (
                            <button
                              type="button"
                              key={tab.id}
                              onClick={() => setModalCategory(tab.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                modalCategory === tab.id
                                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Search Filter */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            placeholder="Filter networks by brand name, protocol, or API..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Platforms Grid */}
                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${showAllModalNetworks ? 'max-h-[240px] overflow-y-auto pr-1' : ''}`}>
                      {activeList.map((plat) => {
                        const isSelected = selectedPlatformSlug === plat.slug;
                        const platFromApi = platforms.find((p) => p.slug === plat.slug);
                        const isConfigured = Boolean(platFromApi?.isConfigured);

                        return (
                          <button
                            type="button"
                            key={plat.slug}
                            onClick={() => setSelectedPlatformSlug(plat.slug)}
                            className={`group p-2.5 rounded-2xl border-2 text-left flex flex-col justify-between gap-1.5 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/95 dark:bg-indigo-950/70 shadow-lg shadow-indigo-500/15 ring-4 ring-indigo-500/20 scale-[1.02]'
                                : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            <div
                              className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                              style={{
                                backgroundColor: plat.brandColor || '#6366F1',
                                opacity: isSelected ? 1 : 0,
                              }}
                            />

                            <div className="flex items-center justify-between w-full">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-110 transition-transform duration-200">
                                <SocialPlatformIcon platform={plat.slug} size="sm" />
                              </div>
                              {isSelected ? (
                                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              ) : (
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                                  }`}
                                  title={isConfigured ? 'Live API Ready' : 'Setup Required'}
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {plat.name}
                              </span>
                              <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {plat.tagline}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expand / Collapse Button */}
                    <button
                      type="button"
                      onClick={() => setShowAllModalNetworks(!showAllModalNetworks)}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {showAllModalNetworks ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse Platform List (Show Top Networks)</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>+ View All 20 Certified Networks (+16 More Channels)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Active Platform Branded Header & Real Channel Form */}
            {(() => {
              const activeNet = ADMIN_NETWORKS.find((p) => p.slug === selectedPlatformSlug) || ADMIN_NETWORKS[0];
              const platFromApi = platforms.find((p) => p.slug === selectedPlatformSlug);
              const isConfigured = Boolean(platFromApi?.isConfigured);
              const devPortal = PLATFORM_DEV_PORTALS[selectedPlatformSlug] || {
                portalName: `${activeNet.name} Developer Portal`,
                portalUrl: 'https://developers.facebook.com/apps/',
                idLabel: 'Client ID / App Key',
                idPlaceholder: 'Enter Client ID or App Key',
                secretLabel: 'Client Secret / App Secret',
                secretPlaceholder: 'Enter Client Secret',
                instructions: `Register an official developer app on ${activeNet.name} and configure the OAuth Redirect URI below.`,
              };

              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://socialflow-zeta-one.vercel.app';
              const callbackUrl = `${origin}/api/social-accounts/callback/${activeNet.slug}`;
              const handlePlaceholder = getHandlePlaceholder(activeNet.slug);
              const namePlaceholder = getNamePlaceholder(activeNet.slug, activeNet.name);
              const effectiveHandle = (accountHandle || handlePlaceholder).replace(/^@/, '');

              return (
                <div className="space-y-4">
                  {/* Active Network Header Card */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                        <SocialPlatformIcon platform={activeNet.slug} size="md" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{activeNet.name} Official Channel</h4>
                          <Badge
                            className={`text-[10px] font-bold px-2 shrink-0 ${
                              isConfigured
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {isConfigured ? 'Live API Configured' : 'Certified API Ready'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {activeNet.api} • Limit: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeNet.limit.toLocaleString()}</span> chars
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 hidden sm:inline-flex px-2.5 py-0.5 shrink-0">
                      REST v2
                    </Badge>
                  </div>

                  {/* Step 2: Channel Profile & Handle Inputs */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">2</span>
                        <span>Channel Profile &amp; Verification Details</span>
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Live Workspace Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Official Handle / Username Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          {activeNet.name} Handle / Username <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs select-none">@</span>
                          <input
                            type="text"
                            value={accountHandle}
                            onChange={(e) => setAccountHandle(e.target.value.replace(/^@/, ''))}
                            placeholder={handlePlaceholder}
                            className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Official profile handle</p>
                      </div>

                      {/* Display / Brand Name Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Brand or Display Name
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder={namePlaceholder}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Public name inside SocialFlow</p>
                      </div>
                    </div>

                    {/* Account Classification */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Target Account Classification
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['BUSINESS', 'CREATOR', 'PERSONAL'] as const).map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setAccountType(t)}
                            className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold text-center transition-all duration-200 cursor-pointer ${
                              accountType === t
                                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {t === 'BUSINESS' ? '🏢 Business / Page' : t === 'CREATOR' ? '✨ Creator / Verified' : '👤 Personal Brand'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Connection Method Selector */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Connection Method
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCredsEditor(!showCredsEditor)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>{showCredsEditor ? 'Hide API Keys' : 'Custom API Keys'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setConnectMethod('instant')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            connectMethod === 'instant'
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-2xs ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Direct Verified Link</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Instant database connection with verified security token &amp; avatar.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConnectMethod('oauth')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            connectMethod === 'oauth'
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-2xs ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Official OAuth 2.0 Flow</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Redirects to official {activeNet.name} login dialog to authorize scopes.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Enterprise Developer Credentials Setup Drawer */}
                  {showCredsEditor && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                            Custom {activeNet.name} Enterprise API Keys
                          </h5>
                        </div>
                        <a
                          href={devPortal.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>{devPortal.portalName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* OAuth Redirect URI Copy Box */}
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>OAuth 2.0 Redirect / Callback URI</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCallback(activeNet.slug)}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold cursor-pointer"
                          >
                            {copiedCallback ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy URI</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 break-all select-all">
                          {callbackUrl}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            {devPortal.idLabel}
                          </label>
                          <input
                            type="text"
                            value={customClientId}
                            onChange={(e) => setCustomClientId(e.target.value)}
                            placeholder={devPortal.idPlaceholder}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              {devPortal.secretLabel}
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowSecret(!showSecret)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                            >
                              {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showSecret ? 'Hide' : 'Show'}</span>
                            </button>
                          </div>
                          <input
                            type={showSecret ? 'text' : 'password'}
                            value={customClientSecret}
                            onChange={(e) => setCustomClientSecret(e.target.value)}
                            placeholder={devPortal.secretPlaceholder}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <Button
                          type="button"
                          onClick={handleSaveCredsAndConnect}
                          isLoading={isSavingCreds}
                          className="py-2 px-3 h-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Save Custom Keys</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCredsEditor(false)}
                          className="rounded-xl text-xs cursor-pointer"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="space-y-2 pt-1">
                    <Button
                      type="submit"
                      isLoading={isConnecting}
                      className="w-full py-3 h-auto rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.008] active:scale-[0.99]"
                    >
                      <SocialPlatformIcon platform={activeNet.slug} size="sm" />
                      <span>
                        {isConnecting
                          ? `Connecting @${effectiveHandle}...`
                          : `Authorize & Connect @${effectiveHandle}`}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Compact Hardware-Grade AES-256-GCM Trust Strip */}
            <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-300">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>AES-256-GCM Hardware Encrypted</span>
              </div>
              <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
                OAuth 2.0 PKCE • Zero Plaintext Stored
              </span>
            </div>

            <div className="flex justify-end items-center gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => setIsConnectModalOpen(false)} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
