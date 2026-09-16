import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Only scheduled posts can be cancelled' }, { status: 400 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    await logAuditEvent({
      workspaceId: post.workspaceId,
      userId: auth.user.id,
      action: 'POST_SCHEDULE_CANCELLED',
      entityType: 'Post',
      entityId: id,
      metadata: { previousStatus: 'SCHEDULED', newStatus: 'DRAFT' },
    });

    return NextResponse.json({
      success: true,
      message: 'Post schedule cancelled and returned to draft.',
      post: updated,
    });
  } catch (error: any) {
    console.error('Error cancelling post schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel schedule' }, { status: 500 });
  }
}
