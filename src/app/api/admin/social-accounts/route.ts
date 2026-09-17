import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';
import { recordMetricSnapshot } from '@/services/social-metric-service';

const db = prisma as any;

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const publishingEnabled = searchParams.get('publishingEnabled');
    const analyticsEnabled = searchParams.get('analyticsEnabled');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {
      isSoftDeleted: false,
    };

    if (auth.workspace && !auth.user.isSuperAdmin) {
      where.workspaceId = auth.workspace.id;
    }

    if (platform && platform !== 'ALL') {
      where.platform = platform.toUpperCase();
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (publishingEnabled !== null && publishingEnabled !== undefined && publishingEnabled !== '') {
      where.publishingEnabled = publishingEnabled === 'true';
    }

    if (analyticsEnabled !== null && analyticsEnabled !== undefined && analyticsEnabled !== '') {
      where.analyticsEnabled = analyticsEnabled === 'true';
    }

    if (search) {
      where.OR = [
        { accountName: { contains: search } },
        { accountHandle: { contains: search } },
        { platform: { contains: search } },
      ];
    }

    const orderBy: any = {};
    if (['accountName', 'platform', 'lastSyncedAt', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [accounts, totalCount] = await Promise.all([
      db.socialAccount.findMany({
        where,
        include: {
          workspace: {
            select: { id: true, name: true, slug: true },
          },
          platformRef: {
            select: { id: true, name: true, slug: true, logo: true, apiVersion: true, characterLimit: true },
          },
          credentials: {
            select: {
              tokenExpiresAt: true,
              scopes: true,
              updatedAt: true,
            },
          },
          metrics: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.socialAccount.count({ where }),
    ]);

    const formatted = (accounts as any[]).map((acc: any) => {
      let meta: any = {};
      try {
        if (acc.metadataJson) meta = JSON.parse(acc.metadataJson);
      } catch {
        meta = {};
      }

      const latestMetric = acc.metrics[0];
      const realFollowers = latestMetric?.followers ?? latestMetric?.subscribers ?? meta.followers ?? 0;
      const realReach = latestMetric?.reach ?? meta.reach ?? 0;

      return {
        id: acc.id,
        workspaceId: acc.workspaceId,
        workspaceName: acc.workspace?.name || 'Default Workspace',
        platform: acc.platform,
        platformId: acc.platformId,
        platformRef: acc.platformRef,
        accountName: acc.accountName,
        accountHandle: acc.accountHandle,
        name: acc.accountHandle || acc.accountName,
        avatarUrl: acc.avatarUrl,
        platformAccountId: acc.platformAccountId,
        accountType: acc.accountType,
        status: acc.status,
        publishingEnabled: acc.publishingEnabled,
        analyticsEnabled: acc.analyticsEnabled,
        messagingEnabled: acc.messagingEnabled,
        lastSyncedAt: acc.lastSyncedAt,
        tokenExpiresAt: acc.credentials?.tokenExpiresAt || null,
        scopes: acc.credentials?.scopes ? acc.credentials.scopes.split(',') : [],
        followers: realFollowers,
        reach: realReach,
        metadata: meta,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      };
    });

    return NextResponse.json({
      accounts: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin social accounts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch social accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // Support atomic bulk-disconnect
    if (body.action === 'bulk-disconnect') {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
      if (ids.length === 0) {
        return NextResponse.json({ error: 'No account IDs provided for bulk disconnect' }, { status: 400 });
      }

      await db.socialAccount.updateMany({
        where: { id: { in: ids } },
        data: { status: 'DISCONNECTED' },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully disconnected ${ids.length} channel(s)`,
        count: ids.length,
      });
    }

    // Support atomic bulk-delete
    if (body.action === 'bulk-delete') {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
      if (ids.length === 0) {
        return NextResponse.json({ error: 'No account IDs provided for bulk delete' }, { status: 400 });
      }

      await db.socialAccount.updateMany({
        where: { id: { in: ids } },
        data: {
          isSoftDeleted: true,
          deletedAt: new Date(),
          status: 'DISCONNECTED',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${ids.length} channel(s)`,
        count: ids.length,
      });
    }

    // Support single disconnect action
    if (body.action === 'disconnect') {
      const id = body.id;
      if (!id) {
        return NextResponse.json({ error: 'Account ID required for disconnect' }, { status: 400 });
      }

      const updated = await db.socialAccount.update({
        where: { id },
        data: { status: 'DISCONNECTED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Account disconnected successfully.',
        account: { id: updated.id, status: updated.status },
      });
    }

    const {
      platform,
      accountName,
      accountHandle,
      loginId,
      password,
      accountType = 'BUSINESS',
      avatarUrl,
      customAccessToken,
      workspaceId,
      metadataJson,
      publishingEnabled = true,
      analyticsEnabled = true,
      messagingEnabled = false,
    } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    const platformType = String(platform).toUpperCase() as PlatformType;
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social-accounts/callback/${platformType.toLowerCase()}`;
    const targetWorkspaceId = workspaceId || auth.workspace?.id;

    if (!targetWorkspaceId) {
      return NextResponse.json({ error: 'Target workspace is required' }, { status: 400 });
    }

    // Check if user explicitly requested 1-click OAuth redirect
    if (body.authMethod === 'OAUTH' && isConfigured) {
      const provider = providerFactory.getProvider(platformType);
      const state = Buffer.from(
        JSON.stringify({ workspaceId: targetWorkspaceId, userId: auth.user.id, nonce: Date.now() })
      ).toString('base64');
      const authUrl = provider.getAuthorizationUrl(state, redirectUri);

      return NextResponse.json({
        mode: 'OAUTH_REDIRECT',
        authUrl,
      });
    }

    // Identify account username / handle from input
    const userIdentifier = (loginId || accountHandle || '').trim();
    if (!userIdentifier && !accountName && !customAccessToken) {
      return NextResponse.json(
        { error: 'Social Account ID / Username / Handle is required' },
        { status: 400 }
      );
    }

    let cleanHandle = userIdentifier.trim();
    if (cleanHandle.includes('@') && cleanHandle.includes('.')) {
      const usernamePart = cleanHandle.split('@').filter(Boolean)[0] || cleanHandle;
      cleanHandle = `@${usernamePart}`;
    } else if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }
    if (!cleanHandle || cleanHandle === '@') {
      cleanHandle = `@${platformType.toLowerCase()}_user`;
    }

    const cleanName = (accountName || cleanHandle.replace(/^@/, '') || `${platformType} Official`).trim();
    const platformAccountId = body.platformAccountId || `${platformType.toLowerCase()}_${cleanHandle.replace(/[^a-zA-Z0-9_]/g, '') || Date.now()}`;

    // Token & credential encryption
    const credentialPayload = JSON.stringify({
      loginId: loginId || cleanHandle,
      password: password || undefined,
      token: customAccessToken || `sf_live_${platformType.toLowerCase()}_${Date.now()}`,
      authMethod: password ? 'CREDENTIALS' : customAccessToken ? 'ACCESS_TOKEN' : 'DIRECT',
      connectedAt: new Date().toISOString(),
    });
    const encrypted = encryptSecret(credentialPayload);

    // Look up Platform reference if exists
    const platformRef = await db.platform.findUnique({
      where: { slug: platformType.toLowerCase() },
    });

    const parsedMeta = typeof metadataJson === 'string'
      ? metadataJson
      : metadataJson
      ? JSON.stringify(metadataJson)
      : JSON.stringify({
          category: `${platformType} ${accountType}`,
          accountType: String(accountType).toUpperCase(),
          authMode: password ? 'PASSWORD_AUTHENTICATED' : 'TOKEN_AUTHENTICATED',
        });

    // Check if account already exists to perform clean upsert/reconnect
    const existing = await db.socialAccount.findFirst({
      where: {
        workspaceId: targetWorkspaceId,
        platform: platformType,
        OR: [
          { platformAccountId },
          { accountHandle: cleanHandle },
        ],
      },
      include: { credentials: true },
    });

    let account;
    if (existing) {
      account = await db.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName: cleanName,
          accountHandle: cleanHandle,
          accountType: String(accountType).toUpperCase(),
          status: 'CONNECTED',
          isSoftDeleted: false,
          deletedAt: null,
          lastSyncedAt: new Date(),
          avatarUrl: avatarUrl || existing.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanHandle)}`,
          metadataJson: parsedMeta,
        },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
        },
      });

      if (existing.credentials) {
        await db.oAuthCredential.update({
          where: { id: existing.credentials.id },
          data: {
            encryptedAccessToken: encrypted.encrypted,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        });
      } else {
        await db.oAuthCredential.create({
          data: {
            socialAccountId: account.id,
            encryptedAccessToken: encrypted.encrypted,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            scopes: 'read,write,publish,analytics',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        });
      }
    } else {
      account = await db.socialAccount.create({
        data: {
          workspaceId: targetWorkspaceId,
          platformId: platformRef?.id || null,
          platform: platformType,
          accountName: cleanName,
          accountHandle: cleanHandle,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanHandle)}`,
          platformAccountId,
          accountType: String(accountType).toUpperCase(),
          status: 'CONNECTED',
          publishingEnabled: Boolean(publishingEnabled),
          analyticsEnabled: Boolean(analyticsEnabled),
          messagingEnabled: Boolean(messagingEnabled),
          metadataJson: parsedMeta,
          lastSyncedAt: new Date(),
          credentials: {
            create: {
              encryptedAccessToken: encrypted.encrypted,
              iv: encrypted.iv,
              authTag: encrypted.authTag,
              scopes: 'read,write,publish,analytics',
              tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000), // 60 days
            },
          },
        },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
        },
      });
    }

    // Baseline metric record starts at 0 if no prior snapshot exists
    const existingMetric = await db.socialAccountMetric.findFirst({
      where: { socialAccountId: account.id },
    });

    if (!existingMetric) {
      await recordMetricSnapshot(account.id, {
        followers: 0,
        reach: 0,
        impressions: 0,
      });
    }

    await logAuditEvent({
      workspaceId: targetWorkspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_CONNECTED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: platformType, handle: cleanHandle },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountHandle: account.accountHandle,
        avatarUrl: account.avatarUrl,
        status: account.status,
        lastSyncedAt: account.lastSyncedAt,
      },
    });
  } catch (error: any) {
    console.error('Error connecting social account:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect social account' }, { status: 500 });
  }
}
