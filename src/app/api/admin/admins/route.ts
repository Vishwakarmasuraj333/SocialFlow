import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List all administrators
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const admins = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        isSuperAdmin: true,
        lastLoginAt: true,
        lastLoginIp: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { postsCreated: true, websitesCreated: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch administrators' }, { status: 500 });
  }
}

// POST: Create new administrator account
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can create admins
    if (!auth.user.isSuperAdmin && (auth.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Administrators can provision staff accounts' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      role = 'ADMIN',
      status = 'ACTIVE',
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, Email, and Temporary Password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      return NextResponse.json({ error: 'An administrator with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const isSuper = role === 'SUPER_ADMIN';

    const newAdmin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        status,
        isSuperAdmin: isSuper,
        isEmailVerified: true,
      },
    });

    // Link to active workspace
    if (auth.workspace) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: auth.workspace.id,
          userId: newAdmin.id,
          role: role === 'SUPER_ADMIN' ? 'OWNER' : role,
          status: 'ACTIVE',
        },
      });
    }

    await prisma.securityEvent.create({
      data: {
        adminId: auth.user.id,
        action: 'ADMIN_CREATED',
        resource: cleanEmail,
        result: 'SUCCESS',
        metadataJson: JSON.stringify({ role, name: newAdmin.name }),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: auth.workspace?.id,
        userId: auth.user.id,
        action: 'ADMIN_CREATED',
        entityType: 'User',
        entityId: newAdmin.id,
        metadataJson: JSON.stringify({ email: cleanEmail, role }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          status: newAdmin.status,
          isSuperAdmin: newAdmin.isSuperAdmin,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create administrator' }, { status: 500 });
  }
}

// PATCH: Update administrator (role, status, password)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can modify other admins
    if (!auth.user.isSuperAdmin && (auth.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, role, status, name, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Safety: Cannot suspend or disable final SUPER_ADMIN
    if (
      (status === 'SUSPENDED' || status === 'DISABLED' || (role && role !== 'SUPER_ADMIN')) &&
      targetAdmin.isSuperAdmin
    ) {
      const activeSuperAdmins = await prisma.user.count({
        where: {
          OR: [{ isSuperAdmin: true }, { role: 'SUPER_ADMIN' }],
          status: 'ACTIVE',
        },
      });

      if (activeSuperAdmins <= 1) {
        return NextResponse.json(
          { error: 'Action denied: Cannot demote, suspend, or disable the final active Super Administrator' },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (role) {
      updateData.role = role;
      updateData.isSuperAdmin = role === 'SUPER_ADMIN';
    }
    if (status) {
      updateData.status = status;
      if (status !== 'ACTIVE') {
        // Force revoke active sessions
        await prisma.session.deleteMany({ where: { userId: id } });
      }
    }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
      updateData.failedLoginAttempts = 0;
      updateData.lockedUntil = null;
      // Revoke sessions on password reset
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isSuperAdmin: true,
      },
    });

    await prisma.securityEvent.create({
      data: {
        adminId: auth.user.id,
        action: 'ADMIN_UPDATED',
        resource: targetAdmin.email,
        result: 'SUCCESS',
        metadataJson: JSON.stringify({ changes: Object.keys(updateData) }),
      },
    });

    return NextResponse.json({ success: true, admin: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE: Remove administrator account
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!auth.user.isSuperAdmin && (auth.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    if (id === auth.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own administrative account' }, { status: 400 });
    }

    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Safety: Protect final super admin
    if (targetAdmin.isSuperAdmin || targetAdmin.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: {
          OR: [{ isSuperAdmin: true }, { role: 'SUPER_ADMIN' }],
          status: 'ACTIVE',
        },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Action denied: Cannot delete the final active Super Administrator' },
          { status: 403 }
        );
      }
    }

    // Cascade remove sessions and user
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    await prisma.securityEvent.create({
      data: {
        adminId: auth.user.id,
        action: 'ADMIN_DELETED',
        resource: targetAdmin.email,
        result: 'SUCCESS',
        metadataJson: JSON.stringify({ email: targetAdmin.email }),
      },
    });

    return NextResponse.json({ success: true, message: 'Administrator successfully removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete admin' }, { status: 500 });
  }
}
