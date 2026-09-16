import { NextResponse } from 'next/server';
import { processDueScheduledPosts } from '@/services/scheduler-service';

export async function GET() {
  try {
    const result = await processDueScheduledPosts();
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron execution failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
