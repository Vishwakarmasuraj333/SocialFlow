import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { executePostPublishing } from '@/services/publishing-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {
      isSoftDeleted: false,
    };

    if (auth.workspace && !auth.user.isSuperAdmin) {
      where.workspaceId = auth.workspace.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (platform && platform !== 'ALL') {
      where.targets = {
        some: {
          platform: platform.toUpperCase(),
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { globalContent: { contains: search } },
      ];
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, email: true },
          },
          targets: {
            include: {
              socialAccount: {
                select: { id: true, accountName: true, accountHandle: true, avatarUrl: true, platform: true },
              },
            },
          },
          analytics: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin posts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      globalContent,
      mediaUrls = [],
      targets = [], // Array<{ platform: string, customContent?: string, socialAccountId?: string }>
      scheduledAt,
      timezone = 'UTC',
      publishNow = false,
      workspaceId,
    } = body;

    if (!globalContent?.trim()) {
      return NextResponse.json({ error: 'Post content/caption is required' }, { status: 400 });
    }

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: 'At least one destination social channel must be selected' }, { status: 400 });
    }

    const targetWorkspaceId = workspaceId || auth.workspace?.id;
    if (!targetWorkspaceId) {
      return NextResponse.json({ error: 'Target workspace is required' }, { status: 400 });
    }

    let initialStatus = 'DRAFT';
    if (publishNow) {
      initialStatus = 'PUBLISHING';
    } else if (scheduledAt) {
      initialStatus = 'SCHEDULED';
    }

    const post = await prisma.post.create({
      data: {
        workspaceId: targetWorkspaceId,
        authorId: auth.user.id,
        title: title?.trim() || null,
        globalContent: globalContent.trim(),
        mediaUrlsJson: mediaUrls && mediaUrls.length ? JSON.stringify(mediaUrls) : null,
        status: initialStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        timezone: timezone || 'UTC',
        targets: {
          create: targets.map((t: any) => ({
            platform: String(t.platform).toUpperCase(),
            socialAccountId: t.socialAccountId || null,
            customContent: t.customContent?.trim() || null,
            publishStatus: 'PENDING',
          })),
        },
      },
      include: {
        targets: true,
        author: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      workspaceId: targetWorkspaceId,
      userId: auth.user.id,
      action: 'POST_CREATED',
      entityType: 'Post',
      entityId: post.id,
      metadata: { status: initialStatus, targets: targets.map((t: any) => t.platform) },
    });

    if (publishNow) {
      const publishResult = await executePostPublishing(post.id);
      return NextResponse.json({ success: true, post, publishResult });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating admin post:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}
