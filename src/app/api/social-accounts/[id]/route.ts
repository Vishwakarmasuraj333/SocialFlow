import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { decryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const account = await prisma.socialAccount.findUnique({
    where: { id },
    include: { credentials: true, workspace: true },
  });

  if (!account) {
    return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
  }

  // Verify permission
  const isSuperAdmin = Boolean(auth.user.isSuperAdmin);
  if (!isSuperAdmin) {
    if (!auth.workspace || auth.workspace.id !== account.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }
    if (!hasPermission(auth.workspace.role, 'accounts:disconnect')) {
      return NextResponse.json({ error: 'Permission denied: cannot disconnect social accounts' }, { status: 403 });
    }
  }

  try {
    // 1. Attempt token revocation on official platform if supported
    if (account.credentials?.encryptedAccessToken) {
      try {
        const platformType = (account.platform === 'TWITTER' ? 'X' : account.platform.toUpperCase()) as PlatformType;
        const provider = providerFactory.getProvider(platformType);
        const accessToken = decryptSecret(
          account.credentials.encryptedAccessToken,
          account.credentials.iv,
          account.credentials.authTag
        );
        if (accessToken) {
          await provider.disconnect(accessToken).catch(() => null);
        }
      } catch {}
    }

    // 2. Wipe cryptographic tokens from database
    await prisma.oAuthCredential.deleteMany({
      where: { socialAccountId: id },
    });

    // 3. Mark account as DISCONNECTED and soft-delete from active view
    const updated = await prisma.socialAccount.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
        isSoftDeleted: true,
        updatedAt: new Date(),
      },
    });

    // 4. Audit Log
    await logAuditEvent({
      workspaceId: account.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_DISCONNECTED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: {
        platform: account.platform,
        accountHandle: account.accountHandle,
        platformAccountId: account.platformAccountId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${account.platform} account (${account.accountHandle}) disconnected and credentials purged.`,
      account: {
        id: updated.id,
        platform: updated.platform,
        status: updated.status,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to disconnect social account';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const account = await prisma.socialAccount.findUnique({
    where: { id },
    include: {
      workspace: { select: { id: true, name: true } },
      credentials: { select: { tokenExpiresAt: true, scopes: true, updatedAt: true } },
    },
  });

  if (!account) {
    return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
  }

  // Never return encrypted or plaintext tokens to client!
  return NextResponse.json({
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    accountHandle: account.accountHandle,
    avatarUrl: account.avatarUrl,
    platformAccountId: account.platformAccountId,
    status: account.status,
    lastSyncedAt: account.lastSyncedAt,
    metadataJson: account.metadataJson,
    tokenExpiresAt: account.credentials?.tokenExpiresAt,
    scopes: account.credentials?.scopes,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  });
}
