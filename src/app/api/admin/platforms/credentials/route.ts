import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { syncDbCredentialsToEnv, checkPlatformConfigStatus } from '@/services/platform-service';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { platform, clientId, clientSecret, scopes, authUrl, tokenUrl } = await req.json();

    if (!platform || !clientId) {
      return NextResponse.json({ error: 'Platform identifier and Client ID / App Key are required.' }, { status: 400 });
    }

    const trimmedClientId = String(clientId).trim();
    if (
      trimmedClientId.includes('@') ||
      trimmedClientId.length < 3 ||
      ['placeholder', 'your_client_id', 'client_id', 'none', 'null', 'undefined'].includes(trimmedClientId.toLowerCase())
    ) {
      return NextResponse.json(
        { error: 'Invalid Client ID: Please enter a valid OAuth Client ID / App Key from the official developer portal (never an email or placeholder).' },
        { status: 400 }
      );
    }

    const cleanSlug = String(platform).toLowerCase().trim();

    // Upsert platform metadata into Database (Client Secret is never stored in DB; it belongs in server environment)
    const updated = await prisma.platform.upsert({
      where: { slug: cleanSlug },
      update: {
        clientId: trimmedClientId,
        clientSecret: null, // Clear any legacy secrets from DB
        ...(scopes ? { scopes: scopes.trim() } : {}),
        ...(authUrl ? { authUrl: authUrl.trim() } : {}),
        ...(tokenUrl ? { tokenUrl: tokenUrl.trim() } : {}),
        status: 'AVAILABLE',
      },
      create: {
        name: cleanSlug.toUpperCase(),
        slug: cleanSlug,
        logo: cleanSlug,
        clientId: trimmedClientId,
        clientSecret: null,
        status: 'AVAILABLE',
      },
    });

    const config = checkPlatformConfigStatus(cleanSlug, 0);

    await logAuditEvent({
      workspaceId: auth.workspace?.id || null,
      userId: auth.user.id,
      action: 'PLATFORM_CREDENTIALS_UPDATED',
      entityType: 'Platform',
      entityId: updated.id,
      metadata: { slug: cleanSlug, isConfigured: config.isConfigured },
    });

    return NextResponse.json({
      success: true,
      message: `Credentials for ${updated.name} have been securely configured.`,
      platform: cleanSlug,
      isConfigured: config.isConfigured,
    });
  } catch (error: any) {
    console.error('Error saving platform credentials:', error);
    return NextResponse.json({ error: error.message || 'Failed to save credentials' }, { status: 500 });
  }
}
