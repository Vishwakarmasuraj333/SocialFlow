import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { checkSystemHealth } from '@/services/system-health-service';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const health = await checkSystemHealth();
  return NextResponse.json({
    ...health,
    health,
  });
}
