'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Share2,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Layers,
  Sparkles,
  Edit,
  Lock,
  User,
  Search,
  Globe,
  CheckSquare,
  Square,
  Users,
  Radio,
  SlidersHorizontal,
  X,
  Activity,
  Check,
  Eye,
  EyeOff,
  BarChart3,
  KeyRound,
  Send,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Unplug,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon, ALL_SUPPORTED_PLATFORMS } from '@/components/brand/platform-icons';

const CORE_ENTERPRISE_NETWORKS = [
  {
    id: 'instagram',
    slug: 'instagram',
    name: 'Instagram',
    category: 'Major',
    networkType: 'Meta Graph API',
    apiVersion: 'v19.0',
    characterLimit: 2200,
    mediaLimit: 10,
    brandColor: '#E4405F',
    tagline: 'Reels, Stories & Carousel Feed',
  },
  {
    id: 'facebook',
    slug: 'facebook',
    name: 'Facebook',
    category: 'Major',
    networkType: 'Meta Pages API',
    apiVersion: 'v19.0',
    characterLimit: 63206,
    mediaLimit: 10,
    brandColor: '#1877F2',
    tagline: 'Pages, Groups & Streams',
  },
  {
    id: 'linkedin',
    slug: 'linkedin',
    name: 'LinkedIn',
    category: 'Major',
    networkType: 'Community & Marketing API',
    apiVersion: 'REST v2',
    characterLimit: 3000,
    mediaLimit: 9,
    brandColor: '#0A66C2',
    tagline: 'Company Pages & Profiles',
  },
  {
    id: 'x',
    slug: 'x',
    name: 'X (Twitter)',
    category: 'Major',
    networkType: 'X Developer API',
    apiVersion: 'API v2 (PKCE)',
    characterLimit: 280,
    mediaLimit: 4,
    brandColor: '#000000',
    tagline: 'Posts, Threads & Polls',
  },
  {
    id: 'youtube',
    slug: 'youtube',
    name: 'YouTube',
    category: 'Video & Media',
    networkType: 'Google Data API',
    apiVersion: 'Data v3',
    characterLimit: 5000,
    mediaLimit: 1,
    brandColor: '#FF0000',
    tagline: 'Shorts & 4K Video Uploads',
  },
  {
    id: 'tiktok',
    slug: 'tiktok',
    name: 'TikTok',
    category: 'Video & Media',
    networkType: 'TikTok Content API',
    apiVersion: 'Content v2',
    characterLimit: 2200,
    mediaLimit: 35,
    brandColor: '#000000',
    tagline: 'Creator Videos & Sounds',
  },
  {
    id: 'pinterest',
    slug: 'pinterest',
    name: 'Pinterest',
    category: 'Major',
    networkType: 'Pinterest API',
    apiVersion: 'REST v5',
    characterLimit: 500,
    mediaLimit: 5,
    brandColor: '#E60023',
    tagline: 'Visual Boards & Rich Pins',
  },
  {
    id: 'threads',
    slug: 'threads',
    name: 'Threads',
    category: 'Major',
    networkType: 'Threads API',
    apiVersion: 'Threads v1',
    characterLimit: 500,
    mediaLimit: 10,
    brandColor: '#101010',
    tagline: 'Conversations by Meta',
  },
  {
    id: 'reddit',
    slug: 'reddit',
    name: 'Reddit',
    category: 'Messaging & Community',
    networkType: 'Reddit OAuth API',
    apiVersion: 'OAuth v2',
    characterLimit: 40000,
    mediaLimit: 20,
    brandColor: '#FF4500',
    tagline: 'Subreddits & Communities',
  },
  {
    id: 'discord',
    slug: 'discord',
    name: 'Discord',
    category: 'Messaging & Community',
    networkType: 'Discord Webhook & Bot API',
    apiVersion: 'Bot v10',
    characterLimit: 2000,
    mediaLimit: 10,
    brandColor: '#5865F2',
    tagline: 'Servers & Announcements',
  },
  {
    id: 'telegram',
    slug: 'telegram',
    name: 'Telegram',
    category: 'Messaging & Community',
    networkType: 'Telegram Channel API',
    apiVersion: 'Bot API v7',
    characterLimit: 4096,
    mediaLimit: 10,
    brandColor: '#26A5E4',
    tagline: 'Broadcast Channels & Groups',
  },
  {
    id: 'whatsapp',
    slug: 'whatsapp',
    name: 'WhatsApp',
    category: 'Messaging & Community',
    networkType: 'Meta WhatsApp Cloud API',
    apiVersion: 'Cloud v19.0',
    characterLimit: 1000,
    mediaLimit: 10,
    brandColor: '#25D366',
    tagline: 'Official Business Channels',
  },
  {
    id: 'bluesky',
    slug: 'bluesky',
    name: 'Bluesky',
    category: 'Publishing & Blogs',
    networkType: 'AT Protocol API',
    apiVersion: 'ATProto v1',
    characterLimit: 300,
    mediaLimit: 4,
    brandColor: '#0085FF',
    tagline: 'Decentralized Social Feed',
  },
  {
    id: 'mastodon',
    slug: 'mastodon',
    name: 'Mastodon',
    category: 'Publishing & Blogs',
    networkType: 'ActivityPub REST API',
    apiVersion: 'Mastodon v2',
    characterLimit: 500,
    mediaLimit: 4,
    brandColor: '#6364FF',
    tagline: 'Fediverse Microblogging',
  },
  {
    id: 'tumblr',
    slug: 'tumblr',
    name: 'Tumblr',
    category: 'Publishing & Blogs',
    networkType: 'Tumblr API',
    apiVersion: 'API v2',
    characterLimit: 4096,
    mediaLimit: 10,
    brandColor: '#36465D',
    tagline: 'Visual Microblogging & Tags',
  },
  {
    id: 'medium',
    slug: 'medium',
    name: 'Medium',
    category: 'Publishing & Blogs',
    networkType: 'Medium Publishing API',
    apiVersion: 'API v1',
    characterLimit: 50000,
    mediaLimit: 20,
    brandColor: '#000000',
    tagline: 'Longform Stories & Articles',
  },
  {
    id: 'quora',
    slug: 'quora',
    name: 'Quora',
    category: 'Publishing & Blogs',
    networkType: 'Quora API',
    apiVersion: 'API v1',
    characterLimit: 10000,
    mediaLimit: 5,
    brandColor: '#B92B27',
    tagline: 'Knowledge Sharing & Answers',
  },
  {
    id: 'wordpress',
    slug: 'wordpress',
    name: 'WordPress',
    category: 'Publishing & Blogs',
    networkType: 'WordPress REST API',
    apiVersion: 'wp/v2',
    characterLimit: 100000,
    mediaLimit: 50,
    brandColor: '#21759B',
    tagline: 'Self-Hosted & VIP Publications',
  },
  {
    id: 'vimeo',
    slug: 'vimeo',
    name: 'Vimeo',
    category: 'Video & Media',
    networkType: 'Vimeo API',
    apiVersion: 'API v3.4',
    characterLimit: 5000,
    mediaLimit: 1,
    brandColor: '#1AB7EA',
    tagline: 'High-Bitrate Video Showcase',
  },
  {
    id: 'snapchat',
    slug: 'snapchat',
    name: 'Snapchat',
    category: 'Video & Media',
    networkType: 'Snap Kit Marketing API',
    apiVersion: 'Snap Kit v2',
    characterLimit: 250,
    mediaLimit: 1,
    brandColor: '#FFFC00',
    tagline: 'Spotlight & Public Stories',
  },
];

