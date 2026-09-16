import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Dispatch & Publishing Queue',
  description: 'Monitor active dispatches, scheduled queue items, retry failed posts, and track network delivery status.',
};

export default function PublishingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
