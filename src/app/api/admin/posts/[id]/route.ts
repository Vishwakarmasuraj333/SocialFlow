import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, email: true } },
        targets: {
          include: {
            socialAccount: {
              select: { id: true, accountName: true, accountHandle: true, avatarUrl: true, platform: true },
            },
          },
        },
        analytics: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let mediaUrls: string[] = [];
    try {
      if (post.mediaUrlsJson) mediaUrls = JSON.parse(post.mediaUrlsJson);
    } catch {}

    return NextResponse.json({
      post: {
        ...post,
        mediaUrls,
      },
    });
  } catch (error: any) {
    console.error('Error fetching post details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PATCH(
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

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title ? String(body.title).trim() : null;
    if (body.globalContent !== undefined) updateData.globalContent = String(body.globalContent).trim();
    if (body.mediaUrls !== undefined) {
      updateData.mediaUrlsJson = Array.isArray(body.mediaUrls) ? JSON.stringify(body.mediaUrls) : null;
    }
    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      if (body.scheduledAt && existing.status === 'DRAFT') {
        updateData.status = 'SCHEDULED';
      }
    }
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
      include: { targets: true },
    });

    await logAuditEvent({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      action: 'POST_UPDATED',
      entityType: 'Post',
      entityId: id,
      metadata: { changes: Object.keys(updateData) },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { targets: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if any published targets exist on platforms that don't support API deletion (Section 13)
    const publishedTargets = post.targets.filter((t) => t.publishStatus === 'PUBLISHED');
    const unsupportedPlatforms = publishedTargets
      .filter((t) => ['LINKEDIN', 'TIKTOK', 'PINTEREST'].includes(t.platform.toUpperCase()))
      .map((t) => t.platform);

    let platformDeletionNotice: string | null = null;
    if (unsupportedPlatforms.length > 0) {
      platformDeletionNotice = `${unsupportedPlatforms.join(', ')} official API does not support post deletion via third-party developer API. Post has been archived internally in SocialFlow trash.`;
    }

    // Soft delete / Move to Trash internally
    await prisma.post.update({
      where: { id },
      data: {
        isSoftDeleted: true,
        deletedAt: new Date(),
        status: post.status === 'PUBLISHED' ? 'PUBLISHED' : 'CANCELLED',
      },
    });

    await logAuditEvent({
      workspaceId: post.workspaceId,
      userId: auth.user.id,
      action: 'POST_DELETED',
      entityType: 'Post',
      entityId: id,
      metadata: {
        wasPublished: publishedTargets.length > 0,
        platformNotice: platformDeletionNotice,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted and moved to trash successfully.',
      platformDeletionNotice,
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
