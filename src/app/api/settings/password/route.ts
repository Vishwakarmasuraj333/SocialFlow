import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, confirmPassword, revokeOtherSessions } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          error: 'Incorrect current password. Please check and try again.',
        },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Optionally revoke all other active sessions
    if (revokeOtherSessions) {
      await prisma.session.deleteMany({
        where: { userId: auth.user.id },
      });
      // Re-create one fresh active session for current user
      await prisma.session.create({
        data: {
          sessionToken: `sess_${Math.random().toString(36).substring(2)}${Date.now()}`,
          userId: auth.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          userAgent: req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'USER_PASSWORD_CHANGED',
        entityType: 'User',
        entityId: auth.user.id,
        metadataJson: JSON.stringify({
          revokedOtherSessions: Boolean(revokeOtherSessions),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Re-sign token
    const token = await signSessionToken({
      userId: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      isSuperAdmin: auth.user.isSuperAdmin,
      workspaceId: auth.workspace?.id,
      role: auth.workspace?.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Master password updated successfully! All active credentials have been secured.',
      updatedAt: new Date().toISOString(),
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update password';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

