import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, canPublishDirectly } from '@/lib/rbac';
import { executePostPublishing } from '@/services/publishing-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const campaignId = searchParams.get('campaignId');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    workspaceId: auth.workspace.id,
    isSoftDeleted: false,
  };

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (campaignId && campaignId !== 'ALL') {
    where.campaignId = campaignId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { globalContent: { contains: search } },
    ];
  }

  if (platform && platform !== 'ALL') {
    where.targets = {
      some: {
        platform,
      },
    };
  }

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, email: true },
        },
        campaign: {
          select: { id: true, name: true, color: true },
        },
        targets: true,
        approvals: {
          include: {
            reviewer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'posts:create')) {
    return NextResponse.json({ error: 'Permission denied: cannot create posts' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      globalContent,
      mediaUrls = [],
      targets = [], // Array<{ platform: string, customContent?: string }>
      campaignId,
      scheduledAt,
      timezone = 'UTC',
      publishNow = false,
      submitForApproval = false,
    } = body;

    if (!globalContent?.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    if (!targets.length) {
      return NextResponse.json({ error: 'At least one target social platform must be selected' }, { status: 400 });
    }

    let initialStatus = 'DRAFT';
    if (publishNow) {
      if (!canPublishDirectly(auth.workspace.role)) {
        return NextResponse.json({ error: 'Role lacks permission to publish directly. Please submit for approval.' }, { status: 403 });
      }
      initialStatus = 'PUBLISHING';
    } else if (submitForApproval) {
      initialStatus = 'PENDING_APPROVAL';
    } else if (scheduledAt) {
      initialStatus = 'SCHEDULED';
    }

    const post = await prisma.post.create({
      data: {
        workspaceId: auth.workspace.id,
        authorId: auth.user.id,
        title: title?.trim() || null,
        globalContent: globalContent.trim(),
        mediaUrlsJson: mediaUrls.length ? JSON.stringify(mediaUrls) : null,
        status: initialStatus,
        campaignId: campaignId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        timezone,
        targets: {
          create: targets.map((t: { platform: string; customContent?: string }) => ({
            platform: t.platform,
            customContent: t.customContent?.trim() || null,
            publishStatus: 'PENDING',
          })),
        },
        ...(submitForApproval
          ? {
              approvals: {
                create: {
                  status: 'PENDING',
                  feedback: 'Submitted for manager review.',
                },
              },
            }
          : {}),
      },
      include: {
        targets: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'POST_CREATED',
      entityType: 'Post',
      entityId: post.id,
      metadata: { status: initialStatus, targetPlatforms: targets.map((t: { platform: string }) => t.platform) },
    });

    // If instant publishing was requested, trigger publisher
    if (publishNow) {
      const publishResult = await executePostPublishing(post.id);
      return NextResponse.json({ success: true, post, publishResult });
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create post';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
