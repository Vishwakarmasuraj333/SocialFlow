import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, WORKSPACE_COOKIE_NAME, getAuthContext } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: { sessionToken: token },
      });
    }

    if (auth?.user) {
      await prisma.securityEvent.create({
        data: {
          adminId: auth.user.id,
          action: 'LOGOUT',
          resource: auth.user.email,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
          result: 'SUCCESS',
        },
      });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(WORKSPACE_COOKIE_NAME);

    return NextResponse.json({ success: true, message: 'Admin logged out' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Logout error' }, { status: 500 });
  }
}
