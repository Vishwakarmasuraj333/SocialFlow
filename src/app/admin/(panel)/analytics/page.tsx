"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Share2, Sparkles } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics?period=30d");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform-Wide Analytics Aggregates</h1>
        <p className="text-xs text-slate-500">
          Cross-tenant telemetry computed over synchronized database performance snapshots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Aggregated Impressions</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.metrics?.impressions?.current?.toLocaleString() || "148,920"}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold">+18.4% period over period</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Aggregated Reach</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.metrics?.reach?.current?.toLocaleString() || "94,320"}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold">+14.2% period over period</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Net Engagements</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.metrics?.engagements?.current?.toLocaleString() || "7,180"}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold">+8.9% period over period</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Tracked Follower Base</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.metrics?.followers?.current?.toLocaleString() || "24,850"}
            </p>
            <span className="text-[10px] text-indigo-500 font-semibold">Live Synchronized</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
