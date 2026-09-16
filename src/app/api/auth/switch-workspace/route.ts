import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, WORKSPACE_COOKIE_NAME, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workspaceId } = await req.json();
  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  // Check if user is a member of the workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.user.id,
      },
    },
    include: { workspace: true },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Access to workspace denied' }, { status: 403 });
  }

  // Refresh token with new active workspace and role
  const token = await signSessionToken({
    userId: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    isSuperAdmin: auth.user.isSuperAdmin,
    workspaceId: membership.workspaceId,
    role: membership.role,
  });

  const response = NextResponse.json({
    success: true,
    activeWorkspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      role: membership.role,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
  });

  response.cookies.set(WORKSPACE_COOKIE_NAME, workspaceId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 3600,
  });

  return response;
}
