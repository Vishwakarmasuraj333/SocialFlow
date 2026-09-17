import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid administrative session required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: admin.user,
      workspace: admin.workspace,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
