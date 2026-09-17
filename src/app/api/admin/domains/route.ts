import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List domains
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    // In Admin Center, show active domains (excluding archived)
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const whereClause: any = workspaceIdParam ? { workspaceId: workspaceIdParam } : {};
    if (!includeArchived) {
      whereClause.status = { not: 'ARCHIVED' };
    }

    let domains = await prisma.domain.findMany({
      where: whereClause,
      include: {
        website: { select: { id: true, name: true, url: true } },
        dnsRecords: true,
        _count: { select: { dnsRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-provision primary domain if none exist yet
    if (domains.length === 0) {
      let ws = await prisma.workspace.findFirst();
      if (!ws) {
        ws = await prisma.workspace.create({
          data: {
            name: 'SocialFlow Global Command',
            slug: 'socialflow-command',
          },
        });
      }

      let web = await prisma.website.findFirst();
      if (!web) {
        web = await prisma.website.create({
          data: {
            workspaceId: ws.id,
            name: 'SocialFlow Production App',
            domain: 'socialflow.io',
            url: 'https://socialflow.io',
            status: 'ACTIVE',
          },
        });
      }

      const defaultDomain = await prisma.domain.create({
        data: {
          workspaceId: ws.id,
          websiteId: web.id,
          domain: 'socialflow.io',
          registrar: 'Cloudflare Registrar',
          dnsProvider: 'Cloudflare Anycast DNS',
          sslStatus: 'ACTIVE',
          isVerified: true,
          status: 'ACTIVE',
          expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        },
        include: {
          website: { select: { id: true, name: true, url: true } },
          dnsRecords: true,
          _count: { select: { dnsRecords: true } },
        },
      });

      await prisma.dnsRecord.createMany({
        data: [
          { domainId: defaultDomain.id, type: 'A', name: '@', content: '76.76.21.21', proxied: true, ttl: 3600 },
          { domainId: defaultDomain.id, type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com', proxied: true, ttl: 3600 },
          { domainId: defaultDomain.id, type: 'TXT', name: '@', content: 'v=spf1 include:_spf.google.com ~all', proxied: false, ttl: 3600 },
          { domainId: defaultDomain.id, type: 'MX', name: '@', content: 'aspmx.l.google.com', priority: 1, proxied: false, ttl: 3600 },
        ],
      });

      domains = await prisma.domain.findMany({
        where: whereClause,
        include: {
          website: { select: { id: true, name: true, url: true } },
          dnsRecords: true,
          _count: { select: { dnsRecords: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ domains });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch domains' }, { status: 500 });
  }
}

// POST: Add new domain
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
      domain,
      websiteId,
      registrar,
      dnsProvider,
      expiryDate,
      sslStatus = 'ACTIVE',
      isVerified = true,
      status = 'ACTIVE',
      renewalAlert = true,
    } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

    const createdDomain = await prisma.domain.create({
      data: {
        workspaceId: targetWorkspaceId,
        websiteId: websiteId || null,
        domain: cleanDomain,
        registrar: registrar || 'Cloudflare Registrar',
        dnsProvider: dnsProvider || 'Cloudflare DNS',
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        sslStatus,
        sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isVerified,
        status,
        renewalAlert,
      },
    });

    // Automatically seed basic standard DNS records (A and CNAME)
    await prisma.dnsRecord.createMany({
      data: [
        {
          domainId: createdDomain.id,
          type: 'A',
          name: '@',
          content: '76.76.21.21',
          ttl: 3600,
          proxied: true,
        },
        {
          domainId: createdDomain.id,
          type: 'CNAME',
          name: 'www',
          content: cleanDomain,
          ttl: 3600,
          proxied: true,
        },
      ],
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: targetWorkspaceId,
        userId: auth.user.id,
        action: 'DOMAIN_CREATED',
        entityType: 'Domain',
        entityId: createdDomain.id,
        metadataJson: JSON.stringify({ domain: cleanDomain }),
      },
    });

    return NextResponse.json({ success: true, domain: createdDomain }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add domain' }, { status: 500 });
  }
}

// PATCH: Update domain
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    const domain = await prisma.domain.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: domain.workspaceId,
        userId: auth.user.id,
        action: 'DOMAIN_UPDATED',
        entityType: 'Domain',
        entityId: domain.id,
        metadataJson: JSON.stringify({ domain: domain.domain }),
      },
    });

    return NextResponse.json({ success: true, domain });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update domain' }, { status: 500 });
  }
}

// DELETE: Delete domain (Single or Bulk)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get('id');
    const queryPermanent = searchParams.get('permanent') === 'true';

    let ids: string[] = [];
    let permanent = queryPermanent;

    if (queryId) {
      ids = [queryId];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body.ids)) {
          ids = body.ids;
        } else if (body.id) {
          ids = [body.id];
        }
        if (body.permanent !== undefined) {
          permanent = Boolean(body.permanent);
        }
      } catch {
        // body not present
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Domain ID or array of IDs is required' }, { status: 400 });
    }

    if (permanent) {
      // First clean up dns records
      await prisma.dnsRecord.deleteMany({
        where: { domainId: { in: ids } },
      }).catch(() => {});

      await prisma.domain.deleteMany({
        where: { id: { in: ids } },
      });
    } else {
      await prisma.domain.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' },
      });
    }

    for (const id of ids) {
      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: permanent ? 'DOMAIN_PERMANENTLY_DELETED' : 'DOMAIN_ARCHIVED',
          entityType: 'Domain',
          entityId: id,
          metadataJson: JSON.stringify({ permanent }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: permanent
        ? `Successfully purged ${ids.length} domain(s) forever.`
        : `Archived ${ids.length} domain(s) to Trash.`,
      count: ids.length,
      permanent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete domain' }, { status: 500 });
  }
}
