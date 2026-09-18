import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, mediaUrls, mode = 'NOW', scheduledAt } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Post content cannot be empty.' }, { status: 400 });
    }

    if (content.length > 3000) {
      return NextResponse.json(
        { error: `LinkedIn character limit is 3,000 characters. Current length: ${content.length}` },
        { status: 400 }
      );
    }

    const targetWorkspaceId = auth.workspace?.id;
    const account = await prisma.socialAccount.findFirst({
      where: {
        platform: 'LINKEDIN',
        status: { not: 'DISCONNECTED' },
        isSoftDeleted: false,
        ...(targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {}),
      },
      include: {
        credentials: true,
      },
    });

    if (!account || !account.credentials) {
      return NextResponse.json(
        { error: 'No connected LinkedIn account found. Please connect LinkedIn first.' },
        { status: 400 }
      );
    }

    // Check token expiration
    if (account.credentials.tokenExpiresAt && new Date(account.credentials.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'LinkedIn connection expired. Please reconnect your account in Social Accounts.' },
        { status: 401 }
      );
    }

    // 1. Create Base Post in SocialFlow DB
    const postRecord = await prisma.post.create({
      data: {
        workspaceId: account.workspaceId,
        authorId: auth.user.id,
        title: content.trim().slice(0, 50),
        globalContent: content.trim(),
        mediaUrlsJson: mediaUrls && mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        scheduledAt: mode === 'SCHEDULE' && scheduledAt ? new Date(scheduledAt) : null,
        status: mode === 'DRAFT' ? 'DRAFT' : mode === 'SCHEDULE' ? 'SCHEDULED' : 'PUBLISHING',
      },
    });

    const targetRecord = await prisma.postTarget.create({
      data: {
        postId: postRecord.id,
        platform: 'LINKEDIN',
        socialAccountId: account.id,
        publishStatus: mode === 'DRAFT' ? 'PENDING' : mode === 'SCHEDULE' ? 'PENDING' : 'PUBLISHING',
      },
    });

    // If Draft or Scheduled, return immediately without calling live publish API
    if (mode === 'DRAFT') {
      await logAuditEvent({
        userId: auth.user.id,
        workspaceId: account.workspaceId,
        action: 'POST_SAVED_DRAFT',
        entityType: 'Post',
        entityId: postRecord.id,
        metadata: { platform: 'LINKEDIN' },
      });
      return NextResponse.json({ success: true, mode: 'DRAFT', post: postRecord });
    }

    if (mode === 'SCHEDULE') {
      await logAuditEvent({
        userId: auth.user.id,
        workspaceId: account.workspaceId,
        action: 'POST_SCHEDULED',
        entityType: 'Post',
        entityId: postRecord.id,
        metadata: { platform: 'LINKEDIN', scheduledAt },
      });
      return NextResponse.json({ success: true, mode: 'SCHEDULE', post: postRecord });
    }

    // 2. Real Live Publishing with Official LinkedIn UGC API
    const accessToken = decryptSecret(
      account.credentials.encryptedAccessToken,
      account.credentials.iv,
      account.credentials.authTag
    );

    // Profile URN resolution
    let authorUrn = account.platformAccountId.startsWith('urn:li:')
      ? account.platformAccountId
      : `urn:li:person:${account.platformAccountId}`;

    // Verify author URN dynamically via userinfo
    try {
      const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userinfoRes.ok) {
        const u = await userinfoRes.json();
        if (u.sub) {
          authorUrn = `urn:li:person:${u.sub}`;
        }
      }
    } catch {
      // Keep existing authorUrn
    }

    // Media asset registration if an image URL is supplied
    let mediaUrn: string | null = null;
    const mediaUrl = mediaUrls?.[0];

    if (mediaUrl) {
      try {
        // Register image upload with LinkedIn
        const regRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          const uploadUrl = regData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
          const asset = regData.value?.asset;

          if (uploadUrl && asset) {
            // Fetch image buffer and binary PUT to LinkedIn uploadUrl
            const imgFetch = await fetch(mediaUrl);
            if (imgFetch.ok) {
              const arrayBuf = await imgFetch.arrayBuffer();
              const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': imgFetch.headers.get('content-type') || 'image/jpeg',
                },
                body: Buffer.from(arrayBuf),
              });
              if (uploadRes.ok) {
                mediaUrn = asset;
              }
            }
          }
        }
      } catch (mediaErr) {
        console.warn('LinkedIn image upload skipped or failed, proceeding with text:', mediaErr);
      }
    }

    // Prepare ShareContent
    const shareContent: Record<string, any> = {
      shareCommentary: { text: content.trim() },
      shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
    };

    if (mediaUrn) {
      shareContent.media = [
        {
          status: 'READY',
          media: mediaUrn,
          title: { text: content.slice(0, 50) },
        },
      ];
    }

    // 3. Dispatch UGC Post to LinkedIn
    const ugcResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': shareContent,
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });

    const ugcData = await ugcResponse.json().catch(() => ({}));

    if (!ugcResponse.ok || !ugcData.id) {
      const errorMessage = ugcData.message || ugcData.error || `LinkedIn UGC API rejected post with HTTP ${ugcResponse.status}`;

      // Update post and target status to FAILED
      await prisma.post.update({
        where: { id: postRecord.id },
        data: { status: 'FAILED' },
      });

      await prisma.postTarget.update({
        where: { id: targetRecord.id },
        data: {
          publishStatus: 'FAILED',
          errorMessage,
        },
      });

      await logAuditEvent({
        userId: auth.user.id,
        workspaceId: account.workspaceId,
        action: 'POST_FAILED',
        entityType: 'Post',
        entityId: postRecord.id,
        metadata: { platform: 'LINKEDIN', error: errorMessage, httpStatus: ugcResponse.status },
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          statusCode: ugcResponse.status,
          post: postRecord,
        },
        { status: 400 }
      );
    }

    // 4. Update status to PUBLISHED with real LinkedIn post URN
    const externalPostId = ugcData.id;
    const publishedAt = new Date();

    const updatedPost = await prisma.post.update({
      where: { id: postRecord.id },
      data: {
        status: 'PUBLISHED',
        publishedAt,
      },
    });

    await prisma.postTarget.update({
      where: { id: targetRecord.id },
      data: {
        publishStatus: 'PUBLISHED',
        publishedAt,
        platformPostId: externalPostId,
        platformUrl: `https://www.linkedin.com/feed/update/${externalPostId}`,
      },
    });

    await logAuditEvent({
      userId: auth.user.id,
      workspaceId: account.workspaceId,
      action: 'POST_PUBLISHED',
      entityType: 'Post',
      entityId: postRecord.id,
      metadata: { platform: 'LINKEDIN', externalPostId },
    });

    return NextResponse.json({
      success: true,
      externalPostId,
      platformPostUrl: `https://www.linkedin.com/feed/update/${externalPostId}`,
      post: updatedPost,
    });
  } catch (error: any) {
    console.error('Error publishing to LinkedIn:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while publishing to LinkedIn' },
      { status: 500 }
    );
  }
}
