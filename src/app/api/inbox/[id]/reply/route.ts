import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { decryptSecret } from '@/lib/encryption';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'inbox:reply')) {
    return NextResponse.json({ error: 'Permission denied: cannot reply to inbox items' }, { status: 403 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
  }

  const item = await prisma.inboxItem.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: {
      socialAccount: {
        include: { credentials: true },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: 'Inbox item not found' }, { status: 404 });
  }

  let platformReplyId: string | undefined;
  let status: 'SENT' | 'FAILED' = 'SENT';
  let errorMessage: string | undefined;

  // If credentials exist, dispatch reply via provider adapter
  if (item.socialAccount?.credentials) {
    try {
      const accessToken = decryptSecret(
        item.socialAccount.credentials.encryptedAccessToken,
        item.socialAccount.credentials.iv,
        item.socialAccount.credentials.authTag
      );

      const provider = providerFactory.getProvider(item.platform as PlatformType);
      const res = await provider.replyToComment(accessToken, item.platformItemId, content.trim());

      if (res.success) {
        platformReplyId = res.replyId;
      } else {
        status = 'FAILED';
        errorMessage = res.errorMessage;
      }
    } catch (err: unknown) {
      status = 'FAILED';
      errorMessage = err instanceof Error ? err.message : 'Reply dispatch failed';
    }
  }

  const reply = await prisma.inboxReply.create({
    data: {
      inboxItemId: item.id,
      authorId: auth.user.id,
      content: content.trim(),
      platformReplyId: platformReplyId || null,
      status,
      errorMessage: errorMessage || null,
      sentAt: status === 'SENT' ? new Date() : null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update inbox item status to REPLIED
  await prisma.inboxItem.update({
    where: { id: item.id },
    data: { status: 'REPLIED' },
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'INBOX_REPLY_SENT',
    entityType: 'InboxItem',
    entityId: item.id,
    metadata: { platform: item.platform, status },
  });

  return NextResponse.json({ success: true, reply });
}
