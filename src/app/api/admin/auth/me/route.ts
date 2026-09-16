import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        isSuperAdmin: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        memberships: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                timezone: true,
                currency: true,
                website: true,
                businessEmail: true,
              },
            },
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    const currentWorkspace =
      admin.memberships.find((m) => m.workspaceId === auth.workspace?.id)?.workspace ||
      admin.memberships[0]?.workspace ||
      null;

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || (admin.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'),
        status: admin.status,
        avatarUrl: admin.avatarUrl,
        isSuperAdmin: admin.isSuperAdmin || admin.role === 'SUPER_ADMIN',
        lastLoginAt: admin.lastLoginAt,
        lastLoginIp: admin.lastLoginIp,
        createdAt: admin.createdAt,
      },
      company: currentWorkspace,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin profile' }, { status: 500 });
  }
}
