import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { providerFactory } from '@/services/social/provider-factory';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { platform } = await context.params;
    const cleanPlatform = String(platform).toLowerCase().trim();

    const isConfigured = providerFactory.isPlatformConfigured(cleanPlatform);

    // Measure verification latency
    const start = Date.now();
    const provider = providerFactory.getProvider(cleanPlatform);
    const latencyMs = Date.now() - start;

    if (!provider) {
      return NextResponse.json({
        success: false,
        platform: cleanPlatform,
        status: 'UNSUPPORTED',
        error: `Provider ${cleanPlatform} is not registered in the system.`,
      }, { status: 400 });
    }

    const displayName =
      provider.platform === 'X'
        ? 'X (Twitter)'
        : provider.platform.charAt(0) + provider.platform.slice(1).toLowerCase();

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        platform: cleanPlatform,
        status: 'MISSING_CREDENTIALS',
        isConfigured: false,
        latencyMs,
        message: `Environment credentials for ${displayName} are missing or incomplete.`,
      });
    }

    return NextResponse.json({
      success: true,
      platform: cleanPlatform,
      displayName,
      status: 'READY',
      isConfigured: true,
      latencyMs,
      apiVersion: provider.capabilities.supportsPublishing ? 'Live API Connected' : 'Ready',
      message: `Verified: ${displayName} OAuth credentials and API configurations are valid and operational.`,
    });
  } catch (error: any) {
    console.error('Error testing provider integration:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error occurred while verifying provider credentials',
    }, { status: 500 });
  }
}
