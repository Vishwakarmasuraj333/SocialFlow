import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { generateOAuthState } from '@/lib/oauth-state';
import { getPlatformRedirectUri } from '@/services/social/redirect-uri';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', '/admin/social/linkedin');
      return NextResponse.redirect(loginUrl.toString());
    }

    const clientId = (process.env.LINKEDIN_CLIENT_ID || '').trim();
    if (!clientId) {
      return NextResponse.json(
        {
          error: 'CONFIG_ERROR',
          message: 'LINKEDIN_CLIENT_ID is not configured in server environment variables. Please configure it in your deployment environment variables.',
        },
        { status: 400 }
      );
    }

    if (
      clientId.includes('@') ||
      clientId.length < 3 ||
      ['placeholder', 'client_id', 'none', 'null', 'undefined'].includes(clientId.toLowerCase())
    ) {
      return NextResponse.json(
        {
          error: 'CONFIG_ERROR',
          message: 'Invalid LINKEDIN_CLIENT_ID: Your email address or a placeholder is configured instead of the official OAuth Client ID from the LinkedIn Developer Portal.',
        },
        { status: 400 }
      );
    }

    // Resolve redirect URI (configurable via LINKEDIN_REDIRECT_URI)
    let redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    if (!redirectUri) {
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
      const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      redirectUri = `${proto}://${host}/api/social/linkedin/callback`;
    }

    // Generate cryptographically signed state token (CSRF protection)
    const stateToken = await generateOAuthState({
      workspaceId: auth.workspace?.id || 'default',
      userId: auth.user.id,
      platform: 'LINKEDIN',
    });

    // Approved OpenID Connect and Share on LinkedIn scopes
    const scopes = encodeURIComponent('openid profile email w_member_social');

    // Build LinkedIn OAuth 2.0 Authorization URL
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${encodeURIComponent(stateToken)}&scope=${scopes}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('LinkedIn OAuth connect error:', error);
    return NextResponse.json(
      { error: 'OAUTH_INIT_ERROR', message: error.message || 'Failed to initialize LinkedIn OAuth' },
      { status: 500 }
    );
  }
}
