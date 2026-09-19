import { PlatformType } from './types';

/**
 * Resolves the official OAuth redirect URI for a given platform.
 * Supports exact environment overrides (e.g. META_REDIRECT_URI, LINKEDIN_REDIRECT_URI, etc.)
 * with automatic fallback to standard application callback URLs for localhost and production.
 */
export function getPlatformRedirectUri(platform: PlatformType | string): string {
  const p = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;

  // 1. Direct platform specific environment override
  const directEnvKey = `${p}_REDIRECT_URI`;
  if (process.env[directEnvKey]) {
    return process.env[directEnvKey]!;
  }

  // 2. Common platform aliases
  if (p === 'X' && process.env.TWITTER_REDIRECT_URI) {
    return process.env.TWITTER_REDIRECT_URI;
  }
  if ((p === 'INSTAGRAM' || p === 'FACEBOOK') && process.env.META_REDIRECT_URI) {
    return process.env.META_REDIRECT_URI;
  }
  if (p === 'YOUTUBE' && process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  // 3. Dynamic App URL fallback (localhost in development, custom domain or Vercel URL in production)
  const appBaseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const normalizedBase = appBaseUrl.replace(/\/+$/, '');

  if (p === 'X') {
    return `${normalizedBase}/api/auth/x/callback`;
  }

  if (p === 'LINKEDIN') {
    return `${normalizedBase}/api/social/linkedin/callback`;
  }

  return `${normalizedBase}/api/social-accounts/callback/${p.toLowerCase()}`;
}
