import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List DNS records for a domain
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId');

    const records = await prisma.dnsRecord.findMany({
      where: domainId ? { domainId } : {},
      include: { domain: { select: { id: true, domain: true } } },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch DNS records' }, { status: 500 });
  }
}

// POST: Add DNS record
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { domainId, type = 'A', name, content, ttl = 3600, priority, proxied = false } = body;

    if (!domainId || !name || !content) {
      return NextResponse.json(
        { error: 'Domain ID, Record Name, and Content are required' },
        { status: 400 }
      );
    }

    const record = await prisma.dnsRecord.create({
      data: {
        domainId,
        type: type.toUpperCase(),
        name: name.trim(),
        content: content.trim(),
        ttl: Number(ttl) || 3600,
        priority: priority !== undefined && priority !== null ? Number(priority) : null,
        proxied: Boolean(proxied),
      },
      include: { domain: true },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: record.domain.workspaceId,
        userId: auth.user.id,
        action: 'DNS_RECORD_CREATED',
        entityType: 'DnsRecord',
        entityId: record.id,
        metadataJson: JSON.stringify({ type: record.type, name: record.name, domain: record.domain.domain }),
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create DNS record' }, { status: 500 });
  }
}

// PATCH: Edit DNS record
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, type, name, content, ttl, priority, proxied } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const record = await prisma.dnsRecord.update({
      where: { id },
      data: {
        ...(type ? { type: type.toUpperCase() } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(content ? { content: content.trim() } : {}),
        ...(ttl !== undefined ? { ttl: Number(ttl) } : {}),
        ...(priority !== undefined ? { priority: priority !== null ? Number(priority) : null } : {}),
        ...(proxied !== undefined ? { proxied: Boolean(proxied) } : {}),
      },
      include: { domain: true },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: record.domain.workspaceId,
        userId: auth.user.id,
        action: 'DNS_RECORD_UPDATED',
        entityType: 'DnsRecord',
        entityId: record.id,
        metadataJson: JSON.stringify({ type: record.type, name: record.name, domain: record.domain.domain }),
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update DNS record' }, { status: 500 });
  }
}

// DELETE: Remove DNS record
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const record = await prisma.dnsRecord.findUnique({
      where: { id },
      include: { domain: true },
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    await prisma.dnsRecord.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        workspaceId: record.domain.workspaceId,
        userId: auth.user.id,
        action: 'DNS_RECORD_DELETED',
        entityType: 'DnsRecord',
        entityId: id,
        metadataJson: JSON.stringify({ type: record.type, name: record.name, domain: record.domain.domain }),
      },
    });

    return NextResponse.json({ success: true, message: 'DNS record permanently deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete DNS record' }, { status: 500 });
  }
}
