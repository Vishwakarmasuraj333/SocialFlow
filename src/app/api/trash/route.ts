import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceIdParam = searchParams.get('workspaceId');

  let where: any = { isSoftDeleted: true };
  if (auth.user.isSuperAdmin && !workspaceIdParam) {
    where = { isSoftDeleted: true };
  } else if (workspaceIdParam) {
    where = { isSoftDeleted: true, workspaceId: workspaceIdParam };
  } else if (auth.workspace) {
    where = { isSoftDeleted: true, workspaceId: auth.workspace.id };
  } else {
    return NextResponse.json({ posts: [] });
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
      },
      author: { select: { id: true, name: true, avatarUrl: true, email: true } },
      campaign: { select: { id: true, name: true, color: true } },
      targets: true,
    },
    orderBy: { deletedAt: 'desc' },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, postIds, action, workspaceId } = await req.json();

  if (!postId && (!postIds || !postIds.length) && action !== 'EMPTY_TRASH' && action !== 'RESTORE_ALL') {
    return NextResponse.json({ error: 'Post ID or postIds array is required' }, { status: 400 });
  }

  const isSuperAdmin = Boolean(auth.user.isSuperAdmin);
  const targetWorkspaceId = workspaceId || auth.workspace?.id;

  // RESTORE ALL
  if (action === 'RESTORE_ALL') {
    if (!isSuperAdmin && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:edit'))) {
      return NextResponse.json({ error: 'Permission denied: cannot restore posts' }, { status: 403 });
    }

    const whereClause: any = { isSoftDeleted: true };
    if (targetWorkspaceId) {
      whereClause.workspaceId = targetWorkspaceId;
    } else if (!isSuperAdmin && auth.workspace) {
      whereClause.workspaceId = auth.workspace.id;
    }

    const result = await prisma.post.updateMany({
      where: whereClause,
      data: {
        isSoftDeleted: false,
        deletedAt: null,
      },
    });

    if (targetWorkspaceId) {
      await logAuditEvent({
        workspaceId: targetWorkspaceId,
        userId: auth.user.id,
        action: 'ALL_POSTS_RESTORED',
        entityType: 'Workspace',
        entityId: targetWorkspaceId,
        metadata: { restoredCount: result.count },
      });
    }

    return NextResponse.json({
      success: true,
      message: `All ${result.count} post(s) restored to active feed successfully.`,
      count: result.count,
    });
  }

  // RESTORE (Single or Multiple)
  if (action === 'RESTORE') {
    const idsToRestore: string[] = postIds && postIds.length ? postIds : (postId ? [postId] : []);

    if (!idsToRestore.length) {
      return NextResponse.json({ error: 'No posts to restore' }, { status: 400 });
    }

    if (!isSuperAdmin && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:edit'))) {
      return NextResponse.json({ error: 'Permission denied: cannot restore posts' }, { status: 403 });
    }

    const whereClause: any = {
      id: { in: idsToRestore },
      isSoftDeleted: true,
    };
    if (!isSuperAdmin && auth.workspace) {
      whereClause.workspaceId = auth.workspace.id;
    }

    const result = await prisma.post.updateMany({
      where: whereClause,
      data: {
        isSoftDeleted: false,
        deletedAt: null,
      },
    });

    if (auth.workspace) {
      await logAuditEvent({
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        action: 'POSTS_RESTORED',
        entityType: 'Post',
        metadata: { count: result.count, ids: idsToRestore },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} post(s) restored to active feed successfully.`,
      count: result.count,
    });
  }

  // PERMANENT_DELETE (Single or Multiple)
  if (action === 'PERMANENT_DELETE') {
    const idsToDelete: string[] = postIds && postIds.length ? postIds : (postId ? [postId] : []);

    if (!idsToDelete.length) {
      return NextResponse.json({ error: 'No posts specified to delete' }, { status: 400 });
    }

    if (!isSuperAdmin && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:delete'))) {
      return NextResponse.json({ error: 'Permission denied: cannot purge posts' }, { status: 403 });
    }

    const whereClause: any = {
      id: { in: idsToDelete },
      isSoftDeleted: true,
    };
    if (!isSuperAdmin && auth.workspace) {
      whereClause.workspaceId = auth.workspace.id;
    }

    const result = await prisma.post.deleteMany({
      where: whereClause,
    });

    if (auth.workspace) {
      await logAuditEvent({
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        action: 'POSTS_PERMANENTLY_PURGED',
        entityType: 'Post',
        metadata: { count: result.count, ids: idsToDelete },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} post(s) permanently purged from database.`,
      count: result.count,
      permanent: true,
    });
  }

  // EMPTY_TRASH (Purges all soft-deleted items)
  if (action === 'EMPTY_TRASH') {
    if (!isSuperAdmin && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:delete'))) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const deleteWhere: any = { isSoftDeleted: true };
    if (targetWorkspaceId) {
      deleteWhere.workspaceId = targetWorkspaceId;
    } else if (!isSuperAdmin && auth.workspace) {
      deleteWhere.workspaceId = auth.workspace.id;
    }

    const result = await prisma.post.deleteMany({
      where: deleteWhere,
    });

    if (targetWorkspaceId) {
      await logAuditEvent({
        workspaceId: targetWorkspaceId,
        userId: auth.user.id,
        action: 'TRASH_EMPTIED',
        entityType: 'Workspace',
        entityId: targetWorkspaceId,
        metadata: { deletedCount: result.count },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Trash emptied completely (${result.count} items purged from database).`,
      count: result.count,
      permanent: true,
    });
  }

  return NextResponse.json({ error: 'Invalid trash action' }, { status: 400 });
}
