import { SignJWT, jwtVerify } from 'jose';

const OAUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_oauth_state_secret_key_32_chars_2026'
);

export interface OAuthStatePayload {
  workspaceId: string;
  userId: string;
  platform: string;
  codeVerifier?: string;
  timestamp: number;
}

/**
 * Generates a tamper-proof cryptographically signed state token for OAuth 2.0
 */
export async function generateOAuthState(payload: Omit<OAuthStatePayload, 'timestamp'>): Promise<string> {
  return new SignJWT({
    ...payload,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(OAUTH_SECRET);
}

/**
 * Verifies the incoming state token from the provider OAuth callback
 */
export async function verifyOAuthState(stateToken: string): Promise<OAuthStatePayload | null> {
  try {
    const { payload } = await jwtVerify(stateToken, OAUTH_SECRET);
    return payload as unknown as OAuthStatePayload;
  } catch {
    return null;
  }
}
