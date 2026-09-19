import { NextRequest, NextResponse } from 'next/server';
import { GET as handleLinkedInCallback } from '@/app/api/social/linkedin/callback/route';

/**
 * Secondary alias endpoint for LinkedIn OAuth 2.0 callback matching the `/api/auth/[provider]/callback` convention.
 * Ensures compatibility if developers configure `https://<domain>/api/auth/linkedin/callback` in the LinkedIn Portal.
 */
export async function GET(req: NextRequest) {
  return handleLinkedInCallback(req);
}
