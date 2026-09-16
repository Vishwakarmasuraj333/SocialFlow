import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Studio & Multi-Channel Composer',
  description: 'Draft, customize, preview, and dispatch posts simultaneously across all social channels.',
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
