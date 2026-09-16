import prisma from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';
import { providerFactory } from './social/provider-factory';
import { PlatformType } from './social/types';
import { logAuditEvent } from '@/lib/audit';

export interface PublishExecutionResult {
  postId: string;
  overallStatus: 'PUBLISHED' | 'FAILED' | 'PARTIAL';
  errorMessage?: string;
  targets: Array<{
    platform: string;
    status: 'PUBLISHED' | 'FAILED';
    platformPostId?: string;
    platformUrl?: string;
    errorMessage?: string;
  }>;
}

export async function executePostPublishing(postId: string): Promise<PublishExecutionResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      targets: true,
      workspace: {
        include: {
          socialAccounts: {
            where: { isSoftDeleted: false },
            include: {
              credentials: true,
            },
          },
        },
      },
      author: true,
    },
  });

  if (!post) {
    throw new Error(`Post with ID ${postId} not found`);
  }

  // Idempotency check: if post is already actively publishing within the last 30s, prevent race conditions
  if (post.status === 'PUBLISHING' && post.updatedAt && (Date.now() - post.updatedAt.getTime() < 30000)) {
    throw new Error(`Post ${postId} is already being processed by publisher queue.`);
  }

  // Set atomic publishing lock
  await prisma.post.update({
    where: { id: postId },
    data: { status: 'PUBLISHING', errorMessage: null },
  });

  const parsedMediaUrls: string[] = post.mediaUrlsJson ? JSON.parse(post.mediaUrlsJson) : [];
  const targetResults: PublishExecutionResult['targets'] = [];

  for (const target of post.targets) {
    const platform = target.platform.toUpperCase() as PlatformType;
    
    // Look up by specific socialAccountId if linked, or by platform
    const account = target.socialAccountId
      ? post.workspace.socialAccounts.find((a) => a.id === target.socialAccountId && a.status === 'CONNECTED')
      : post.workspace.socialAccounts.find((a) => a.platform.toUpperCase() === platform && a.status === 'CONNECTED');

    if (!account || !account.credentials) {
      const errorMsg = `No active connected ${platform} account found in workspace.`;
      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          publishStatus: 'FAILED',
          errorMessage: errorMsg,
        },
      });
      targetResults.push({ platform, status: 'FAILED', errorMessage: errorMsg });
      continue;
    }

    try {
      // Validate provider exists
      const provider = providerFactory.getProvider(platform);

      // Decrypt OAuth access token securely on backend
      const accessToken = decryptSecret(
        account.credentials.encryptedAccessToken,
        account.credentials.iv,
        account.credentials.authTag
      );

      const postContent = target.customContent || post.globalContent;

      // Platform capability validation
      const validation = provider.validatePayload({
        content: postContent,
        mediaUrls: parsedMediaUrls,
      });

      if (!validation.valid) {
        const errorMsg = validation.error || `Content violates ${platform} platform constraints.`;
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            publishStatus: 'FAILED',
            errorMessage: errorMsg,
          },
        });
        targetResults.push({ platform, status: 'FAILED', errorMessage: errorMsg });
        continue;
      }

      // Dispatch to official REST API
      const publishResult = await provider.publishPost(accessToken, {
        content: postContent,
        title: post.title || undefined,
        mediaUrls: parsedMediaUrls,
      });

      if (publishResult.success) {
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            publishStatus: 'PUBLISHED',
            platformPostId: publishResult.platformPostId,
            platformUrl: publishResult.platformUrl,
            errorMessage: null,
            publishedAt: new Date(),
          },
        });
        targetResults.push({
          platform,
          status: 'PUBLISHED',
          platformPostId: publishResult.platformPostId,
          platformUrl: publishResult.platformUrl,
        });
      } else {
        const errText = publishResult.errorMessage || `Publishing rejected by ${platform} API`;
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            publishStatus: 'FAILED',
            errorMessage: errText,
          },
        });
        targetResults.push({
          platform,
          status: 'FAILED',
          errorMessage: errText,
        });
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : `Exception publishing to ${platform}`;
      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          publishStatus: 'FAILED',
          errorMessage: errText,
        },
      });
      targetResults.push({ platform, status: 'FAILED', errorMessage: errText });
    }
  }

  const allPublished = targetResults.length > 0 && targetResults.every((t) => t.status === 'PUBLISHED');
  const somePublished = targetResults.some((t) => t.status === 'PUBLISHED');
  const overallStatus = allPublished ? 'PUBLISHED' : somePublished ? 'PARTIAL' : 'FAILED';
  const combinedError = targetResults.find((t) => t.errorMessage)?.errorMessage || null;

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: overallStatus === 'PARTIAL' ? 'PUBLISHED' : overallStatus,
      publishedAt: somePublished ? new Date() : null,
      errorMessage: allPublished ? null : combinedError,
    },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      workspaceId: post.workspaceId,
      userId: post.authorId,
      type: allPublished ? 'PUBLISH_SUCCESS' : 'PUBLISH_FAILED',
      title: allPublished ? 'Post Published' : 'Publishing Delivery Alert',
      message: allPublished
        ? `Post "${post.title || post.globalContent.slice(0, 30)}..." published successfully.`
        : `Publishing encountered issues: ${combinedError || 'Check target channels.'}`,
      linkUrl: `/admin/social/posts`,
    },
  });

  // Create Audit Log
  await logAuditEvent({
    workspaceId: post.workspaceId,
    userId: post.authorId,
    action: allPublished ? 'POST_PUBLISHED' : 'POST_PUBLISH_FAILED',
    entityType: 'Post',
    entityId: post.id,
    metadata: {
      overallStatus,
      targets: targetResults,
      errorMessage: combinedError,
    },
  });

  return { postId, overallStatus, errorMessage: combinedError || undefined, targets: targetResults };
}
