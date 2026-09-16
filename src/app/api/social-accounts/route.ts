import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { providerFactory } from '@/services/social/provider-factory';
import { logAuditEvent } from '@/lib/audit';
import { encryptSecret } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceIdParam = searchParams.get('workspaceId');

  let where: any = {};
  if (auth.user.isSuperAdmin && !workspaceIdParam) {
    where = {};
  } else if (workspaceIdParam) {
    where = { workspaceId: workspaceIdParam };
  } else if (auth.workspace) {
    where = { workspaceId: auth.workspace.id };
  } else {
    return NextResponse.json({ accounts: [], capabilities: [] });
  }

  where.isSoftDeleted = false;

  const accounts = await prisma.socialAccount.findMany({
    where,
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      credentials: {
        select: {
          tokenExpiresAt: true,
          scopes: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const allCapabilities = providerFactory.getAllCapabilities().map((cap) => ({
    ...cap,
    isConfigured: providerFactory.isPlatformConfigured(cap.platform),
  }));

  const formatted = accounts.map((acc) => ({
    id: acc.id,
    workspaceId: acc.workspaceId,
    workspaceName: acc.workspace?.name || 'Default Workspace',
    platform: acc.platform,
    accountName: acc.accountName,
    accountHandle: acc.accountHandle,
    name: acc.accountHandle || acc.accountName,
    avatarUrl: acc.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${acc.accountHandle || acc.id}`,
    platformAccountId: acc.platformAccountId,
    status: acc.status,
    lastSyncedAt: acc.lastSyncedAt,
    metadataJson: acc.metadataJson,
    tokenExpiresAt: acc.credentials?.tokenExpiresAt,
    scopes: acc.credentials?.scopes,
    createdAt: acc.createdAt,
    updatedAt: acc.updatedAt,
  }));

  return NextResponse.json({
    accounts: formatted,
    capabilities: allCapabilities,
  });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    platform,
    accountName,
    accountHandle,
    avatarUrl,
    workspaceId,
    status = 'CONNECTED',
    scopes,
    metadataJson,
  } = body;

  if (!platform || !accountName) {
    return NextResponse.json(
      { error: 'Platform and Account Name are required' },
      { status: 400 }
    );
  }

  const cleanPlatform = String(platform).toUpperCase().trim();
  const cleanHandle = (accountHandle || accountName)
    .trim()
    .replace(/^@/, '');

  const targetWorkspaceId = workspaceId || auth.workspace?.id;
  if (!targetWorkspaceId) {
    return NextResponse.json(
      { error: 'Target workspace is required' },
      { status: 400 }
    );
  }

  // Permission check
  const isSuperAdmin = Boolean(auth.user.isSuperAdmin);
  if (!isSuperAdmin) {
    if (!auth.workspace || auth.workspace.id !== targetWorkspaceId) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }
    if (!hasPermission(auth.workspace.role, 'accounts:connect')) {
      return NextResponse.json(
        { error: 'Permission denied: cannot connect accounts' },
        { status: 403 }
      );
    }
  }

  // Verify workspace exists
  const ws = await prisma.workspace.findUnique({
    where: { id: targetWorkspaceId },
  });
  if (!ws) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const platformAccountId = body.platformAccountId || `${cleanPlatform.toLowerCase()}_${Date.now()}`;

  // Encrypt access token payload using AES-256-GCM
  const dummyToken = `oauth_${cleanPlatform.toLowerCase()}_${Date.now()}_secret`;
  const encryptedPayload = encryptSecret(dummyToken);

  const formattedMetaJson = typeof metadataJson === 'string'
    ? metadataJson
    : metadataJson
      ? JSON.stringify(metadataJson)
      : null;

  // Check if account already exists with same workspace + platform + platformAccountId
  const existing = await prisma.socialAccount.findFirst({
    where: {
      workspaceId: targetWorkspaceId,
      platform: cleanPlatform,
      OR: [
        { platformAccountId },
        { accountHandle: cleanHandle },
      ],
    },
  });

  let createdAccount;
  if (existing) {
    // Update existing account
    createdAccount = await prisma.socialAccount.update({
      where: { id: existing.id },
      data: {
        accountName: accountName.trim(),
        accountHandle: cleanHandle,
        status: status || 'CONNECTED',
        avatarUrl: avatarUrl || existing.avatarUrl,
        metadataJson: formattedMetaJson || existing.metadataJson,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    // Create new account with credentials
    createdAccount = await prisma.socialAccount.create({
      data: {
        workspaceId: targetWorkspaceId,
        platform: cleanPlatform,
        accountName: accountName.trim(),
        accountHandle: cleanHandle,
        avatarUrl:
          avatarUrl ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanHandle}`,
        platformAccountId,
        status: status || 'CONNECTED',
        metadataJson: formattedMetaJson,
        lastSyncedAt: new Date(),
        credentials: {
          create: {
            encryptedAccessToken: encryptedPayload.encrypted,
            iv: encryptedPayload.iv,
            authTag: encryptedPayload.authTag,
            tokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            scopes: scopes || 'read,write,publish,insights',
          },
        },
      },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  await logAuditEvent({
    workspaceId: targetWorkspaceId,
    userId: auth.user.id,
    action: 'ACCOUNT_CONNECTED',
    entityType: 'SocialAccount',
    entityId: createdAccount.id,
    metadata: {
      platform: cleanPlatform,
      handle: cleanHandle,
      workspaceName: ws.name,
    },
  });

  return NextResponse.json({
    success: true,
    account: createdAccount,
    message: `${cleanPlatform} account connected successfully`,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, accountName, accountHandle, status, avatarUrl, metadataJson } = body;

  if (!id) {
    return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
  }

  const account = await prisma.socialAccount.findUnique({
    where: { id },
  });

  if (!account) {
    return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
  }

  const isSuperAdmin = auth.user.isSuperAdmin;
  if (!isSuperAdmin) {
    if (!auth.workspace || auth.workspace.id !== account.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }
    if (!hasPermission(auth.workspace.role, 'accounts:connect')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
  }

  const updateData: any = {};
  if (accountName !== undefined) updateData.accountName = accountName.trim();
  if (accountHandle !== undefined) updateData.accountHandle = accountHandle.trim().replace(/^@/, '');
  if (status !== undefined) updateData.status = status;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (metadataJson !== undefined) updateData.metadataJson = typeof metadataJson === 'string' ? metadataJson : JSON.stringify(metadataJson);

  const updated = await prisma.socialAccount.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    workspaceId: account.workspaceId,
    userId: auth.user.id,
    action: 'ACCOUNT_UPDATED',
    entityType: 'SocialAccount',
    entityId: id,
    metadata: { changes: updateData },
  });

  return NextResponse.json({ success: true, account: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let accountId = searchParams.get('id');
  let targetIds: string[] = [];

  try {
    const body = await req.json();
    if (body.ids && Array.isArray(body.ids)) {
      targetIds = body.ids;
    } else if (body.id) {
      targetIds = [body.id];
    }
  } catch {
    // query param fallback
  }

  if (accountId && !targetIds.includes(accountId)) {
    targetIds.push(accountId);
  }

  if (!targetIds.length) {
    return NextResponse.json({ error: 'Account ID(s) required' }, { status: 400 });
  }

  const result = await prisma.socialAccount.deleteMany({
    where: { id: { in: targetIds } },
  });

  await logAuditEvent({
    workspaceId: auth.workspace?.id || null,
    userId: auth.user.id,
    action: 'ACCOUNTS_DISCONNECTED',
    entityType: 'SocialAccount',
    metadata: { count: result.count, ids: targetIds },
  });

  return NextResponse.json({
    success: true,
    message: `${result.count} social account(s) disconnected successfully`,
  });
}
