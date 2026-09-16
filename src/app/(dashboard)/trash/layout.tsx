import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recycle Bin & Content Recovery',
  description: 'View deleted posts, restore discarded drafts, or permanently purge media and campaigns.',
};

export default function TrashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
