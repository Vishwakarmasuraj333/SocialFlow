import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceIdParam = searchParams.get('workspaceId');

  // Scope campaigns to the active workspace to prevent cross-tenant data bleed
  let where: any = {};
  if (workspaceIdParam) {
    where = { workspaceId: workspaceIdParam };
  } else if (auth.workspace?.id) {
    where = { workspaceId: auth.workspace.id };
  } else if (!auth.user.isSuperAdmin) {
    return NextResponse.json({ campaigns: [] });
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      posts: {
        where: { isSoftDeleted: false },
        include: {
          targets: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = campaigns.map((c) => {
    const publishedCount = c.posts.filter((p) => p.status === 'PUBLISHED').length;
    const scheduledCount = c.posts.filter((p) => p.status === 'SCHEDULED').length;
    return {
      id: c.id,
      workspaceId: c.workspaceId,
      workspaceName: c.workspace?.name || 'Default Workspace',
      name: c.name,
      objective: c.objective,
      budget: c.budget,
      startDate: c.startDate,
      endDate: c.endDate,
      color: c.color,
      status: c.status,
      postsCount: c.posts.length,
      publishedCount,
      scheduledCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  });

  return NextResponse.json({ campaigns: formatted });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isSuperAdmin = auth.user.isSuperAdmin;
  if (!isSuperAdmin && (!auth.workspace || !hasPermission(auth.workspace.role, 'posts:create'))) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const body = await req.json();
  const { name, objective, budget, startDate, endDate, color, workspaceId, status } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
  }

  const targetWorkspaceId = workspaceId || auth.workspace?.id;
  if (!targetWorkspaceId) {
    return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: targetWorkspaceId,
      name: name.trim(),
      objective: objective || 'AWARENESS',
      budget: budget !== undefined && budget !== '' && budget !== null ? parseFloat(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      color: color || '#6366f1',
      status: status || 'ACTIVE',
    },
  });

  await logAuditEvent({
    workspaceId: targetWorkspaceId,
    userId: auth.user.id,
    action: 'CAMPAIGN_CREATED',
    entityType: 'Campaign',
    entityId: campaign.id,
    metadata: { name: campaign.name },
  });

  return NextResponse.json({ success: true, campaign });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, objective, budget, startDate, endDate, color, status } = body;

  if (!id) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Superadmins can edit any campaign; others must belong to the same workspace with permission
  const isSuperAdmin = auth.user.isSuperAdmin;
  if (!isSuperAdmin) {
    if (!auth.workspace || auth.workspace.id !== campaign.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }
    if (!hasPermission(auth.workspace.role, 'posts:create')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (objective !== undefined) updateData.objective = objective;
  if (budget !== undefined) {
    updateData.budget = budget === null || budget === '' ? null : parseFloat(budget);
  }
  if (startDate !== undefined) {
    updateData.startDate = startDate ? new Date(startDate) : null;
  }
  if (endDate !== undefined) {
    updateData.endDate = endDate ? new Date(endDate) : null;
  }
  if (color !== undefined) updateData.color = color;
  if (status !== undefined) updateData.status = status;

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    workspaceId: campaign.workspaceId,
    userId: auth.user.id,
    action: 'CAMPAIGN_UPDATED',
    entityType: 'Campaign',
    entityId: id,
    metadata: { changes: updateData },
  });

  return NextResponse.json({ success: true, campaign: updatedCampaign });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let id = searchParams.get('id');

  if (!id) {
    try {
      const body = await req.json();
      id = body.id;
    } catch {
      // ignore
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const isSuperAdmin = auth.user.isSuperAdmin;
  if (!isSuperAdmin) {
    if (!auth.workspace || auth.workspace.id !== campaign.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }
    if (!hasPermission(auth.workspace.role, 'posts:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
  }

  await prisma.campaign.delete({
    where: { id },
  });

  await logAuditEvent({
    workspaceId: campaign.workspaceId,
    userId: auth.user.id,
    action: 'CAMPAIGN_DELETED',
    entityType: 'Campaign',
    entityId: id,
    metadata: { name: campaign.name },
  });

  return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
}
