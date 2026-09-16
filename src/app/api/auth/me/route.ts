import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
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
    logoUrl: m.workspace.logoUrl,
    role: m.role,
  }));

  return NextResponse.json({
    authenticated: true,
    user: auth.user,
    activeWorkspace: auth.workspace,
    workspaces,
  });
}
