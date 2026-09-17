import { NextRequest, NextResponse } from 'next/server';
import { validateAdminLogin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const result = await validateAdminLogin(
      email,
      password,
      Boolean(rememberMe),
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid email or password.' },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user: result.user,
      workspace: result.workspace,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error during authentication';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