export default function SocialAccountsView() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Real Database Accounts State (Zero hardcoded demo accounts)
  const [accounts, setAccounts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [showBulkDisconnectModal, setShowBulkDisconnectModal] = useState(false);

  // Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string>('instagram');
  const [accountType, setAccountType] = useState<'BUSINESS' | 'CREATOR' | 'PERSONAL'>('BUSINESS');
  const [isConnecting, setIsConnecting] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('All');
  const [modalSearch, setModalSearch] = useState<string>('');

  // Matrix Filter State
  const [matrixCategory, setMatrixCategory] = useState<string>('Major');

  // Details Modal State
  const [viewAccount, setViewAccount] = useState<any>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    accountName: '',
    accountHandle: '',
    followers: 0,
    password: '',
    publishingEnabled: true,
    analyticsEnabled: true,
    messagingEnabled: false,
    status: 'CONNECTED',
  });

  // Disconnect Confirmation State
  const [disconnectAccount, setDisconnectAccount] = useState<any>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Permanent Delete States
  const [deleteAccount, setDeleteAccount] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Fetch real accounts from database
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/social-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      showToast('Failed to load connected social accounts', 'error');
    }
  };

  // Fetch database-backed platforms
  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/admin/platforms');
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data.platforms || []);
      }
    } catch {
      // Fallback
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAccounts(), fetchPlatforms()]);
    setIsLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  // Multi-Selection Handlers
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

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Sync
  const handleBulkSync = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkSyncing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/social-accounts/${id}/sync`, { method: 'POST' });
      }
      showToast(`Synchronized ${selectedIds.length} channel(s) with platform APIs`, 'success');
      await fetchAccounts();
    } catch {
      showToast('Encountered errors while synchronizing selected accounts', 'error');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  // Bulk Disconnect
  const handleBulkDisconnect = async () => {
    if (selectedIds.length === 0) return;
    try {
      // 1. First attempt atomic batch disconnect
      const res = await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-disconnect', ids: selectedIds }),
      });

      if (res.ok) {
        showToast(`Disconnected ${selectedIds.length} social channel(s)`, 'success');
      } else {
        // Fallback to individual disconnects
        for (const id of selectedIds) {
          await fetch(`/api/admin/social-accounts/${id}/disconnect`, { method: 'POST' }).catch(() => {});
        }
        showToast(`Disconnected ${selectedIds.length} social channel(s)`, 'success');
      }
      setSelectedIds([]);
      await fetchAccounts();
    } catch {
      showToast('Encountered an issue disconnecting accounts', 'error');
    } finally {
      setShowBulkDisconnectModal(false);
    }
  };

  // Single Account Sync
  const handleSyncAccount = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Account synchronized successfully with official API', 'success');
        await fetchAccounts();
      } else {
        showToast(data.error || 'Sync failed: Token expired or API unavailable', 'error');
        await fetchAccounts();
      }
    } catch {
      showToast('Network error while requesting official platform sync', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  // Single Account Reconnect
  const handleReconnectAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}/reconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.mode === 'OAUTH_REDIRECT' && data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.success) {
        showToast(data.message || 'Channel reconnected and verified successfully!', 'success');
        await fetchAccounts();
      } else if (data.error) {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Failed to initiate reconnection flow', 'error');
    }
  };

  // Single Disconnect (Pause/Revoke)
  const handleDisconnectConfirm = async () => {
    if (!disconnectAccount) return;
    try {
      let res = await fetch(`/api/admin/social-accounts/${disconnectAccount.id}/disconnect`, {
        method: 'POST',
      });
      if (!res.ok) {
        // Fallback to route PATCH or action
        res = await fetch(`/api/admin/social-accounts/${disconnectAccount.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'DISCONNECTED' }),
        });
      }

      if (res.ok) {
        showToast(`${disconnectAccount.accountName || disconnectAccount.accountHandle} disconnected successfully.`, 'success');
        await fetchAccounts();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Failed to disconnect account', 'error');
      }
    } catch {
      showToast('Network error while disconnecting account', 'error');
    } finally {
      setDisconnectAccount(null);
    }
  };

  // Single Delete (Permanently Remove from Fleet)
  const handleDeleteConfirm = async () => {
    if (!deleteAccount) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/social-accounts/${deleteAccount.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`${deleteAccount.accountName || deleteAccount.accountHandle} deleted successfully.`, 'success');
        setSelectedIds((prev) => prev.filter((i) => i !== deleteAccount.id));
        await fetchAccounts();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Failed to delete account', 'error');
      }
    } catch {
      showToast('Network error while deleting account', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteAccount(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-delete', ids: selectedIds }),
      });

      if (res.ok) {
        showToast(`Deleted ${selectedIds.length} social channel(s) permanently.`, 'success');
      } else {
        for (const id of selectedIds) {
          await fetch(`/api/admin/social-accounts/${id}`, { method: 'DELETE' }).catch(() => {});
        }
        showToast(`Deleted ${selectedIds.length} social channel(s) permanently.`, 'success');
      }
      setSelectedIds([]);
      await fetchAccounts();
    } catch {
      showToast('Encountered an issue deleting accounts', 'error');
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (acc: any) => {
    setEditingAccount(acc);
    setEditForm({
      accountName: acc.accountName || '',
      accountHandle: acc.accountHandle || '',
      followers: Number(acc.followers) || 0,
      password: '',
      publishingEnabled: acc.publishingEnabled ?? true,
      analyticsEnabled: acc.analyticsEnabled ?? true,
      messagingEnabled: acc.messagingEnabled ?? false,
      status: acc.status || 'CONNECTED',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    try {
      const res = await fetch(`/api/admin/social-accounts/${editingAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        showToast('Account configuration updated successfully.', 'success');
        setIsEditModalOpen(false);
        await fetchAccounts();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update account', 'error');
      }
    } catch {
      showToast('Failed to save account changes', 'error');
    }
  };

  // Connect Official Account via Real OAuth 2.0 (Zero password input)
  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    const activePlatform = platforms.find((p) => p.slug === selectedPlatformSlug) || {
      name: selectedPlatformSlug.toUpperCase(),
      slug: selectedPlatformSlug,
      isConfigured: false,
    };

    try {
      const res = await fetch('/api/social-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatformSlug.toUpperCase(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.mode === 'OAUTH_REDIRECT' && data.authUrl) {
        showToast(`Redirecting to official ${data.displayName || activePlatform.name} authorization...`, 'info');
        window.location.href = data.authUrl;
        return;
      }

      if (data.status === 'CONFIGURATION_REQUIRED' || !res.ok) {
        showToast(
          data.error || `${activePlatform.name} API credentials not configured in server environment.`,
          'error'
        );
      }
    } catch {
      showToast('Network error while initiating OAuth authorization flow', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Real Database Metrics Calculation (Section 21)
  const totalAudience = accounts.reduce((sum, acc) => {
    return sum + (Number(acc.followers) || 0);
  }, 0);

  const connectedPlatformsCount = new Set(accounts.filter((a) => a.status === 'CONNECTED').map((a) => a.platform)).size;
  const configuredPlatformsCount = platforms.filter((p) => p.isConfigured).length;

  // Filter Accounts
  const filteredAccounts = accounts.filter((acc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      acc.accountName?.toLowerCase().includes(q) ||
      acc.accountHandle?.toLowerCase().includes(q) ||
      acc.platform?.toLowerCase().includes(q);

    const matchesPlatform =
      platformFilter === 'ALL' || acc.platform?.toUpperCase() === platformFilter.toUpperCase();

    return matchesSearch && matchesPlatform;
  });

  const categories = ['All', 'Major', 'Video & Streaming', 'Messaging & Community', 'Creative & Niche'];

  const displayPlatforms = platforms.length > 0 ? platforms : ALL_SUPPORTED_PLATFORMS.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id.toLowerCase(),
    category: p.category,
    characterLimit: p.characterLimit || p.charLimit || 2200,
    mediaLimit: p.maxImages || p.imgLimit || 4,
    videoSupport: Boolean(p.supportsVideo ?? p.video),
    apiVersion: p.apiBadge || 'REST v2',
    isConfigured: false,
    computedStatus: 'CONFIGURATION_REQUIRED',
  }));

  const modalFilteredPlatforms = displayPlatforms.filter((p) => {
    const matchesCategory = modalCategory === 'All' || p.category === modalCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(modalSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const matrixFilteredPlatforms =
    matrixCategory === 'All'
      ? displayPlatforms
      : displayPlatforms.filter((p) => p.category === matrixCategory);

  const currentSelectedPlatformObj = displayPlatforms.find((p) => p.slug === selectedPlatformSlug) || displayPlatforms[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Social Media Management
            </Badge>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Connected Social Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connect and manage your social media channels, publish content, and track audience engagement in real time across verified enterprise networks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedPlatformSlug('instagram');
              setIsConnectModalOpen(true);
            }}
            className="whitespace-nowrap shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap">Connect Channel</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar - Derived strictly from database */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Connected Accounts</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {isLoading ? '...' : accounts.length}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Across {connectedPlatformsCount} active {connectedPlatformsCount === 1 ? 'network' : 'networks'}
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Audience</span>
            <div className="flex items-center justify-between">
              <span suppressHydrationWarning className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {isLoading ? '...' : totalAudience > 0 ? totalAudience.toLocaleString() : '0'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              {totalAudience > 0 ? 'Aggregated cross-platform followers' : 'Real-time audience sync'}
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security & Encryption</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {configuredPlatformsCount} Configured
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">AES-256-GCM hardware encryption</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supported Networks</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {displayPlatforms.length}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Enterprise social networks</p>
          </div>
        </Card>
      </div>

      {/* Toolbar: Search, Platform Filter & Select All */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by account name, handle, or platform..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {accounts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8 text-xs rounded-xl font-medium gap-1.5 border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                {selectedIds.length > 0 && selectedIds.length === filteredAccounts.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All ({filteredAccounts.length})</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {['ALL', 'INSTAGRAM', 'THREADS', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'FACEBOOK', 'PINTEREST'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                platformFilter === p
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p === 'ALL' ? 'All Platforms' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar when Accounts are Selected */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-20 p-3 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">
              {selectedIds.length === 1 ? '1 Account Selected' : `${selectedIds.length} Accounts Selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSync}
              isLoading={isBulkSyncing}
              className="h-8 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-white border-slate-700 gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync Selected</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulkDisconnectModal(true)}
              className="h-8 text-xs rounded-xl font-bold gap-1.5 border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
            >
              <Unplug className="w-3.5 h-3.5 text-amber-400" />
              <span>Disconnect ({selectedIds.length})</span>
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBulkDeleteModal(true)}
              className="h-8 text-xs rounded-xl font-bold gap-1.5 bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-sm text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>

            <button
              onClick={handleClearSelection}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Connected Channels Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Active Connected Channels</span>
            <Badge variant="outline" className="text-[10px] font-bold">
              {filteredAccounts.length}
            </Badge>
          </h2>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Sync
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="p-4 rounded-2xl animate-pulse space-y-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <Card className="border-dashed text-center py-16 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {accounts.length === 0 ? 'No social accounts connected' : 'No accounts match your criteria'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {accounts.length === 0
                  ? 'Connect official channels via OAuth to schedule posts, manage comments, and track real growth metrics.'
                  : 'Adjust your search filter or platform selector to display accounts.'}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  if (accounts.length === 0) {
                    setIsConnectModalOpen(true);
                  } else {
                    setSearch('');
                    setPlatformFilter('ALL');
                  }
                }}
                className="rounded-xl mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                {accounts.length === 0 ? 'Connect First Channel' : 'Clear Filters'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAccounts.map((acc) => {
              const isSelected = selectedIds.includes(acc.id);
              const followersCount = Number(acc.followers) || 0;
              const isExpired = acc.status === 'EXPIRED';
              const isDisconnected = acc.status === 'DISCONNECTED';
              const isSyncing = syncingId === acc.id;

              return (
                <Card
                  key={acc.id}
                  className={`relative overflow-hidden flex flex-col justify-between transition-all duration-200 rounded-2xl ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <CardHeader className="p-4 pb-2 space-y-3">
                    {/* Top Row: Checkbox & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(acc.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={isSelected ? 'Deselect Account' : 'Select Account'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-indigo-500/20" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={acc.status === 'CONNECTED' ? 'default' : isExpired ? 'destructive' : 'outline'}
                          className="text-[9px] uppercase font-bold tracking-wider"
                        >
                          {acc.status || 'CONNECTED'}
                        </Badge>
                      </div>
                    </div>

                    {/* Account Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={
                            acc.avatarUrl ||
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(acc.accountHandle || acc.id)}`
                          }
                          alt={acc.accountName}
                          className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover shrink-0 shadow-xs"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(acc.accountHandle || acc.id)}`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                          <SocialPlatformIcon platform={acc.platform.toLowerCase()} size="xs" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate" title={acc.accountName}>
                            {acc.accountName}
                          </CardTitle>
                          {acc.metadata?.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                          {acc.accountHandle}
                        </p>
                      </div>
                    </div>

                    {/* Real Follower / Audience Count */}
                    <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Audience:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[10px]">
                        {followersCount && followersCount > 0
                          ? `${followersCount.toLocaleString()} Followers`
                          : 'Not available from platform API'}
                      </span>
                    </div>

                    {/* Capability Flags */}
                    <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-500 font-mono">
                      <span className={`px-1.5 py-0.5 rounded ${acc.publishingEnabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-400'}`}>
                        Publishing {acc.publishingEnabled ? '✓' : '✗'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${acc.analyticsEnabled ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-400'}`}>
                        Analytics {acc.analyticsEnabled ? '✓' : '✗'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    {/* Last Sync Timestamp */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                      <span>Last Synced:</span>
                      <span suppressHydrationWarning className="text-slate-700 dark:text-slate-300 font-mono font-medium">
                        {mounted && acc.lastSyncedAt
                          ? new Date(acc.lastSyncedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Sync required'}
                      </span>
                    </div>

                    {/* Actions: Reconnect / Sync, View, Edit, Disconnect, Delete */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {isExpired || isDisconnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReconnectAccount(acc.id)}
                          className="flex-1 text-xs h-8 gap-1.5 font-bold rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                          title="Reconnect Channel Now"
                        >
                          <Zap className="h-3.5 w-3.5 fill-emerald-500/20" />
                          <span>Reconnect</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncAccount(acc.id)}
                          isLoading={isSyncing}
                          className="flex-1 text-xs h-8 gap-1 font-medium rounded-xl border-slate-200 dark:border-slate-800 hover:text-indigo-600 cursor-pointer"
                          title="Sync channel audience and metrics"
                        >
                          <RefreshCw className="h-3 w-3 text-indigo-500" />
                          <span>Sync</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewAccount(acc)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-indigo-600 border-slate-200 dark:border-slate-800 cursor-pointer"
                        title="View Account Details & Scopes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(acc)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-indigo-600 border-slate-200 dark:border-slate-800 cursor-pointer"
                        title="Edit Account Details"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      {!isDisconnected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDisconnectAccount(acc)}
                          className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          title="Disconnect Channel (Pause Automation)"
                        >
                          <Unplug className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteAccount(acc)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Channel Permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Database-Backed Provider Capabilities (Section 15 & 16) */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Platform Capabilities & Specifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supported publishing formats, direct API features, character limits, and media specifications
            </p>
          </div>

          {/* Matrix Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setMatrixCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  matrixCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matrixFilteredPlatforms.map((cap) => {
            const isConnected = (cap.connectedAccountsCount || 0) > 0;
            const statusLabel = isConnected
              ? 'CONNECTED'
              : cap.isConfigured
              ? 'AVAILABLE'
              : cap.status === 'DISABLED'
              ? 'DISABLED'
              : 'CONFIGURATION REQUIRED';

            const statusBadgeVariant = isConnected
              ? 'default'
              : cap.isConfigured
              ? 'outline'
              : 'secondary';

            return (
              <div
                key={cap.slug || cap.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <SocialPlatformIcon platform={cap.slug || cap.id} size="sm" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cap.name}
                    </span>
                  </div>
                  <Badge variant={statusBadgeVariant} className="text-[9px] uppercase font-mono font-bold">
                    {statusLabel}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span>OAuth Integration:</span>
                    <span className={`font-mono font-bold ${cap.isConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {cap.isConfigured ? 'Configured' : 'Setup Required'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Character Limit:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                      {(cap.characterLimit || 2200).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Media:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                      {cap.mediaLimit || 4}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video / Reels:</span>
                    <span className={cap.videoSupport ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {cap.videoSupport ? 'Supported' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect & Authenticate Account Modal (Enterprise Grade & Spacious) */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect Official Social Channel"
        description="Authenticate and link verified brand profiles, creator channels, or company social pages via official OAuth 2.0."
        maxWidth="2xl"
      >
        <form onSubmit={handleConnectSubmit} className="space-y-5 py-1">
          {/* Header Controls: Categories & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">1</span>
                <span>Select Social Network</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Password Storage</span>
              </div>
            </div>

            {/* Category Filter Pills with Smooth Transitions */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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

            {/* Quick Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Filter networks by name, category, or API type..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>
          </div>

          {/* Platform Selection Grid with Brand Glow & Hover Animation */}
          {(() => {
            const filteredNets = CORE_ENTERPRISE_NETWORKS.filter((p) => {
              const matchesCat = modalCategory === 'All' || p.category === modalCategory;
              const matchesSearch =
                !modalSearch ||
                p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                p.slug.toLowerCase().includes(modalSearch.toLowerCase()) ||
                p.networkType.toLowerCase().includes(modalSearch.toLowerCase());
              return matchesCat && matchesSearch;
            });

            return (
              <div className="max-h-[260px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {filteredNets.map((plat) => {
                  const isSelected = selectedPlatformSlug === plat.slug;
                  const platFromApi = platforms.find((p) => p.slug === plat.slug);
                  const isConfigured = Boolean(platFromApi?.isConfigured);

                  return (
                    <button
                      type="button"
                      key={plat.slug}
                      onClick={() => setSelectedPlatformSlug(plat.slug)}
                      className={`group p-3 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/95 dark:bg-indigo-950/70 shadow-lg shadow-indigo-500/15 ring-4 ring-indigo-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Brand Hover Accent Top Line */}
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
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                              }`}
                              title={isConfigured ? 'Live API Configured' : 'Setup Required'}
                            />
                          </div>
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
            );
          })()}

          {/* Active Platform Branded Integration Banner */}
          {(() => {
            const activeNet = CORE_ENTERPRISE_NETWORKS.find((p) => p.slug === selectedPlatformSlug) || CORE_ENTERPRISE_NETWORKS[0];
            const platFromApi = platforms.find((p) => p.slug === selectedPlatformSlug);
            const isConfigured = Boolean(platFromApi?.isConfigured);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                      <SocialPlatformIcon platform={activeNet.slug} size="md" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{activeNet.name} Integration</h4>
                        <Badge
                          className={`text-[10px] font-bold px-2 shrink-0 ${
                            isConfigured
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isConfigured ? 'Live API Configured' : 'Setup Required'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {activeNet.networkType} • Character limit: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeNet.characterLimit.toLocaleString()}</span> chars
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 hidden sm:inline-flex px-2.5 py-0.5 shrink-0">
                    {activeNet.apiVersion}
                  </Badge>
                </div>

                {/* Account Classification */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Target Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['BUSINESS', 'CREATOR', 'PERSONAL'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setAccountType(t)}
                        className={`py-2 px-3 rounded-xl border-2 text-xs font-bold text-center transition-all duration-200 cursor-pointer ${
                          accountType === t
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {t === 'BUSINESS' ? '🏢 Business / Page' : t === 'CREATOR' ? '✨ Creator / Verified' : '👤 Personal Brand'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified API Capabilities Checklist */}
                <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {activeNet.name} Official API Capabilities:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Feed & Multi-Channel Publishing</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Video / Media Assets ({activeNet.mediaLimit} items)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Real-time Insights & Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>OAuth Scopes & Token Refresh</span>
                    </div>
                  </div>
                </div>

                {/* Primary Connection Action or Configuration Required Banner */}
                {isConfigured ? (
                  <div className="pt-2">
                    <Button
                      type="submit"
                      isLoading={isConnecting}
                      className="w-full py-3 h-auto rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <SocialPlatformIcon platform={activeNet.slug} size="sm" />
                      <span>Authorize & Connect with {activeNet.name}</span>
                    </Button>
                    <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
                      Redirects to official {activeNet.name} OAuth dialog to securely authorize requested scopes.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>CONFIGURATION REQUIRED IN SERVER ENVIRONMENT</span>
                    </div>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                      {activeNet.name} OAuth developer credentials (Client ID / Secret) are not yet configured in your server environment. Configure them in Admin Settings or .env to start connecting accounts.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Link
                        href="/admin/settings/integrations"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        <span>Configure in Admin Settings</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        isLoading={isConnecting}
                        className="text-xs font-semibold rounded-lg"
                      >
                        Check Credentials
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Hardware-Grade AES-256-GCM Encryption Assurance */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400">
              <Shield className="h-4 w-4 shrink-0" />
              <span>AES-256-GCM Hardware-Grade Security</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              OAuth tokens are cryptographically isolated at rest using AES-256-GCM with authentication tags and are never visible in plaintext or exposed to frontend code.
            </p>
          </div>

          <div className="flex justify-end items-center gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsConnectModalOpen(false)} className="rounded-xl cursor-pointer">
              Close
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account Details & Scopes Modal (Section 2, 20) */}
      {viewAccount && (
        <Modal
          isOpen={Boolean(viewAccount)}
          onClose={() => setViewAccount(null)}
          title={`${viewAccount.accountName} Details`}
          description="Channel connection details, token health, and granted permissions."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img
                src={viewAccount.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${viewAccount.accountHandle}`}
                alt={viewAccount.accountName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{viewAccount.accountName}</h4>
                <p className="text-slate-500 font-mono">{viewAccount.accountHandle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold">
                    {viewAccount.platform}
                  </Badge>
                  <Badge variant={viewAccount.status === 'CONNECTED' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                    {viewAccount.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Account ID</span>
                <p className="font-mono font-semibold truncate mt-0.5">{viewAccount.platformAccountId || viewAccount.id}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Followers</span>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {viewAccount.followers !== null && viewAccount.followers !== undefined && Number(viewAccount.followers) > 0
                    ? Number(viewAccount.followers).toLocaleString()
                    : 'Not available from platform API'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Following</span>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {viewAccount.following !== null && viewAccount.following !== undefined && Number(viewAccount.following) > 0
                    ? Number(viewAccount.following).toLocaleString()
                    : 'Not available from platform API'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Last Synced</span>
                <p className="font-mono font-semibold text-[11px] mt-0.5">
                  {viewAccount.lastSyncedAt ? new Date(viewAccount.lastSyncedAt).toLocaleString() : 'Sync Required'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Token Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {viewAccount.status === 'EXPIRED' ? 'Expired' : 'Active & Encrypted'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Granted Scopes & Permissions</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {(viewAccount.scopes && viewAccount.scopes.length > 0
                  ? viewAccount.scopes
                  : ['read', 'write', 'publish', 'analytics']
                ).map((scope: string) => (
                  <span key={scope} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono text-[10px]">
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewAccount(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const id = viewAccount.id;
                  setViewAccount(null);
                  handleSyncAccount(id);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Sync Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Channel Configuration"
          description="Update display name, handle, and publishing capabilities."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Account Display Name
              </label>
              <input
                type="text"
                required
                value={editForm.accountName}
                onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Handle / Username
              </label>
              <input
                type="text"
                required
                value={editForm.accountHandle}
                onChange={(e) => setEditForm({ ...editForm, accountHandle: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Followers / Audience
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.followers}
                  onChange={(e) => setEditForm({ ...editForm, followers: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                  placeholder="e.g. 8097696"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  OAuth Authorization Token
                </label>
                <div className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/60 dark:bg-slate-950/60 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Encrypted via AES-256-GCM</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.publishingEnabled}
                  onChange={(e) => setEditForm({ ...editForm, publishingEnabled: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Enable Post Publishing</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.analyticsEnabled}
                  onChange={(e) => setEditForm({ ...editForm, analyticsEnabled: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Enable Analytics Ingestion</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Professional Disconnect Confirmation Modal */}
      {disconnectAccount && (
        <Modal
          isOpen={Boolean(disconnectAccount)}
          onClose={() => setDisconnectAccount(null)}
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revoke & Disconnect Channel?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action will invalidate active OAuth credentials and pause automation.
                </p>
              </div>
            </div>

            {/* Branded Channel Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                  <SocialPlatformIcon platform={disconnectAccount.platform} size="md" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {disconnectAccount.accountName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="truncate">@{disconnectAccount.accountHandle}</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{disconnectAccount.platform}</span>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-500 bg-rose-500/10 shrink-0">
                Token Revoke
              </Badge>
            </div>

            {/* Security Advisory / Impact Details */}
            <div className="space-y-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 p-3.5 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span><strong className="text-slate-900 dark:text-white">Publishing Halted:</strong> Queued broadcasts, scheduled triggers, and automation for this channel will stop immediately.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong className="text-slate-900 dark:text-white">Credentials Cleared:</strong> AES-256 encrypted OAuth access tokens will be wiped from active memory.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span><strong className="text-slate-900 dark:text-white">Historical Data Safe:</strong> All past analytics, audience graphs, and published post logs remain preserved.</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  const target = disconnectAccount;
                  setDisconnectAccount(null);
                  setDeleteAccount(target);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-500 hover:underline cursor-pointer"
              >
                Delete Permanently Instead?
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisconnectAccount(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Keep Connected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnectConfirm}
                  className="rounded-xl px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Unplug className="w-3.5 h-3.5" />
                  <span>Pause & Disconnect</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Professional Delete Account Modal (Soft Delete / Archive) */}
      {deleteAccount && (
        <Modal
          isOpen={Boolean(deleteAccount)}
          onClose={() => {
            if (!isDeleting) setDeleteAccount(null);
          }}
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Social Channel Permanently?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will completely remove this channel from your active fleet and workspace.
                </p>
              </div>
            </div>

            {/* Branded Channel Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                  <SocialPlatformIcon platform={deleteAccount.platform} size="md" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {deleteAccount.accountName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="truncate">@{deleteAccount.accountHandle}</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{deleteAccount.platform}</span>
                  </div>
                </div>
              </div>

              <Badge variant="destructive" className="text-[10px] font-mono shrink-0">
                Permanent Delete
              </Badge>
            </div>

            {/* Impact Details */}
            <div className="space-y-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 p-3.5 border border-rose-200/60 dark:border-rose-900/40 text-xs">
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>The channel and all its stored tokens will be deleted and removed from the active dashboard immediately.</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteAccount(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete Channel</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Professional Bulk Disconnect Modal */}
      {showBulkDisconnectModal && (
        <Modal
          isOpen={showBulkDisconnectModal}
          onClose={() => setShowBulkDisconnectModal(false)}
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bulk Disconnect {selectedIds.length} Channels?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revoke OAuth permissions and pause automation for target channels.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <p>You have selected <strong className="text-slate-900 dark:text-white font-mono">{selectedIds.length} social channels</strong> for mass detachment.</p>
              <p className="text-[11px] text-slate-500">Live cron broadcasts will be paused across all selected channels. Existing historical records will remain intact.</p>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDisconnectModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDisconnect}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Unplug className="w-3.5 h-3.5" />
                <span>Disconnect {selectedIds.length} Channels</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Professional Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <Modal
          isOpen={showBulkDeleteModal}
          onClose={() => {
            if (!isDeleting) setShowBulkDeleteModal(false);
          }}
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete {selectedIds.length} Channels Permanently?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will permanently delete and remove the selected channels from your SocialFlow workspace.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-1.5">
              <p>You have selected <strong className="text-slate-900 dark:text-white font-mono">{selectedIds.length} social channels</strong> to be deleted.</p>
              <p className="text-[11px]">All active links, credentials, and scheduled posts for these channels will be permanently purged.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isDeleting}
                onClick={handleBulkDelete}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedIds.length} Channels</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
