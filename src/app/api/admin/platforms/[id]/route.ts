import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const platform = await prisma.platform.findUnique({
      where: { id },
      include: {
        socialAccounts: {
          where: { isSoftDeleted: false },
          select: {
            id: true,
            accountName: true,
            accountHandle: true,
            avatarUrl: true,
            status: true,
            lastSyncedAt: true,
          },
        },
      },
    });

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    return NextResponse.json({ platform });
  } catch (error: any) {
    console.error('Error fetching platform by id:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch platform' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.platform.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    const updateData: any = {};
    const allowedFields = [
      'name',
      'logo',
      'category',
      'oauthEnabled',
      'publishingEnabled',
      'analyticsEnabled',
      'messagingEnabled',
      'schedulingEnabled',
      'characterLimit',
      'mediaLimit',
      'videoSupport',
      'imageSupport',
      'apiVersion',
      'status',
      'clientId',
      'clientSecret',
      'scopes',
      'authUrl',
      'tokenUrl',
      'isSoftDeleted',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.isSoftDeleted === false) {
      updateData.deletedAt = null;
    } else if (body.isSoftDeleted === true) {
      updateData.deletedAt = new Date();
    }

    const updated = await prisma.platform.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      workspaceId: auth.workspace?.id || null,
      userId: auth.user.id,
      action: 'PLATFORM_UPDATED',
      entityType: 'Platform',
      entityId: id,
      metadata: { slug: updated.slug, changes: Object.keys(updateData) },
    });

    return NextResponse.json({ success: true, platform: updated });
  } catch (error: any) {
    console.error('Error updating platform:', error);
    return NextResponse.json({ error: error.message || 'Failed to update platform' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.platform.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    // Soft delete to support restore
    const deleted = await prisma.platform.update({
      where: { id },
      data: {
        isSoftDeleted: true,
        deletedAt: new Date(),
        status: 'DISABLED',
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace?.id || null,
      userId: auth.user.id,
      action: 'PLATFORM_DELETED',
      entityType: 'Platform',
      entityId: id,
      metadata: { slug: existing.slug },
    });

    return NextResponse.json({ success: true, message: `Platform ${existing.name} disabled/deleted successfully`, platform: deleted });
  } catch (error: any) {
    console.error('Error deleting platform:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete platform' }, { status: 500 });
  }
}
