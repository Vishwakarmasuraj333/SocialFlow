import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Reports & PDF Exports',
  description: 'Generate executive analytics reports, export multi-platform CSV tables, and schedule automated report deliveries.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
