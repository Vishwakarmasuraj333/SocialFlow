"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Share2, Layers, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/admin/workspaces");
        const data = await res.json();
        if (data.workspaces) {
          setWorkspaces(data.workspaces);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Tenancy</h1>
        <p className="text-xs text-slate-500">
          Manage isolated tenant workspaces, channel counts, and organization members.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Workspace</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Members</th>
                  <th className="px-6 py-3.5">Connected Channels</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Isolation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Loading workspace records...
                    </td>
                  </tr>
                ) : workspaces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No workspaces found.
                    </td>
                  </tr>
                ) : (
                  workspaces.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {w.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">{w.slug}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {w.members?.length || 0} Members
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {w.socialAccounts?.length || 0} Accounts
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {w.createdAt ? format(new Date(w.createdAt), "MMM d, yyyy") : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Isolated
                        </span>
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
