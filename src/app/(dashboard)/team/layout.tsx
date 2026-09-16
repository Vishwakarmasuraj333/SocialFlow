import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Members & RBAC Permissions',
  description: 'Manage agency collaborators, invite team members, and assign role-based access control.',
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
