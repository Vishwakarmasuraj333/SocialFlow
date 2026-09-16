'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Shield,
  KeyRound,
  Lock,
  UserX,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function AdminsManagementPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const [passwordModalAdmin, setPasswordModalAdmin] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const json = await res.json();
        setAdmins(json.admins || []);
      }
    } catch {
      showToast('Failed to load administrators', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('New administrator successfully provisioned!', 'success');
        setIsAddModalOpen(false);
        setForm({
          name: '',
          email: '',
          password: '',
          role: 'ADMIN',
          status: 'ACTIVE',
        });
        fetchAdmins();
      } else {
        showToast(json.error || 'Failed to create administrator', 'error');
      }
    } catch {
      showToast('Network error creating administrator', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (adminId: string, status: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, status }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(`Administrator status changed to ${status}`, 'success');
        fetchAdmins();
      } else {
        showToast(json.error || 'Failed to change status', 'error');
      }
    } catch {
      showToast('Network error updating status', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRole = async (adminId: string, role: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, role }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(`Administrator role updated to ${role}`, 'success');
        fetchAdmins();
      } else {
        showToast(json.error || 'Failed to update role', 'error');
      }
    } catch {
      showToast('Network error updating role', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalAdmin) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: passwordModalAdmin.id, password: newPassword }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast('Password reset and active sessions revoked successfully', 'success');
        setPasswordModalAdmin(null);
        setNewPassword('');
      } else {
        showToast(json.error || 'Failed to reset password', 'error');
      }
    } catch {
      showToast('Network error resetting password', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/admins?id=${adminToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        showToast('Administrator successfully removed', 'success');
        setAdminToDelete(null);
        fetchAdmins();
      } else {
        showToast(json.error || 'Failed to delete administrator', 'error');
      }
    } catch {
      showToast('Network error deleting administrator', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Staff Directory
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Administrative Staff & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Provision staff credentials, assign administrative roles, suspend access, and enforce session security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmins}
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
            <span>Provision Admin</span>
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
          placeholder="Filter staff by name, email, or role..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <Badge variant="outline" className="text-[10px] font-mono">
          {filteredAdmins.length} Admins
        </Badge>
      </div>

      {/* Staff Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
            <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No staff accounts found</p>
          </Card>
        ) : (
          filteredAdmins.map((admin) => (
            <Card
              key={admin.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {admin.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {admin.name}
                    </span>
                    <Badge
                      variant={admin.isSuperAdmin || admin.role === 'SUPER_ADMIN' ? 'destructive' : 'default'}
                      className="text-[9px] uppercase font-bold tracking-wider"
                    >
                      {admin.role || (admin.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN')}
                    </Badge>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                        admin.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate font-mono">{admin.email}</p>

                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    Last login: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'} • IP: {admin.lastLoginIp || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                {/* Role Switcher */}
                <select
                  value={admin.role || 'ADMIN'}
                  onChange={(e) => handleUpdateRole(admin.id, e.target.value)}
                  disabled={isProcessing}
                  className="px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="VIEWER">VIEWER</option>
                </select>

                {/* Status Toggle */}
                {admin.status === 'ACTIVE' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus(admin.id, 'SUSPENDED')}
                    className="h-8 text-xs rounded-xl text-amber-600 dark:text-amber-400"
                  >
                    <UserX className="h-3 w-3 mr-1" /> Suspend
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus(admin.id, 'ACTIVE')}
                    className="h-8 text-xs rounded-xl text-emerald-600 dark:text-emerald-400"
                  >
                    <UserCheck className="h-3 w-3 mr-1" /> Activate
                  </Button>
                )}

                {/* Reset Password */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPasswordModalAdmin(admin)}
                  className="h-8 text-xs rounded-xl"
                  title="Reset Password"
                >
                  <KeyRound className="h-3 w-3" />
                </Button>

                {/* Delete Admin */}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => setAdminToDelete(admin)}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600"
                  title="Remove Admin"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Provision Admin Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title="Provision Administrator Account"
        description="Create authorized administrative staff credentials with predefined RBAC roles."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sarah Vance"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Administrator Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="sarah@socialflow.io"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Temporary Password *
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Administrative Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="ADMIN">ADMIN - Full Operational Control</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN - Global Platform Owner</option>
              <option value="MANAGER">MANAGER - Approvals & Campaigns</option>
              <option value="EDITOR">EDITOR - Content & Publishing</option>
              <option value="ANALYST">ANALYST - Read-only Metrics</option>
              <option value="VIEWER">VIEWER - Restricted Observer</option>
            </select>
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={Boolean(passwordModalAdmin)}
        onClose={() => !isProcessing && setPasswordModalAdmin(null)}
        title="Reset Administrator Password"
        description="Set a new password. All active sessions for this administrator will be revoked immediately."
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Setting new credentials for: <b>{passwordModalAdmin?.name}</b> ({passwordModalAdmin?.email}).
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setPasswordModalAdmin(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Admin Modal */}
      <Modal
        isOpen={Boolean(adminToDelete)}
        onClose={() => !isProcessing && setAdminToDelete(null)}
        title="Remove Administrator Account?"
        description="This will permanently delete this administrator and terminate all active sessions."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Permanent Account Termination</span>
              <p className="text-[11px] leading-relaxed mt-1">
                You are about to remove <b>{adminToDelete?.name}</b> ({adminToDelete?.email}). The final active Super Administrator cannot be deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setAdminToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleDeleteAdmin}
              className="rounded-xl font-bold"
            >
              Confirm Account Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
