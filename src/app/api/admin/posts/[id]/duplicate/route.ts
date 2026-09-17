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
    const post = await prisma.post.findUnique({
      where: { id },
      include: { targets: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Avoid infinite (Copy) (Copy) stacking
    let cleanTitle = post.title;
    if (cleanTitle) {
      const stripped = cleanTitle.replace(/(\s*\((Copy(\s*\d+)?)\))+$/i, '').trim();
      cleanTitle = `${stripped} (Copy)`;
    }

    const duplicated = await prisma.post.create({
      data: {
        workspaceId: post.workspaceId,
        authorId: auth.user.id,
        title: cleanTitle,
        globalContent: post.globalContent,
        mediaUrlsJson: post.mediaUrlsJson,
        status: 'DRAFT',
        timezone: post.timezone,
        targets: {
          create: post.targets.map((t) => ({
            platform: t.platform,
            socialAccountId: t.socialAccountId,
            customContent: t.customContent,
            publishStatus: 'PENDING',
          })),
        },
      },
      include: { targets: true },
    });

    await logAuditEvent({
      workspaceId: post.workspaceId,
      userId: auth.user.id,
      action: 'POST_DUPLICATED',
      entityType: 'Post',
      entityId: duplicated.id,
      metadata: { originalPostId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Post duplicated as draft successfully.',
      post: duplicated,
    });
  } catch (error: any) {
    console.error('Error duplicating post:', error);
    return NextResponse.json({ error: error.message || 'Failed to duplicate post' }, { status: 500 });
  }
}
