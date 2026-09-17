import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { generateOAuthState } from '@/lib/oauth-state';
import { syncDbCredentialsToEnv } from '@/services/platform-service';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized: Active workspace context required.' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'accounts:connect')) {
    return NextResponse.json({ error: 'Permission denied: Cannot connect social channels.' }, { status: 403 });
  }

  try {
    const { platform } = await req.json();

    if (!platform) {
      return NextResponse.json({ error: 'Platform identifier is required.' }, { status: 400 });
    }

    // Load any database-configured credentials into environment
    await syncDbCredentialsToEnv();

    const platformType = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;
    const provider = providerFactory.getProvider(platformType);
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    if (!isConfigured) {
      return NextResponse.json(
        {
          error: `Configuration Required: ${provider.capabilities.displayName} API credentials are not configured on the server.`,
          status: 'CONFIGURATION_REQUIRED',
          platform: platformType,
          displayName: provider.capabilities.displayName,
          requiredEnvVars: provider.capabilities.requiredEnvVars,
          configDocsUrl: provider.capabilities.configDocsUrl,
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social-accounts/callback/${platformType.toLowerCase()}`;

    // Cryptographically signed state token (prevents CSRF and tampering)
    const state = await generateOAuthState({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      platform: platformType,
    });

    const authUrl = provider.getAuthorizationUrl(state, redirectUri);

    return NextResponse.json({
      success: true,
      mode: 'OAUTH_REDIRECT',
      authUrl,
      platform: platformType,
      displayName: provider.capabilities.displayName,
      capabilities: provider.capabilities,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to initiate OAuth authorization';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
