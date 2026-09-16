'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function AuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?action=${actionFilter}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      showToast('Failed to load audit trail', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Security Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Security & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable log of publishing, member invites, authentication events, and administrative changes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          isLoading={isLoading}
          className="rounded-xl border-slate-200 dark:border-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Trail
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-x-auto scrollbar-none">
        {['ALL', 'AUTH_LOGIN', 'POST_CREATED', 'POST_PUBLISHED', 'ACCOUNT_CONNECTED', 'MEMBER_INVITED'].map((act) => (
          <button
            key={act}
            onClick={() => setActionFilter(act)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              actionFilter === act
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {act === 'ALL' ? 'All Operations' : act.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
            Event Log Stream ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-500">No matching audit events recorded.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                          ID: {log.entityId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>User: <b className="text-slate-800 dark:text-slate-200">{log.user?.name || 'System / Admin'}</b></span>
                      <span>•</span>
                      <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                      {log.metadataJson && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.metadataJson}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono self-end sm:self-center">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
