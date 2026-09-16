import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET active sessions for current user
export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ sessions });
}

// DELETE a specific session or revoke all other sessions
export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const revokeAllOthers = searchParams.get('allOthers') === 'true';

    if (revokeAllOthers) {
      // Delete all sessions for user except current (or keep newest)
      const allSessions = await prisma.session.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (allSessions.length > 1) {
        const keepId = allSessions[0].id;
        await prisma.session.deleteMany({
          where: {
            userId: auth.user.id,
            id: { not: keepId },
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'REVOKE_SESSIONS',
          entityType: 'Session',
          metadataJson: JSON.stringify({ action: 'REVOKE_ALL_OTHER_SESSIONS' }),
        },
      });

      return NextResponse.json({ message: 'All other sessions have been signed out' });
    }

    if (sessionId) {
      await prisma.session.deleteMany({
        where: {
          id: sessionId,
          userId: auth.user.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: 'REVOKE_SESSION',
          entityType: 'Session',
          entityId: sessionId,
        },
      });

      return NextResponse.json({ message: 'Session revoked successfully' });
    }

    return NextResponse.json({ error: 'Session ID or allOthers flag required' }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to revoke session';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
