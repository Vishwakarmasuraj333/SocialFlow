import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Workflow & Approvals',
  description: 'Review pending draft submissions, request revisions, and approve social posts before publishing.',
};

export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
