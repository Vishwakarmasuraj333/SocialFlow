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

  // Prevent duplicate concurrent execution
  const isActivelyPublishing = post.status === 'PUBLISHING' && post.updatedAt && (Date.now() - post.updatedAt.getTime() < 4000);
  if (isActivelyPublishing) {
    throw new Error(`Post ${postId} is currently being dispatched to platforms. Please wait a moment.`);
  }

  // Set atomic publishing status
  await prisma.post.update({
    where: { id: postId },
    data: { status: 'PUBLISHING', errorMessage: null },
  });

  const parsedMediaUrls: string[] = post.mediaUrlsJson ? JSON.parse(post.mediaUrlsJson) : [];
  const targetResults: PublishExecutionResult['targets'] = [];

  try {
    for (const target of post.targets) {
      const platformKey = target.platform === 'TWITTER' ? 'X' : target.platform.toUpperCase();
      const platform = platformKey as PlatformType;
      const platformMedia = [...parsedMediaUrls];

      // Find connected account
      const account = target.socialAccountId
        ? post.workspace.socialAccounts.find((a) => a.id === target.socialAccountId && a.status === 'CONNECTED')
        : post.workspace.socialAccounts.find(
            (a) => (a.platform === platform || (platform === 'X' && a.platform === 'TWITTER')) && a.status === 'CONNECTED'
          );

      if (!account || !account.credentials) {
        const errorMsg = `No active connected ${platform} channel found in this workspace. Please connect the channel first.`;
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
        const provider = providerFactory.getProvider(platform);

        // Decrypt OAuth access token securely on backend
        let accessToken = decryptSecret(
          account.credentials.encryptedAccessToken,
          account.credentials.iv,
          account.credentials.authTag
        );
        try {
          if (accessToken && accessToken.startsWith('{')) {
            const parsed = JSON.parse(accessToken);
            accessToken = parsed.token || parsed.accessToken || accessToken;
          }
        } catch {}

        const postContent = target.customContent || post.globalContent;

        // Capability validation
        const validation = provider.validatePayload({
          content: postContent,
          mediaUrls: platformMedia,
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
          mediaUrls: platformMedia,
        });

        if (publishResult.success && publishResult.platformPostId) {
          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              publishStatus: 'PUBLISHED',
              platformPostId: publishResult.platformPostId,
              platformUrl: publishResult.platformUrl || null,
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
          // Provider rejected post — STRICT REAL STATUS (NEVER FAKE PUBLISHED)
          const errorMsg = publishResult.errorMessage || `${platform} API rejected publishing request.`;
          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              publishStatus: 'FAILED',
              errorMessage: errorMsg,
            },
          });
          targetResults.push({ platform, status: 'FAILED', errorMessage: errorMsg });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : `API error publishing to ${platform}`;
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            publishStatus: 'FAILED',
            errorMessage: errorMsg,
          },
        });
        targetResults.push({ platform, status: 'FAILED', errorMessage: errorMsg });
      }
    }

    const allPublished = targetResults.length > 0 && targetResults.every((t) => t.status === 'PUBLISHED');
    const somePublished = targetResults.some((t) => t.status === 'PUBLISHED');
    const overallStatus = allPublished ? 'PUBLISHED' : somePublished ? 'PARTIAL' : 'FAILED';
    const combinedError = targetResults.find((t) => t.errorMessage)?.errorMessage || null;

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: overallStatus,
        publishedAt: somePublished ? new Date() : null,
        errorMessage: allPublished ? null : combinedError,
      },
    });

    // In-App Notification
    await prisma.notification.create({
      data: {
        workspaceId: post.workspaceId,
        userId: post.authorId,
        type: allPublished ? 'PUBLISH_SUCCESS' : 'PUBLISH_FAILED',
        title: allPublished ? 'Post Published' : 'Publishing Alert',
        message: allPublished
          ? `Post "${(post.title || post.globalContent).slice(0, 30)}..." published successfully.`
          : `Publishing encountered issues: ${combinedError || 'Check target channels.'}`,
        linkUrl: `/admin/social/posts`,
      },
    });

    // Audit Log
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown publish queue error';
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
      },
    }).catch(() => null);
    throw err;
  }
}
