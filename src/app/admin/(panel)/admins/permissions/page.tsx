'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Check, X, Search, Lock, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PermissionScope {
  category: string;
  permissions: {
    key: string;
    description: string;
    roles: {
      SUPER_ADMIN: boolean;
      ADMIN: boolean;
      MANAGER: boolean;
      EDITOR: boolean;
      ANALYST: boolean;
      VIEWER: boolean;
    };
  }[];
}

const PERMISSION_SCOPES: PermissionScope[] = [
  {
    category: 'System & Security',
    permissions: [
      {
        key: 'admin.manage',
        description: 'Invite, suspend, edit roles, and delete administrative accounts',
        roles: { SUPER_ADMIN: true, ADMIN: false, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'security.sessions.revoke',
        description: 'Terminate active admin sessions and invalidate refresh tokens',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'security.audit.view',
        description: 'Inspect security event stream and immutable access logs',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: true, VIEWER: false },
      },
      {
        key: 'trash.purge_all',
        description: 'Empty platform central trash and permanently erase soft-deleted data',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
    ],
  },
  {
    category: 'Company & Locations',
    permissions: [
      {
        key: 'company.profile.update',
        description: 'Modify legal business name, tax identification, and corporate metadata',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'company.locations.manage',
        description: 'Add, update coordinates, archive, and delete regional office branches',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
    ],
  },
  {
    category: 'Websites & Domains',
    permissions: [
      {
        key: 'website.create_delete',
        description: 'Provision new web properties and delete production domains',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'domain.dns.manage',
        description: 'Modify A, AAAA, CNAME, MX, and TXT records on authoritative nameservers',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'website.content.publish',
        description: 'Write, publish, and schedule CMS articles, pages, and SEO tags',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: true, EDITOR: true, ANALYST: false, VIEWER: false },
      },
    ],
  },
  {
    category: 'Infrastructure & Cloud',
    permissions: [
      {
        key: 'infrastructure.asset.provision',
        description: 'Register VPS servers, managed databases, S3 buckets, and CDN distributions',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'infrastructure.metrics.read',
        description: 'View real-time telemetry, memory allocation, and CPU bandwidth utilization',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: true, EDITOR: false, ANALYST: true, VIEWER: true },
      },
    ],
  },
  {
    category: 'Social Media & Publishing',
    permissions: [
      {
        key: 'social.channels.connect',
        description: 'Authenticate OAuth 2.0 application tokens for social networks',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: false, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'social.posts.publish',
        description: 'Publish and schedule content to linked social media accounts',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: true, EDITOR: false, ANALYST: false, VIEWER: false },
      },
      {
        key: 'social.posts.draft',
        description: 'Create draft posts, upload media assets, and submit for editorial approval',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: true, EDITOR: true, ANALYST: false, VIEWER: false },
      },
      {
        key: 'social.analytics.export',
        description: 'Export engagement telemetry, impression rates, and follower growth metrics',
        roles: { SUPER_ADMIN: true, ADMIN: true, MANAGER: true, EDITOR: false, ANALYST: true, VIEWER: true },
      },
    ],
  },
];

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'ANALYST', 'VIEWER'] as const;

export default function PermissionsMatrixPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...PERMISSION_SCOPES.map((p) => p.category)];

  const filteredScopes = PERMISSION_SCOPES.map((scope) => ({
    ...scope,
    permissions: scope.permissions.filter((p) => {
      const matchesSearch =
        p.key.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || scope.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
  })).filter((scope) => scope.permissions.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/admin/admins"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Directory
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Detailed Permissions Matrix
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            System-level capabilities mapped across administrative clearance levels. Enforced by server guards and database authorization checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/admins/roles"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Roles Overview
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[280px]">Capability / Scope</th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    className="py-3 px-3 text-center min-w-[100px] border-l border-zinc-800/60"
                  >
                    <span className="font-mono text-[10px] text-zinc-300">
                      {role.replace('_', ' ')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredScopes.map((scope) => (
                <React.Fragment key={scope.category}>
                  <tr className="bg-zinc-950/60 font-semibold text-zinc-300 text-[11px] tracking-wide">
                    <td
                      colSpan={ROLES.length + 1}
                      className="py-2.5 px-4 text-indigo-400 uppercase font-mono tracking-wider"
                    >
                      {scope.category}
                    </td>
                  </tr>
                  {scope.permissions.map((p) => (
                    <tr
                      key={p.key}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-zinc-200 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-zinc-500" />
                          {p.key}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          {p.description}
                        </div>
                      </td>
                      {ROLES.map((role) => {
                        const allowed = p.roles[role];
                        return (
                          <td
                            key={`${p.key}-${role}`}
                            className="py-3 px-3 text-center border-l border-zinc-800/60"
                          >
                            {allowed ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800/50 text-zinc-600">
                                <X className="w-3 h-3" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
