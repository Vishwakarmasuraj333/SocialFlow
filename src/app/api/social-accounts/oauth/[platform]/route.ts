import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { generateOAuthState } from '@/lib/oauth-state';
import { syncDbCredentialsToEnv } from '@/services/platform-service';
import { getPlatformRedirectUri } from '@/services/social/redirect-uri';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const auth = await getAuthContext();
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!auth || !auth.workspace) {
    return NextResponse.redirect(`${appUrl}/login?redirect=${encodeURIComponent(req.url)}`);
  }

  if (!hasPermission(auth.workspace.role, 'accounts:connect')) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Permission denied: cannot connect social accounts')}`
    );
  }

  try {
    const { platform } = await context.params;
    if (!platform) {
      return NextResponse.redirect(
        `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Platform parameter is required')}`
      );
    }

    await syncDbCredentialsToEnv();

    const platformType = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;
    const provider = providerFactory.getProvider(platformType);
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    if (!isConfigured) {
      return NextResponse.redirect(
        `${appUrl}/admin/social/accounts?error=${encodeURIComponent(
          `${provider.capabilities.displayName} integration is not configured. Add the required OAuth credentials to the server environment.`
        )}`
      );
    }

    const redirectUri = getPlatformRedirectUri(platformType);

    const { generatePKCEVerifier, generatePKCEChallenge } = await import('@/lib/oauth-state');
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (platformType === 'X') {
      codeVerifier = generatePKCEVerifier();
      codeChallenge = generatePKCEChallenge(codeVerifier);
    }

    const state = await generateOAuthState({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      platform: platformType,
      codeVerifier,
    });

    const authUrl = provider.getAuthorizationUrl(state, redirectUri, codeChallenge);
    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'OAuth authorization failed';
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(errorMsg)}`
    );
  }
}
