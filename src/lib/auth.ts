import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './db';
export * from './jwt';
import { verifySessionToken, SESSION_COOKIE_NAME, WORKSPACE_COOKIE_NAME } from './jwt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AuthUserContext {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
    isSuperAdmin: boolean;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
}


export async function getAuthContext(): Promise<AuthUserContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isSuperAdmin: true,
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) return null;

    // Check active workspace preference in cookies, otherwise default to first active membership
    const preferredWorkspaceId = cookieStore.get(WORKSPACE_COOKIE_NAME)?.value;
    const activeMembership =
      user.memberships.find((m) => m.workspaceId === preferredWorkspaceId) ||
      user.memberships[0];

    const workspace = activeMembership
      ? {
          id: activeMembership.workspace.id,
          name: activeMembership.workspace.name,
          slug: activeMembership.workspace.slug,
          role: activeMembership.role,
        }
      : null;

    const isSuper = Boolean(user.isSuperAdmin || user.role === 'SUPER_ADMIN' || payload.isSuperAdmin);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role || payload.role || (isSuper ? 'SUPER_ADMIN' : 'ADMIN'),
        isSuperAdmin: isSuper,
      },
      workspace,
    };
  } catch {
    return null;
  }
}
