import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'posts:create')) {
    return NextResponse.json({ error: 'Permission denied: cannot schedule posts' }, { status: 403 });
  }

  const { id } = await params;
  const { scheduledAt, timezone } = await req.json();

  if (!scheduledAt) {
    return NextResponse.json({ error: 'Scheduled date/time is required' }, { status: 400 });
  }

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || post.timezone,
    },
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'POST_SCHEDULED',
    entityType: 'Post',
    entityId: id,
    metadata: { scheduledAt },
  });

  return NextResponse.json({ success: true, post: updated });
}
