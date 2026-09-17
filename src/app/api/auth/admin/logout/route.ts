import { NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/admin-auth';

export async function POST() {
  try {
    await logoutAdmin();
    return NextResponse.json({
      success: true,
      message: 'Admin session terminated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error during logout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
