import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols' },
        { status: 400 }
      );
    }

    // Password complexity check
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        { error: 'Password must include uppercase, lowercase, number, and special character.' },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { resetPasswordToken: hashedToken },
          { resetPasswordToken: token },
        ],
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: user.id,
        action: 'PASSWORD_CHANGED',
        resource: user.email,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
        result: 'SUCCESS',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. You may now log in with your new administrative credentials.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
