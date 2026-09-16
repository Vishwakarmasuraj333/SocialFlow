'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

const ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'ANALYST', 'VIEWER'];

export default function TeamPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [isInviting, setIsInviting] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      showToast('Failed to load team members', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsInviting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Invitation sent to ${email}!`, 'success');
        setIsInviteOpen(false);
        setName('');
        setEmail('');
        fetchMembers();
      } else {
        showToast(data.error || 'Invitation failed', 'error');
      }
    } catch {
      showToast('Network error during invitation', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (res.ok) {
        showToast('Member role updated', 'success');
        fetchMembers();
      } else {
        showToast('Failed to update role', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team?id=${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Member removed from workspace', 'success');
        fetchMembers();
      } else {
        showToast('Failed to remove member', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Team & RBAC Permissions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage organization members, assign publishing authorities, and configure role boundaries.
          </p>
        </div>

        <Button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20">
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Members Table */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm dark:shadow-none">
        <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Workspace Members ({members.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Active collaborators within this tenant workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name}`}
                    alt={member.user.name}
                    className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{member.user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <select
                    value={member.role}
                    disabled={member.role === 'OWNER'}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-75 cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {member.role !== 'OWNER' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-7 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix Reference */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm dark:shadow-none">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> RBAC Permissions Matrix
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Hierarchical authorization matrix governing workspace operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 pr-4">Role</th>
                <th className="py-2.5 px-3">Direct Publishing</th>
                <th className="py-2.5 px-3">Agency Approval</th>
                <th className="py-2.5 px-3">Connect Channels</th>
                <th className="py-2.5 px-3">Manage Members</th>
                <th className="py-2.5 px-3">Analytics & Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">OWNER</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">ADMIN</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">MANAGER</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">EDITOR</td>
                <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-medium">Submit for Review</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ View</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">ANALYST</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full Export</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">VIEWER</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">—</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">✓ Read-Only</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Grant access to this workspace with defined roles."
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Member Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Jenkins"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@agency.com"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Workspace Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ADMIN">ADMIN (Workspace settings & accounts)</option>
              <option value="MANAGER">MANAGER (Review & approve posts)</option>
              <option value="EDITOR">EDITOR (Create content & submit reviews)</option>
              <option value="ANALYST">ANALYST (View analytics & export)</option>
              <option value="VIEWER">VIEWER (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
