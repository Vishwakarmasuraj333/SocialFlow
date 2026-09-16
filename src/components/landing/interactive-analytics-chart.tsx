'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HeroChartProps {
  data: any[];
  theme: string;
}

export function HeroEngagementChart({ data, theme }: HeroChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#ffffff10' : '#00000010'} />
        <XAxis dataKey="name" stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={11} />
        <YAxis stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="instagram"
          stroke="#6366F1"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#heroGradient)"
        />
        <Area type="monotone" dataKey="linkedin" stroke="#0077B5" strokeWidth={2} fillOpacity={0} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface DeepChartProps {
  data: any[];
  theme: string;
}

export function DeepAnalyticsChart({ data, theme }: DeepChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="chartInsta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E1306C" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#E1306C" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="chartTiktok" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#ffffff10' : '#00000010'} />
        <XAxis dataKey="name" stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={11} />
        <YAxis stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="instagram"
          stroke="#E1306C"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#chartInsta)"
          name="Instagram"
        />
        <Area
          type="monotone"
          dataKey="tiktok"
          stroke="#00F2FE"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#chartTiktok)"
          name="TikTok"
        />
        <Area type="monotone" dataKey="linkedin" stroke="#0077B5" strokeWidth={2} fillOpacity={0} name="LinkedIn" />
        <Area type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} fillOpacity={0} name="X" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
