import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance & Audience Growth Analytics',
  description: 'Deep multi-platform metrics, engagement curves, follower trajectories, and top-performing post intelligence.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
