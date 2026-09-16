import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { canApprovePosts } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const approvals = await prisma.approval.findMany({
    where: {
      post: {
        workspaceId: auth.workspace.id,
        isSoftDeleted: false,
      },
    },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, email: true } },
          targets: true,
          campaign: { select: { id: true, name: true, color: true } },
        },
      },
      reviewer: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ approvals });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canApprovePosts(auth.workspace.role)) {
    return NextResponse.json({ error: 'Permission denied: manager/admin role required for approvals' }, { status: 403 });
  }

  const { approvalId, action, feedback } = await req.json();

  if (!approvalId || !action) {
    return NextResponse.json({ error: 'approvalId and action (APPROVED | REJECTED | CHANGES_REQUESTED) are required' }, { status: 400 });
  }

  const approval = await prisma.approval.findFirst({
    where: { id: approvalId },
    include: { post: true },
  });

  if (!approval || approval.post.workspaceId !== auth.workspace.id) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
  }

  let newPostStatus = approval.post.status;
  if (action === 'APPROVED') {
    newPostStatus = approval.post.scheduledAt ? 'SCHEDULED' : 'APPROVED';
  } else if (action === 'REJECTED') {
    newPostStatus = 'DRAFT';
  } else if (action === 'CHANGES_REQUESTED') {
    newPostStatus = 'DRAFT';
  }

  const [updatedApproval] = await prisma.$transaction([
    prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: action,
        reviewerId: auth.user.id,
        feedback: feedback || null,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    }),
    prisma.post.update({
      where: { id: approval.postId },
      data: { status: newPostStatus },
    }),
    prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: approval.post.authorId,
        type: 'APPROVAL_STATUS',
        title: `Post Review: ${action.replace(/_/g, ' ')}`,
        message: `${auth.user.name} reviewed your post "${approval.post.title || approval.post.globalContent.slice(0, 30)}...": ${action}.`,
        linkUrl: `/content/${approval.postId}`,
      },
    }),
  ]);

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: `POST_APPROVAL_${action}`,
    entityType: 'Approval',
    entityId: approvalId,
    metadata: { postId: approval.postId, feedback },
  });

  return NextResponse.json({ success: true, approval: updatedApproval });
}
