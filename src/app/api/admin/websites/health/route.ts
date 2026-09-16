import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { websiteId, url: inputUrl } = body;

    let targetUrl = inputUrl;
    let targetWebsite: any = null;

    if (websiteId) {
      targetWebsite = await prisma.website.findUnique({
        where: { id: websiteId },
      });
      if (!targetWebsite) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 });
      }
      targetUrl = targetWebsite.url || `https://${targetWebsite.domain}`;
    }

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL or websiteId is required' }, { status: 400 });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const startTime = Date.now();
    let status = 'UNKNOWN';
    let statusCode: number | null = null;
    let responseTimeMs = 0;
    let errorMessage: string | null = null;
    let isHttps = targetUrl.startsWith('https://');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      responseTimeMs = Date.now() - startTime;
      statusCode = response.status;

      if (response.ok || (statusCode >= 200 && statusCode < 400)) {
        status = responseTimeMs > 2500 ? 'SLOW' : 'ONLINE';
      } else if (statusCode >= 400 && statusCode < 500) {
        status = 'WARNING';
        errorMessage = `HTTP ${statusCode} ${response.statusText}`;
      } else {
        status = 'OFFLINE';
        errorMessage = `HTTP ${statusCode} Server Error`;
      }
    } catch (err: any) {
      responseTimeMs = Date.now() - startTime;
      status = 'OFFLINE';
      errorMessage = err.name === 'AbortError' ? 'Connection timed out (> 8000ms)' : (err.message || 'Unreachable network host');
    }

    // Persist real status update to Website record
    if (targetWebsite) {
      await prisma.website.update({
        where: { id: targetWebsite.id },
        data: {
          status: status === 'ONLINE' ? 'ACTIVE' : status === 'SLOW' ? 'ACTIVE' : 'OFFLINE',
          sslStatus: isHttps && status !== 'OFFLINE' ? 'VALID' : isHttps ? 'WARNING' : 'NONE',
          updatedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          workspaceId: targetWebsite.workspaceId,
          userId: auth.user.id,
          action: 'WEBSITE_HEALTH_CHECK',
          entityType: 'Website',
          entityId: targetWebsite.id,
          metadataJson: JSON.stringify({
            targetUrl,
            status,
            statusCode,
            responseTimeMs,
            errorMessage,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      health: {
        websiteId,
        url: targetUrl,
        status,
        statusCode,
        responseTimeMs,
        isHttps,
        errorMessage,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to perform health check' }, { status: 500 });
  }
}
