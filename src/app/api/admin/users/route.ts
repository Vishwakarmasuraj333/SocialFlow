import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET all users (Superadmin only)
export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      isSuperAdmin: u.isSuperAdmin,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt,
      memberships: u.memberships,
    })),
  });
}

// POST: Create a new user with password (Superadmin only)
export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, isSuperAdmin, workspaceId, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        isSuperAdmin: Boolean(isSuperAdmin),
        isEmailVerified: true,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    // Assign to active workspace if specified, or active workspace of superadmin
    const targetWorkspaceId = workspaceId || auth.workspace?.id;
    if (targetWorkspaceId) {
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: targetWorkspaceId,
          role: role || 'EDITOR',
          status: 'ACTIVE',
        },
      });
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        workspaceId: targetWorkspaceId || null,
        userId: auth.user.id,
        action: 'ADMIN_USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        metadataJson: JSON.stringify({ createdEmail: user.email, isSuperAdmin: user.isSuperAdmin }),
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

// PATCH: Update user info / reset password (Superadmin only)
export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, name, email, password, isSuperAdmin, role, workspaceId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase().trim();
    if (typeof isSuperAdmin === 'boolean') updateData.isSuperAdmin = isSuperAdmin;
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update workspace member role if specified
    if (role) {
      if (workspaceId) {
        const existingMember = await prisma.workspaceMember.findUnique({
          where: { workspaceId_userId: { workspaceId, userId } },
        });
        if (existingMember) {
          await prisma.workspaceMember.update({
            where: { id: existingMember.id },
            data: { role },
          });
        } else {
          await prisma.workspaceMember.create({
            data: { workspaceId, userId, role, status: 'ACTIVE' },
          });
        }
      } else {
        const members = await prisma.workspaceMember.findMany({ where: { userId } });
        if (members.length > 0) {
          await prisma.workspaceMember.updateMany({
            where: { userId },
            data: { role },
          });
        } else if (auth.workspace?.id) {
          await prisma.workspaceMember.create({
            data: { workspaceId: auth.workspace.id, userId, role, status: 'ACTIVE' },
          });
        }
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'ADMIN_USER_UPDATED',
        entityType: 'User',
        entityId: userId,
        metadataJson: JSON.stringify({
          updatedFields: Object.keys(updateData),
          passwordReset: Boolean(password),
        }),
      },
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isSuperAdmin: updatedUser.isSuperAdmin,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: Delete user (Superadmin only)
export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent superadmin from deleting themselves
    if (userId === auth.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own active superadmin account' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: 'ADMIN_USER_DELETED',
        entityType: 'User',
        entityId: userId,
      },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
