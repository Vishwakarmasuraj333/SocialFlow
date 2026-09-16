import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthContext } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/jwt';
import prisma from '@/lib/db';

// GET: List active admin sessions with enriched client & security metadata
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Clean up expired sessions automatically
    await prisma.session.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });

    const rawSessions = await prisma.session.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, isSuperAdmin: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sessions = rawSessions.map((sess) => {
      const isCurrent = Boolean(currentToken && sess.sessionToken === currentToken);
      const ua = sess.userAgent || '';

      let browser = 'Google Chrome';
      if (ua.includes('Edg/')) browser = 'Microsoft Edge';
      else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
      else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
      else if (ua.includes('Chrome/')) browser = 'Google Chrome';
      else if (ua.includes('Postman') || ua.includes('curl')) browser = 'API Client';

      let os = 'Windows 11 PC';
      if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
      else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS Workstation';
      else if (ua.includes('iPhone')) os = 'iOS (iPhone)';
      else if (ua.includes('Android')) os = 'Android Mobile';
      else if (ua.includes('Linux')) os = 'Linux Server';

      let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
      if (ua.includes('Mobi') || ua.includes('iPhone') || ua.includes('Android')) {
        deviceType = 'mobile';
      } else if (ua.includes('iPad') || ua.includes('Tablet')) {
        deviceType = 'tablet';
      }

      let ip = sess.ipAddress || '127.0.0.1';
      if (ip === '::1' || ip === '127.0.0.1') {
        ip = '127.0.0.1 (Local Workstation)';
      }

      return {
        id: sess.id,
        userId: sess.userId,
        createdAt: sess.createdAt,
        expiresAt: sess.expiresAt,
        sessionTokenSnippet: `sf_${sess.sessionToken.slice(0, 8)}...${sess.sessionToken.slice(-4)}`,
        ipAddress: ip,
        browser,
        os,
        deviceType,
        isCurrent,
        user: sess.user,
      };
    });

    return NextResponse.json({
      sessions,
      totalCount: sessions.length,
      currentSessionId: sessions.find((s) => s.isCurrent)?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch sessions' }, { status: 500 });
  }
}

// DELETE: Revoke single session, user sessions, or all other sessions
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const revokeOthers = searchParams.get('revokeOthers') === 'true';

    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Revoke all OTHER sessions except the currently active device
    if (revokeOthers) {
      if (!currentToken) {
        return NextResponse.json({ error: 'Current session token not detected' }, { status: 400 });
      }

      const result = await prisma.session.deleteMany({
        where: {
          userId: auth.user.id,
          sessionToken: { not: currentToken },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully revoked ${result.count} other active session(s). Your current session remains secure.`,
      });
    }

    if (userId) {
      // Revoke all sessions for a user
      await prisma.session.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true, message: 'All sessions revoked for administrator' });
    }

    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } });
      return NextResponse.json({ success: true, message: 'Administrative session terminated successfully' });
    }

    return NextResponse.json({ error: 'Session ID or User ID is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to revoke session' }, { status: 500 });
  }
}
