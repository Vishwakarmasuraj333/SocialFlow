'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Lock,
  ArrowLeft,
  Calendar,
  Terminal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function LoginActivityPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/security/events');
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events || []);
      }
    } catch {
      showToast('Failed to load security login activity', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(q) ||
      e.resource?.toLowerCase().includes(q) ||
      e.ipAddress?.toLowerCase().includes(q) ||
      e.admin?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Security Center
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Admin Login Activity & Security Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Audited security log of all administrative login attempts, password updates, and access denials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEvents}
          isLoading={isLoading}
          className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action, admin, IP address, or status..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <Badge variant="outline" className="text-[10px] font-mono">
          {filtered.length} Events
        </Badge>
      </div>

      {/* Events Stream */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No security events logged yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {evt.action.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                        evt.result === 'SUCCESS'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {evt.result}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate">
                    Admin: <b>{evt.admin?.name || evt.resource || 'Anonymous'}</b> ({evt.admin?.email || evt.resource}) • IP: <span className="font-mono">{evt.ipAddress || '127.0.0.1'}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(evt.createdAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-xs">
                    {evt.userAgent?.split(' ')[0] || 'Browser Client'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
