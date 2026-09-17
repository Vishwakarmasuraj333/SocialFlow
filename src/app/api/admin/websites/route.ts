import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List all websites
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');
    const targetWorkspaceId = workspaceIdParam || (!auth.user.isSuperAdmin ? auth.workspace?.id : undefined);

    const websites = await prisma.website.findMany({
      where: {
        ...(targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {}),
        status: { not: 'ARCHIVED' },
      },
      include: {
        domains: true,
        infrastructure: true,
        contents: { select: { id: true, title: true, status: true, slug: true, type: true } },
        createdBy: { select: { name: true, email: true } },
        _count: { select: { domains: true, contents: true, infrastructure: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ websites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch websites' }, { status: 500 });
  }
}

// POST: Add new website
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let targetWorkspaceId = body.workspaceId || auth.workspace?.id;
    if (!targetWorkspaceId) {
      const firstWs = await prisma.workspace.findFirst();
      targetWorkspaceId = firstWs?.id;
    }

    if (!targetWorkspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const {
      name,
      domain,
      url,
      productionUrl,
      stagingUrl,
      developmentUrl,
      cms,
      framework,
      hostingProvider,
      serverProvider,
      serverIp,
      sslStatus = 'ACTIVE',
      environment = 'PRODUCTION',
      status = 'ACTIVE',
      notes,
    } = body;

    if (!name || !domain || !url) {
      return NextResponse.json(
        { error: 'Website Name, Domain, and URL are required' },
        { status: 400 }
      );
    }

    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

    const website = await prisma.website.create({
      data: {
        workspaceId: targetWorkspaceId,
        name: name.trim(),
        domain: cleanDomain,
        url: url.trim(),
        productionUrl: productionUrl?.trim() || url.trim(),
        stagingUrl: stagingUrl?.trim() || null,
        developmentUrl: developmentUrl?.trim() || null,
        cms: cms || null,
        framework: framework || null,
        hostingProvider: hostingProvider || null,
        serverProvider: serverProvider || null,
        serverIp: serverIp?.trim() || null,
        sslStatus,
        sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days
        domainExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
        environment,
        status,
        notes: notes || null,
        createdById: auth.user.id,
      },
    });

    // Automatically create primary Domain entry for this website
    await prisma.domain.create({
      data: {
        workspaceId: targetWorkspaceId,
        websiteId: website.id,
        domain: cleanDomain,
        registrar: hostingProvider || 'Cloudflare',
        dnsProvider: hostingProvider || 'Cloudflare',
        sslStatus: 'ACTIVE',
        sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isVerified: true,
        status: 'ACTIVE',
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: targetWorkspaceId,
        userId: auth.user.id,
        action: 'WEBSITE_CREATED',
        entityType: 'Website',
        entityId: website.id,
        metadataJson: JSON.stringify({ name: website.name, domain: website.domain }),
      },
    });

    return NextResponse.json({ success: true, website }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add website' }, { status: 500 });
  }
}

// PATCH: Update website
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const website = await prisma.website.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: website.workspaceId,
        userId: auth.user.id,
        action: 'WEBSITE_UPDATED',
        entityType: 'Website',
        entityId: website.id,
        metadataJson: JSON.stringify({ name: website.name, domain: website.domain }),
      },
    });

    return NextResponse.json({ success: true, website });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update website' }, { status: 500 });
  }
}

// DELETE: Remove website
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({ where: { id } });
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    if (permanent) {
      await prisma.domain.deleteMany({ where: { websiteId: id } });
      await prisma.infrastructureAsset.deleteMany({ where: { websiteId: id } });
      await prisma.webContent.deleteMany({ where: { websiteId: id } });
      await prisma.website.delete({ where: { id } });
    } else {
      await prisma.website.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
      await prisma.domain.updateMany({
        where: { websiteId: id },
        data: { status: 'ARCHIVED' },
      });
    }

    await prisma.auditLog.create({
      data: {
        workspaceId: website.workspaceId,
        userId: auth.user.id,
        action: permanent ? 'WEBSITE_PERMANENTLY_DELETED' : 'WEBSITE_ARCHIVED',
        entityType: 'Website',
        entityId: id,
        metadataJson: JSON.stringify({ name: website.name, domain: website.domain, permanent }),
      },
    });

    return NextResponse.json({
      success: true,
      message: permanent ? 'Website permanently deleted from database' : 'Website archived',
      permanent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete website' }, { status: 500 });
  }
}
