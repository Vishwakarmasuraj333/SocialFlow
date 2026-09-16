import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Content Calendar & Planner',
  description: 'Visual drag-and-drop editorial calendar for scheduling and planning multi-network campaigns.',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
