import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_super_secret_jwt_key_32_chars_min_length_2026'
);

export const SESSION_COOKIE_NAME = 'socialflow_session';
export const WORKSPACE_COOKIE_NAME = 'socialflow_active_workspace';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  workspaceId?: string;
  role?: string;
}

export async function signSessionToken(payload: TokenPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
