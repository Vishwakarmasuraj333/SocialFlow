import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unified Social Inbox & Engagement',
  description: 'Monitor messages, reply to comments, and manage social audience conversations across all connected channels.',
};

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
