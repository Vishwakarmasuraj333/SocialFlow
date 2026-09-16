import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect('/admin/login');
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
