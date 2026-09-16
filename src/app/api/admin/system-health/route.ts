import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { checkSystemHealth } from '@/services/system-health-service';

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const health = await checkSystemHealth();
    return NextResponse.json({
      ...health,
      health,
    });
  } catch (error: any) {
    console.error('System health check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to probe system health' },
      { status: 500 }
    );
  }
}
