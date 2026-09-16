'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolesMatrixPage() {
  const roles = [
    {
      role: 'SUPER_ADMIN',
      desc: 'Platform owner with unrestricted global authorization across all modules and admins.',
      badge: 'destructive',
      permissions: [
        'dashboard.read',
        'company.update',
        'website.all',
        'domain.all',
        'dns.all',
        'social.all',
        'post.all',
        'media.all',
        'infrastructure.all',
        'admin.all',
        'security.all',
        'settings.all',
      ],
    },
    {
      role: 'ADMIN',
      desc: 'Full operational control over company fleet, publishing, media, and infrastructure.',
      badge: 'default',
      permissions: [
        'dashboard.read',
        'company.update',
        'website.all',
        'domain.all',
        'dns.all',
        'social.all',
        'post.all',
        'media.all',
        'infrastructure.all',
        'security.read',
        'settings.all',
      ],
    },
    {
      role: 'MANAGER',
      desc: 'Supervises content campaigns, team workflows, and post approval pipelines.',
      badge: 'outline',
      permissions: [
        'dashboard.read',
        'website.read',
        'social.publish',
        'post.create',
        'post.edit',
        'post.approve',
        'post.publish',
        'media.all',
        'analytics.read',
      ],
    },
    {
      role: 'EDITOR',
      desc: 'Content authoring across social channels, web CMS, and digital asset library.',
      badge: 'secondary',
      permissions: [
        'dashboard.read',
        'website.read',
        'post.create',
        'post.edit',
        'media.create',
        'analytics.read',
      ],
    },
    {
      role: 'ANALYST',
      desc: 'Read-only access to engagement telemetry, audience metrics, and reporting.',
      badge: 'secondary',
      permissions: ['dashboard.read', 'analytics.read', 'security.read'],
    },
    {
      role: 'VIEWER',
      desc: 'Restricted inspection observer with zero mutation privileges.',
      badge: 'outline',
      permissions: ['dashboard.read'],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/admins" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Directory
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          Role-Based Access Control (RBAC) Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Pre-configured role policies enforced via server-side session checks and middleware authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <Card key={r.role} className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-white">{r.role}</h3>
                <Badge variant={r.badge as any}>{r.role}</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                {r.permissions.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
