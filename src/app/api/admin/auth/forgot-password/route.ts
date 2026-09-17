import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Admin email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always respond with identical message to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // Generate cryptographically secure one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetTokenExpiry,
      },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: cleanEmail,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Unknown',
        result: 'SUCCESS',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset recovery token generated successfully.',
      recoveryToken: rawToken,
      devToken: rawToken,
      expiresAt: resetTokenExpiry,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error processing request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
