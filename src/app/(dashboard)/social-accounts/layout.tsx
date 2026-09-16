import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connected Social Accounts & Channels',
  description: 'Manage official integrations, channel credentials, and publishing permissions across verified enterprise social networks.',
};

export default function SocialAccountsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
