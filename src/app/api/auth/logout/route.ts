import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, WORKSPACE_COOKIE_NAME, getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (auth?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'ADMIN_LOGOUT',
          entityType: 'User',
          entityId: auth.user.id,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
        },
      }).catch(() => {});
    }
  } catch {
    // Ignore audit log error
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(WORKSPACE_COOKIE_NAME);
  response.cookies.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' });
  response.cookies.set(WORKSPACE_COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return response;
}
