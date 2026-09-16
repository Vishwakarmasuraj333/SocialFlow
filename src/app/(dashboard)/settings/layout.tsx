import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace & Security Settings',
  description: 'Manage workspace profile, brand identity, API credentials, webhooks, and security settings.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
