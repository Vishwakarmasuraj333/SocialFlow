"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2 } from "lucide-react";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/reports?format=csv");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `socialflow-system-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin System Reports</h1>
          <p className="text-xs text-slate-500">
            Generate and export cross-tenant performance, publishing audit trails, and system telemetry CSV reports.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleExport} disabled={downloading} className="gap-2">
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? "Generating CSV..." : "Export System Report (CSV)"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Full Platform Audit Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
            <p>
              Includes all user actions, security login events, OAuth credentials creation, post publishing statuses, and tenant isolation checkpoints.
            </p>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full text-xs">
              Download Audit Stream CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Aggregated 30-Day Channel Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
            <p>
              Daily telemetry table containing impressions, reach, net clicks, engagement rates, and follower growth across all 8 networks.
            </p>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full text-xs">
              Download Metrics Aggregates CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
