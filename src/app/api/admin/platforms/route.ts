import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { getPlatformsWithRealStatus } from '@/services/platform-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const platforms = await getPlatformsWithRealStatus(auth.workspace?.id);

    let filtered = platforms;
    if (category && category !== 'All' && category !== 'ALL') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }

    return NextResponse.json({ platforms: filtered });
  } catch (error: any) {
    console.error('Error fetching admin platforms:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch platforms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      logo,
      category = 'Major',
      oauthEnabled = true,
      publishingEnabled = true,
      analyticsEnabled = true,
      messagingEnabled = false,
      schedulingEnabled = true,
      characterLimit = 2200,
      mediaLimit = 4,
      videoSupport = true,
      imageSupport = true,
      apiVersion = 'REST v2',
      status = 'AVAILABLE',
      clientId,
      clientSecret,
      scopes,
      authUrl,
      tokenUrl,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Platform name and slug are required' }, { status: 400 });
    }

    const cleanSlug = String(slug).toLowerCase().trim();

    const existing = await prisma.platform.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `Platform with slug "${cleanSlug}" already exists` }, { status: 400 });
    }

    const platform = await prisma.platform.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        logo: logo || cleanSlug,
        category,
        oauthEnabled,
        publishingEnabled,
        analyticsEnabled,
        messagingEnabled,
        schedulingEnabled,
        characterLimit: Number(characterLimit) || 2200,
        mediaLimit: Number(mediaLimit) || 4,
        videoSupport,
        imageSupport,
        apiVersion,
        status,
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        scopes: scopes || null,
        authUrl: authUrl || null,
        tokenUrl: tokenUrl || null,
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace?.id || null,
      userId: auth.user.id,
      action: 'PLATFORM_CREATED',
      entityType: 'Platform',
      entityId: platform.id,
      metadata: { slug: platform.slug, name: platform.name },
    });

    return NextResponse.json({ success: true, platform });
  } catch (error: any) {
    console.error('Error creating platform:', error);
    return NextResponse.json({ error: error.message || 'Failed to create platform' }, { status: 500 });
  }
}
