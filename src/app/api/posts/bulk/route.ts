import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postIds, action, campaignId } = await req.json();

  if (!Array.isArray(postIds) || !postIds.length) {
    return NextResponse.json({ error: 'postIds array is required' }, { status: 400 });
  }

  if (action === 'PERMANENT_DELETE') {
    if (!hasPermission(auth.workspace.role, 'posts:delete')) {
      return NextResponse.json({ error: 'Permission denied: cannot delete posts' }, { status: 403 });
    }

    await prisma.post.deleteMany({
      where: {
        id: { in: postIds },
        workspaceId: auth.workspace.id,
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'POSTS_BULK_PERMANENTLY_DELETED',
      entityType: 'Post',
      metadata: { count: postIds.length, postIds },
    });

    return NextResponse.json({
      success: true,
      message: `${postIds.length} post(s) permanently deleted from database.`,
      permanent: true,
    });
  }

  if (action === 'DELETE') {
    if (!hasPermission(auth.workspace.role, 'posts:delete')) {
      return NextResponse.json({ error: 'Permission denied: cannot delete posts' }, { status: 403 });
    }

    await prisma.post.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: auth.workspace.id,
      },
      data: {
        isSoftDeleted: true,
        deletedAt: new Date(),
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'POSTS_BULK_DELETED',
      entityType: 'Post',
      metadata: { count: postIds.length, postIds },
    });

    return NextResponse.json({
      success: true,
      message: `${postIds.length} post(s) moved to trash successfully.`,
      permanent: false,
    });
  }

  if (action === 'DRAFT') {
    if (!hasPermission(auth.workspace.role, 'posts:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await prisma.post.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: auth.workspace.id,
      },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${postIds.length} post(s) moved to Draft status.`,
    });
  }

  if (action === 'ASSIGN_CAMPAIGN') {
    if (!hasPermission(auth.workspace.role, 'posts:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await prisma.post.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: auth.workspace.id,
      },
      data: {
        campaignId: campaignId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${postIds.length} post(s) updated.`,
    });
  }

  return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 });
}
