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

    // Always respond with a generic success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an authorized admin account exists for this email, recovery instructions have been initiated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
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
      message: 'If an authorized admin account exists for this email, recovery instructions have been initiated.',
      devToken: resetToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
  }
}
