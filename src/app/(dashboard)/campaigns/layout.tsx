import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Management & Attribution',
  description: 'Organize, tag, and track end-to-end multi-channel marketing campaigns.',
};

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
