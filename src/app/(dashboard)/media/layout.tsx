import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud Media Library & Assets',
  description: 'Manage, upload, tag, and organize brand images, videos, and creative assets.',
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
