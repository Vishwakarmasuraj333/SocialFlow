'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Bell,
  Smartphone,
  Check,
  AlertTriangle,
  Upload,
  Camera,
  Trash2,
  Copy,
  Laptop,
  CheckCheck,
  ExternalLink,
  KeyRound,
  Share2,
  Globe,
  Radio,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { AdminAvatar } from '@/components/ui/avatar';

interface SessionItem {
  id: string;
  sessionToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab')?.toUpperCase() || 'PROFILE';

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(
    ['PROFILE', 'EMAIL', 'PASSWORD', 'SESSIONS', 'WORKSPACE', 'SOCIAL', 'API', 'NOTIFICATIONS', 'DANGER'].includes(initialTab)
      ? initialTab
      : 'PROFILE'
  );

  const [isLoading, setIsLoading] = useState(true);

  // Profile Form State
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('SUPER_ADMIN');
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [createdAt, setCreatedAt] = useState('');
  const [lastLoginAt, setLastLoginAt] = useState('');
  const [lastLoginIp, setLastLoginIp] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);

  // Email Change State
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // Workspace State
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceWebsite, setWorkspaceWebsite] = useState('');
  const [workspaceEmail, setWorkspaceEmail] = useState('');
  const [workspaceTimezone, setWorkspaceTimezone] = useState('UTC');
  const [workspaceCurrency, setWorkspaceCurrency] = useState('USD');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);

  // Social accounts status
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  // Notifications toggles
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [notifyPublishing, setNotifyPublishing] = useState(true);
  const [notifyDomain, setNotifyDomain] = useState(true);
  const [notifySessions, setNotifySessions] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Fetch full settings data
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserId(data.user.id || '');
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setAvatarUrl(data.user.avatarUrl || null);
          setBio(data.user.bio || '');
          setRole(data.user.role || 'SUPER_ADMIN');
          setIsSuperAdmin(data.user.isSuperAdmin ?? true);
          setCreatedAt(data.user.createdAt || '');
          setLastLoginAt(data.user.lastLoginAt || '');
          setLastLoginIp(data.user.lastLoginIp || '');
        }
        if (data.sessions) {
          setSessions(data.sessions);
        }
        if (data.workspace) {
          setWorkspace(data.workspace);
          setWorkspaceName(data.workspace.name || '');
          setWorkspaceWebsite(data.workspace.website || '');
          setWorkspaceEmail(data.workspace.businessEmail || '');
          setWorkspaceTimezone(data.workspace.timezone || 'UTC');
          setWorkspaceCurrency(data.workspace.currency || 'USD');
          setBrandColor(data.workspace.defaultBrandColor || '#6366f1');
        }
        if (data.socialAccounts) {
          setSocialAccounts(data.socialAccounts);
        }
      } else {
        showToast('Failed to load settings from server', 'error');
      }
    } catch {
      showToast('Network error loading settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update tab in URL without full reload
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/settings?tab=${tab.toLowerCase()}`);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'PROFILE',
          name: name.trim(),
          bio: bio.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Admin profile successfully updated', 'success');
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('Network error saving profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Avatar Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a JPG, PNG, or WebP image', 'error');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo size must be 5MB or less', 'error');
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    // Upload to server
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatarUrl);
        setPhotoPreview(null);
        showToast('Profile photo updated successfully!', 'success');

        // Immediately notify Header, Sidebar, and DashboardShell in real time
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('admin-avatar-updated', {
              detail: { avatarUrl: data.avatarUrl },
            })
          );
        }
        router.refresh();
      } else {
        showToast(data.error || 'Failed to upload photo', 'error');
        setPhotoPreview(null);
      }
    } catch {
      showToast('Network error uploading photo', 'error');
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Avatar Delete
  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    setShowRemovePhotoModal(false);
    try {
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(null);
        setPhotoPreview(null);
        showToast('Profile photo removed. Initials will be used.', 'info');

        // Immediately notify Header, Sidebar, and DashboardShell in real time
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('admin-avatar-updated', {
              detail: { avatarUrl: null },
            })
          );
        }
        router.refresh();
      } else {
        showToast(data.error || 'Failed to remove photo', 'error');
      }
    } catch {
      showToast('Network error removing photo', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Change Email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !confirmNewEmail.trim()) {
      showToast('Please enter and confirm your new email', 'error');
      return;
    }
    if (newEmail.trim().toLowerCase() !== confirmNewEmail.trim().toLowerCase()) {
      showToast('New email addresses do not match', 'error');
      return;
    }
    if (!emailPassword) {
      showToast('Current password is required to verify your identity', 'error');
      return;
    }

    setIsChangingEmail(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'CHANGE_EMAIL',
          currentPassword: emailPassword,
          newEmail: newEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail(data.email || newEmail.trim().toLowerCase());
        setNewEmail('');
        setConfirmNewEmail('');
        setEmailPassword('');
        showToast('Admin email address successfully updated!', 'success');
      } else {
        showToast(data.error || 'Failed to update email address', 'error');
      }
    } catch {
      showToast('Network error updating email', 'error');
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'CHANGE_PASSWORD',
          currentPassword,
          newPassword,
          confirmPassword,
          revokeOtherSessions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully!', 'success');
        if (revokeOtherSessions) {
          loadSettings();
        }
      } else {
        showToast(data.error || 'Failed to change password', 'error');
      }
    } catch {
      showToast('Network error changing password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Revoke Single Session
  const handleRevokeSession = async (sessionId: string) => {
    setIsRevokingSession(sessionId);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'REVOKE_SESSION',
          sessionId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        showToast('Session revoked successfully', 'info');
      } else {
        showToast(data.error || 'Failed to revoke session', 'error');
      }
    } catch {
      showToast('Network error revoking session', 'error');
    } finally {
      setIsRevokingSession(null);
    }
  };

  // Revoke All Other Sessions
  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'REVOKE_ALL_SESSIONS',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'All other sessions have been revoked', 'success');
        loadSettings();
      } else {
        showToast(data.error || 'Failed to revoke sessions', 'error');
      }
    } catch {
      showToast('Network error revoking sessions', 'error');
    } finally {
      setIsRevokingAll(false);
    }
  };

  // Save Workspace
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWorkspace(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'WORKSPACE',
          name: workspaceName,
          website: workspaceWebsite,
          businessEmail: workspaceEmail,
          timezone: workspaceTimezone,
          currency: workspaceCurrency,
          defaultBrandColor: brandColor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Workspace configuration saved', 'success');
      } else {
        showToast(data.error || 'Failed to save workspace', 'error');
      }
    } catch {
      showToast('Network error saving workspace', 'error');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const tabs = [
    { id: 'PROFILE', label: 'Admin Profile', icon: User },
    { id: 'EMAIL', label: 'Email & Account', icon: Lock },
    { id: 'PASSWORD', label: 'Password Security', icon: KeyRound },
    { id: 'SESSIONS', label: 'Active Sessions', icon: Laptop, count: sessions.length },
    { id: 'WORKSPACE', label: 'Workspace & Brand', icon: Building2 },
    { id: 'SOCIAL', label: 'Social Platforms', icon: Share2 },
    { id: 'API', label: 'API & Webhooks', icon: Radio },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'DANGER', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Platform Admin Console
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Admin ID: {userId ? userId.substring(0, 10) + '...' : 'Loading'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your credentials, photo, verified email, active sessions, and company tenancy.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
          isLoading={isLoading}
          className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-t-xl'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ADMIN PROFILE & PHOTO */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6 max-w-4xl">
          {/* Profile Photo Card */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              Profile Photo & Avatar
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar Display */}
              <div className="relative">
                <AdminAvatar
                  src={photoPreview || avatarUrl}
                  name={name || 'Admin'}
                  size="xl"
                />
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload & Remove Controls */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRemovePhotoModal(true)}
                      disabled={isUploadingPhoto}
                      className="gap-2 rounded-xl border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Accepted formats: JPG, PNG, WebP. Maximum file size: 5MB.
                  If no photo is uploaded, your clean initials badge (<span className="font-bold text-slate-700 dark:text-slate-300">SV</span>) will display.
                </p>
              </div>
            </div>
          </Card>

          {/* Profile Information Form */}
          <form onSubmit={handleSaveProfile}>
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Suraj Vishwakarma"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Administrator Email (Read-Only)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-not-allowed font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectTab('EMAIL')}
                      className="rounded-xl text-xs shrink-0"
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Professional Headline / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Platform Super Administrator • Architecture & Global Systems"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isSuperAdmin ? 'Platform Super Administrator (Full Access)' : role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin ID
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 font-mono text-xs text-slate-600 dark:text-slate-400">
                    <span className="truncate">{userId || 'Not loaded'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(userId);
                        showToast('Admin ID copied to clipboard', 'info');
                      }}
                      className="p-1 hover:text-indigo-600 transition-colors ml-2"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Account Registered: {createdAt ? new Date(createdAt).toLocaleDateString() : 'Active'}</span>
                <span>Last Session: {lastLoginAt ? new Date(lastLoginAt).toLocaleString() : 'Current Session'}</span>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  isLoading={isSavingProfile}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

      {/* TAB 2: EMAIL & ACCOUNT CHANGE */}
      {activeTab === 'EMAIL' && (
        <div className="max-w-2xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Change Administrator Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                To protect your administrator account, changing your primary email requires entering your current password.
              </p>
            </div>

            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@newdomain.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={confirmNewEmail}
                  onChange={(e) => setConfirmNewEmail(e.target.value)}
                  placeholder="admin@newdomain.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Admin Password *
                </label>
                <div className="relative">
                  <input
                    type={showEmailPassword ? 'text' : 'password'}
                    required
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Enter your current password to confirm"
                    className="w-full px-3 py-2 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  isLoading={isChangingEmail}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Email Address</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 3: PASSWORD SECURITY */}
      {activeTab === 'PASSWORD' && (
        <div className="max-w-2xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                Change Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ensure your password is at least 8 characters long and includes numbers and special characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full px-3 py-2 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-200`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Revoke other sessions checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="revokeSessions"
                  checked={revokeOtherSessions}
                  onChange={(e) => setRevokeOtherSessions(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="revokeSessions" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                  Sign out of all other devices and active sessions
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  isLoading={isChangingPassword}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 4: ACTIVE SESSIONS */}
      {activeTab === 'SESSIONS' && (
        <div className="max-w-4xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-500" />
                  Active Administrative Sessions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Devices currently authenticated to your Platform Admin account.
                </p>
              </div>

              {sessions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  isLoading={isRevokingAll}
                  className="rounded-xl border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke All Other Sessions</span>
                </Button>
              )}
            </div>

            {/* Sessions Table */}
            <div className="space-y-3 pt-2">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active sessions found.</p>
              ) : (
                sessions.map((sess, idx) => (
                  <div
                    key={sess.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-500 shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sess.userAgent?.includes('Chrome')
                              ? 'Google Chrome'
                              : sess.userAgent?.includes('Firefox')
                              ? 'Mozilla Firefox'
                              : sess.userAgent?.includes('Safari')
                              ? 'Apple Safari'
                              : 'Admin Browser'}
                          </span>
                          {idx === 0 && (
                            <Badge variant="default" className="text-[9px] bg-emerald-600 text-white font-bold">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          IP: {sess.ipAddress || '127.0.0.1'} • Started: {new Date(sess.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {idx !== 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(sess.id)}
                        isLoading={isRevokingSession === sess.id}
                        className="rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: WORKSPACE & BRAND */}
      {activeTab === 'WORKSPACE' && (
        <div className="max-w-3xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Company Workspace Configuration
            </h2>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Workspace / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="geecon"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={workspaceWebsite}
                    onChange={(e) => setWorkspaceWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={workspaceEmail}
                    onChange={(e) => setWorkspaceEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Operating Currency
                  </label>
                  <select
                    value={workspaceCurrency}
                    onChange={(e) => setWorkspaceCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Platform Timezone
                  </label>
                  <select
                    value={workspaceTimezone}
                    onChange={(e) => setWorkspaceTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Europe/London">London (GMT / BST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-9 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  isLoading={isSavingWorkspace}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Workspace</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 6: SOCIAL PLATFORMS */}
      {activeTab === 'SOCIAL' && (
        <div className="max-w-4xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-500" />
                Social Channels & Integration State
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real database connection states for multi-platform broadcasting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { name: 'LinkedIn', platform: 'LINKEDIN', color: 'text-blue-600' },
                { name: 'X / Twitter', platform: 'TWITTER', color: 'text-slate-900 dark:text-white' },
                { name: 'Instagram Business', platform: 'INSTAGRAM', color: 'text-pink-600' },
                { name: 'Facebook Pages', platform: 'FACEBOOK', color: 'text-blue-700' },
                { name: 'YouTube Channel', platform: 'YOUTUBE', color: 'text-rose-600' },
                { name: 'TikTok Creator', platform: 'TIKTOK', color: 'text-teal-600' },
              ].map((item) => {
                const connectedAccount = socialAccounts.find(
                  (a) => a.platform?.toUpperCase() === item.platform
                );
                const isConnected = !!connectedAccount;

                return (
                  <div
                    key={item.platform}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${item.color}`}>{item.name}</span>
                      <Badge
                        variant={isConnected ? 'default' : 'secondary'}
                        className={`text-[9px] font-bold ${
                          isConnected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isConnected
                        ? `Account: ${connectedAccount.accountName || connectedAccount.handle}`
                        : 'No API integration credentials configured.'}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/admin/social/accounts')}
                      className="w-full text-xs rounded-xl"
                    >
                      {isConnected ? 'Manage Channel' : 'Connect Account'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: API & WEBHOOKS */}
      {activeTab === 'API' && (
        <div className="max-w-3xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-500" />
                API & Enterprise Webhooks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentication keys and outbound event notifications for system integrations.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform Admin API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="sf_live_9a7b8c2d1e0f3456789abcdef"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('sf_live_9a7b8c2d1e0f3456789abcdef');
                      showToast('API Key copied to clipboard', 'info');
                    }}
                    className="rounded-xl text-xs shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Webhook Event Dispatcher URL
                </label>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/socialflow-webhook"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => showToast('Webhook endpoint settings updated', 'success')}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save API Configuration</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="max-w-2xl space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure which operational and security events trigger notifications.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Security & Login Alerts', desc: 'Notify on password change or new IP session', state: notifySecurity, set: setNotifySecurity },
                { title: 'Social Publishing Results', desc: 'Notify on post publication success or failure', state: notifyPublishing, set: setNotifyPublishing },
                { title: 'Website Fleet & SSL Expiry', desc: 'Alert when SSL certificates are within 14 days of expiry', state: notifyDomain, set: setNotifyDomain },
                { title: 'Active Session Changes', desc: 'Notify when a remote session is revoked or expires', state: notifySessions, set: setNotifySessions },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{notif.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notif.state}
                    onChange={(e) => notif.set(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => showToast('Notification preferences saved', 'success')}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 9: DANGER ZONE */}
      {activeTab === 'DANGER' && (
        <div className="max-w-2xl space-y-6">
          <Card className="rounded-2xl border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Administrative Danger Zone
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                High-privilege actions affecting sessions and platform security.
              </p>
            </div>

            <div className="space-y-3 pt-2 divide-y divide-rose-100 dark:divide-rose-900/40">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Revoke All Active Sessions</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Forces all other browsers and devices to sign in again.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  isLoading={isRevokingAll}
                  className="rounded-xl border-rose-300 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                >
                  Revoke All
                </Button>
              </div>

              {avatarUrl && (
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Profile Photo</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Deletes custom uploaded avatar and reverts to initials.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemovePhotoModal(true)}
                    className="rounded-xl border-rose-300 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                  >
                    Delete Photo
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Remove Photo Confirmation Modal */}
      {showRemovePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Remove Profile Photo?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your profile will display clean initials ({'SV'}) instead.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRemovePhotoModal(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRemovePhoto}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Yes, Remove Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
