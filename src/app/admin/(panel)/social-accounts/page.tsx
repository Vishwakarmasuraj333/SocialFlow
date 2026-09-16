"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function AdminSocialAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/admin/social-accounts");
        const data = await res.json();
        if (data.accounts) {
          setAccounts(data.accounts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connected Social Channels</h1>
        <p className="text-xs text-slate-500">
          Global monitor for platform OAuth tokens, encryption health, and background sync statuses.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Platform & Channel</th>
                  <th className="px-6 py-3.5">Token Encryption</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Sync</th>
                  <th className="px-6 py-3.5 text-right">Connected Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Loading channel records...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No active social accounts connected.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {acc.platform}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">@{acc.accountHandle || acc.name || acc.accountName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50">
                          AES-256-GCM Encrypted
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={acc.status === "CONNECTED" ? "success" : "warning"}>
                          {acc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {acc.lastSyncedAt ? format(new Date(acc.lastSyncedAt), "MMM d · h:mm a") : "Synchronized"}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono">
                        {acc.createdAt ? format(new Date(acc.createdAt), "MMM d, yyyy") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
