import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { getWorkspaceAnalytics } from '@/services/analytics-service';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');
  const platform = searchParams.get('platform') || 'ALL';

  const analytics = await getWorkspaceAnalytics(auth.workspace.id, days, platform);

  return NextResponse.json({ analytics });
}
