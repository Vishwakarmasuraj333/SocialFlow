import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  const workspaces = await prisma.workspace.findMany({
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      socialAccounts: {
        select: { id: true, platform: true, accountName: true, status: true },
      },
      _count: {
        select: {
          members: true,
          socialAccounts: true,
          posts: true,
          campaigns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ workspaces });
}

// POST: Create a new workspace
export async function POST(req: Request) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug, plan = 'ENTERPRISE' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    // Check if slug is taken
    const existing = await prisma.workspace.findUnique({
      where: { slug: cleanSlug },
    });

    const finalSlug = existing ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        members: {
          create: {
            userId: auth.user.id,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        members: true,
        socialAccounts: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: auth.user.id,
        action: 'ADMIN_WORKSPACE_CREATED',
        entityType: 'Workspace',
        entityId: workspace.id,
        metadataJson: JSON.stringify({ name: workspace.name, slug: workspace.slug, plan: plan || 'ENTERPRISE' }),
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create workspace' }, { status: 500 });
  }
}

// PATCH: Update workspace details (name, slug, plan)
export async function PATCH(req: Request) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, slug, plan } = body;

    if (!id) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (plan) updateData.plan = plan;
    if (slug && slug.trim()) {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');

      // Check uniqueness if slug is changing
      const existing = await prisma.workspace.findUnique({
        where: { slug: cleanSlug },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Slug is already in use by another workspace' }, { status: 409 });
      }
      updateData.slug = cleanSlug;
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: updateData,
      include: {
        members: true,
        socialAccounts: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: updatedWorkspace.id,
        userId: auth.user.id,
        action: 'ADMIN_WORKSPACE_UPDATED',
        entityType: 'Workspace',
        entityId: updatedWorkspace.id,
        metadataJson: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update workspace' }, { status: 500 });
  }
}

// DELETE: Delete a workspace
export async function DELETE(req: Request) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Ensure we don't delete if it's the only workspace
    const count = await prisma.workspace.count();
    if (count <= 1) {
      return NextResponse.json({ error: 'Cannot delete the only remaining workspace tenant' }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    await prisma.workspace.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'ADMIN_WORKSPACE_DELETED',
        entityType: 'Workspace',
        entityId: id,
        metadataJson: JSON.stringify({ name: workspace.name, slug: workspace.slug }),
      },
    });

    return NextResponse.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete workspace' }, { status: 500 });
  }
}

