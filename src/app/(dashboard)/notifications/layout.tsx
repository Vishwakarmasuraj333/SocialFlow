import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity Notifications & Alerts',
  description: 'View real-time notifications, workspace alerts, publishing logs, and team mentions.',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
