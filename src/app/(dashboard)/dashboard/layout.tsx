import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Analytics & Performance Overview',
  description: 'Real-time multi-platform performance metrics, audience reach, and campaign tracking.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
