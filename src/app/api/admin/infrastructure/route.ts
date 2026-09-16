import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List infrastructure assets
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');
    const type = searchParams.get('type');
    const targetWorkspaceId = workspaceIdParam || auth.workspace?.id;

    const where: any = {};
    if (targetWorkspaceId) where.workspaceId = targetWorkspaceId;
    if (type) where.type = type.toUpperCase();

    const assets = await prisma.infrastructureAsset.findMany({
      where,
      include: {
        website: { select: { id: true, name: true, domain: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch infrastructure assets' }, { status: 500 });
  }
}

// POST: Add infrastructure asset
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
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const {
      name,
      type = 'CLOUD_SERVER',
      provider = 'AWS',
      environment = 'PRODUCTION',
      region,
      publicIp,
      privateIp,
      status = 'RUNNING',
      os,
      resourcesJson,
      websiteId,
      notes,
    } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Asset Name and Type are required' }, { status: 400 });
    }

    const asset = await prisma.infrastructureAsset.create({
      data: {
        workspaceId: targetWorkspaceId,
        websiteId: websiteId || null,
        ownerId: auth.user.id,
        name: name.trim(),
        type: type.toUpperCase(),
        provider: provider.trim(),
        environment,
        region: region?.trim() || null,
        publicIp: publicIp?.trim() || null,
        privateIp: privateIp?.trim() || null,
        status,
        os: os?.trim() || null,
        resourcesJson: typeof resourcesJson === 'string' ? resourcesJson : JSON.stringify(resourcesJson || {}),
        notes: notes?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: targetWorkspaceId,
        userId: auth.user.id,
        action: 'INFRASTRUCTURE_ASSET_CREATED',
        entityType: 'InfrastructureAsset',
        entityId: asset.id,
        metadataJson: JSON.stringify({ name: asset.name, type: asset.type, provider: asset.provider }),
      },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create asset' }, { status: 500 });
  }
}

// PATCH: Update infrastructure asset
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const asset = await prisma.infrastructureAsset.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.resourcesJson && typeof updateData.resourcesJson !== 'string'
          ? { resourcesJson: JSON.stringify(updateData.resourcesJson) }
          : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: asset.workspaceId,
        userId: auth.user.id,
        action: 'INFRASTRUCTURE_ASSET_UPDATED',
        entityType: 'InfrastructureAsset',
        entityId: asset.id,
        metadataJson: JSON.stringify({ name: asset.name, status: asset.status }),
      },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update asset' }, { status: 500 });
  }
}

// DELETE: Remove infrastructure asset
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const asset = await prisma.infrastructureAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await prisma.infrastructureAsset.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        workspaceId: asset.workspaceId,
        userId: auth.user.id,
        action: 'INFRASTRUCTURE_ASSET_DELETED',
        entityType: 'InfrastructureAsset',
        entityId: id,
        metadataJson: JSON.stringify({ name: asset.name, type: asset.type }),
      },
    });

    return NextResponse.json({ success: true, message: 'Infrastructure asset deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete asset' }, { status: 500 });
  }
}
