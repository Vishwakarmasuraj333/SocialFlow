import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Control Center — SocialFlow',
  description: 'Global system overview, workspace monitoring, user directory, system health, and audit logs.',
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect('/admin/login');
  }

  const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'ANALYST', 'VIEWER'];
  const isAuthorized = auth.user.isSuperAdmin || (auth.user.role && adminRoles.includes(auth.user.role));

  if (!isAuthorized) {
    redirect('/admin/login?error=forbidden');
  }

  const userWithWorkspaces = await prisma.user.findUnique({
    where: { id: auth.user.id },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  const workspaces = (userWithWorkspaces?.memberships || []).map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
  }));

  return (
    <DashboardShell
      user={{
        id: userWithWorkspaces?.id || auth.user.id,
        name: userWithWorkspaces?.name || auth.user.name,
        email: userWithWorkspaces?.email || auth.user.email,
        avatarUrl: userWithWorkspaces?.avatarUrl ?? auth.user.avatarUrl ?? null,
        isSuperAdmin: Boolean(userWithWorkspaces?.isSuperAdmin ?? auth.user.isSuperAdmin),
        role: userWithWorkspaces?.role || auth.user.role,
      }}
      activeWorkspace={auth.workspace || null}
      workspaces={workspaces}
    >
      {children}
    </DashboardShell>
  );
}
