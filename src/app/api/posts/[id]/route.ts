import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, email: true } },
      campaign: true,
      targets: true,
      approvals: {
        include: {
          reviewer: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isSuper = Boolean(auth.user?.isSuperAdmin);
  if (!isSuper && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:edit'))) {
    return NextResponse.json({ error: 'Permission denied: cannot edit posts' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const whereCondition: any = { id };
  if (!isSuper && auth.workspace) {
    whereCondition.workspaceId = auth.workspace.id;
  }

  const post = await prisma.post.findFirst({
    where: whereCondition,
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const contentToSave = body.globalContent !== undefined ? body.globalContent : body.content;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(contentToSave !== undefined ? { globalContent: contentToSave } : {}),
      ...(body.mediaUrls !== undefined ? { mediaUrlsJson: JSON.stringify(body.mediaUrls) } : {}),
      ...(body.campaignId !== undefined ? { campaignId: body.campaignId || null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.scheduledAt !== undefined ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null } : {}),
    },
    include: {
      targets: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  await logAuditEvent({
    workspaceId: post.workspaceId,
    userId: auth.user.id,
    action: 'POST_UPDATED',
    entityType: 'Post',
    entityId: id,
  });

  return NextResponse.json({ success: true, post: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isSuper = Boolean(auth.user?.isSuperAdmin);
  if (!isSuper && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:delete'))) {
    return NextResponse.json({ error: 'Permission denied: cannot delete posts' }, { status: 403 });
  }

  const { id } = await params;

  const whereCondition: any = { id };
  if (!isSuper && auth.workspace) {
    whereCondition.workspaceId = auth.workspace.id;
  }

  const post = await prisma.post.findFirst({
    where: whereCondition,
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const isPermanent =
    searchParams.get('permanent') === 'true' ||
    searchParams.get('mode') === 'permanent';

  if (isPermanent) {
    // Real / Permanent hard-delete from database
    await prisma.post.delete({
      where: { id },
    });

    await logAuditEvent({
      workspaceId: post.workspaceId,
      userId: auth.user.id,
      action: 'POST_PERMANENTLY_DELETED',
      entityType: 'Post',
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted from database',
      permanent: true,
    });
  }

  // Soft-delete to support Trash and recovery
  await prisma.post.update({
    where: { id },
    data: {
      isSoftDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAuditEvent({
    workspaceId: post.workspaceId,
    userId: auth.user.id,
    action: 'POST_SOFT_DELETED',
    entityType: 'Post',
    entityId: id,
  });

  return NextResponse.json({ success: true, message: 'Post moved to trash', permanent: false });
}

