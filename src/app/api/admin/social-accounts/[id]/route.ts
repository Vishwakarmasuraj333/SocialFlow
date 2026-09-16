import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

const db = prisma as any;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const resolved = await Promise.resolve(params);
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const account: any = await db.socialAccount.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true, slug: true } },
        platformRef: true,
        credentials: {
          select: {
            tokenExpiresAt: true,
            scopes: true,
            updatedAt: true,
          },
        },
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    let meta: any = {};
    try {
      if (account.metadataJson) meta = JSON.parse(account.metadataJson);
    } catch {
      meta = {};
    }

    const latestMetric = account.metrics?.[0];

    return NextResponse.json({
      account: {
        id: account.id,
        workspaceId: account.workspaceId,
        workspaceName: account.workspace?.name || 'Main Workspace',
        platform: account.platform,
        platformRef: account.platformRef,
        accountName: account.accountName,
        accountHandle: account.accountHandle,
        avatarUrl: account.avatarUrl,
        platformAccountId: account.platformAccountId,
        accountType: account.accountType,
        status: account.status,
        publishingEnabled: account.publishingEnabled,
        analyticsEnabled: account.analyticsEnabled,
        messagingEnabled: account.messagingEnabled,
        lastSyncedAt: account.lastSyncedAt,
        tokenExpiresAt: account.credentials?.tokenExpiresAt || null,
        scopes: account.credentials?.scopes ? account.credentials.scopes.split(',') : [],
        followers: latestMetric?.followers ?? latestMetric?.subscribers ?? meta.followers ?? 0,
        following: latestMetric?.following ?? meta.following ?? 0,
        reach: latestMetric?.reach ?? meta.reach ?? 0,
        impressions: latestMetric?.impressions ?? meta.impressions ?? 0,
        metadata: meta,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching social account details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const resolved = await Promise.resolve(params);
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const body = await req.json();

    const existing: any = await db.socialAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.accountName !== undefined) updateData.accountName = String(body.accountName).trim();
    if (body.accountHandle !== undefined) {
      const h = String(body.accountHandle).trim();
      updateData.accountHandle = h.startsWith('@') ? h : `@${h}`;
    }
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.publishingEnabled !== undefined) updateData.publishingEnabled = Boolean(body.publishingEnabled);
    if (body.analyticsEnabled !== undefined) updateData.analyticsEnabled = Boolean(body.analyticsEnabled);
    if (body.messagingEnabled !== undefined) updateData.messagingEnabled = Boolean(body.messagingEnabled);

    let currentMeta: any = {};
    try {
      if (existing.metadataJson) currentMeta = JSON.parse(existing.metadataJson);
    } catch {
      currentMeta = {};
    }

    if (body.followers !== undefined) {
      const f = Math.max(0, parseInt(String(body.followers).replace(/,/g, '')) || 0);
      currentMeta.followers = f;
      updateData.metadataJson = JSON.stringify(currentMeta);

      await db.socialAccountMetric.create({
        data: {
          socialAccountId: id,
          followers: f,
          following: currentMeta.following || 0,
          reach: Math.round(f * 1.8),
          impressions: Math.round(f * 3.2),
          recordedAt: new Date(),
        },
      });
    } else if (body.metadataJson !== undefined) {
      updateData.metadataJson = typeof body.metadataJson === 'string' ? body.metadataJson : JSON.stringify(body.metadataJson);
    }

    if (body.password !== undefined && String(body.password).trim()) {
      const { encryptSecret } = await import('@/lib/encryption');
      const passPayload = JSON.stringify({
        loginId: updateData.accountHandle || existing.accountHandle,
        password: String(body.password).trim(),
        updatedAt: new Date().toISOString(),
      });
      const encrypted = encryptSecret(passPayload);
      await db.oAuthCredential.upsert({
        where: { socialAccountId: id },
        update: {
          encryptedAccessToken: encrypted.encrypted,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          updatedAt: new Date(),
        },
        create: {
          socialAccountId: id,
          encryptedAccessToken: encrypted.encrypted,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          scopes: 'read,write,publish,analytics',
        },
      });
    }

    const updated = await db.socialAccount.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_UPDATED',
      entityType: 'SocialAccount',
      entityId: id,
      metadata: { changes: Object.keys(updateData) },
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (error: any) {
    console.error('Error updating social account:', error);
    return NextResponse.json({ error: error.message || 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const resolved = await Promise.resolve(params);
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const existing = await db.socialAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    // Soft delete to support trash recovery
    await db.socialAccount.update({
      where: { id },
      data: {
        isSoftDeleted: true,
        deletedAt: new Date(),
        status: 'DISCONNECTED',
      },
    });

    await logAuditEvent({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_DISCONNECTED',
      entityType: 'SocialAccount',
      entityId: id,
      metadata: { platform: existing.platform, handle: existing.accountHandle },
    });

    return NextResponse.json({
      success: true,
      message: `${existing.platform} account (${existing.accountHandle}) disconnected and archived successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting social account:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
  }
}

