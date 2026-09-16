import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { scheduledAt, timezone = 'UTC' } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt date/time is required' }, { status: 400 });
    }

    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime()) || scheduleDate.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduleDate,
        timezone,
      },
    });

    await logAuditEvent({
      workspaceId: updated.workspaceId,
      userId: auth.user.id,
      action: 'POST_SCHEDULED',
      entityType: 'Post',
      entityId: id,
      metadata: { scheduledAt: scheduleDate.toISOString(), timezone },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Error scheduling post:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule post' }, { status: 500 });
  }
}
