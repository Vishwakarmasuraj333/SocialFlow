import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: auth.workspace.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'members:invite')) {
    return NextResponse.json({ error: 'Permission denied: cannot invite members' }, { status: 403 });
  }

  const { email, name, role = 'EDITOR' } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const defaultHash = await hashPassword('TempPassword123!');
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash: defaultHash,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
    });
  }

  // Check if member already in workspace
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: auth.workspace.id,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 });
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: auth.workspace.id,
      userId: user.id,
      role: role.toUpperCase(),
      status: 'ACTIVE',
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'MEMBER_INVITED',
    entityType: 'WorkspaceMember',
    entityId: member.id,
    metadata: { email, role },
  });

  return NextResponse.json({ success: true, member });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'members:manage')) {
    return NextResponse.json({ error: 'Permission denied: cannot manage member roles' }, { status: 403 });
  }

  const { memberId, role, status } = await req.json();

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId: auth.workspace.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Prevent modifying workspace owner unless user is owner
  if (member.role === 'OWNER' && auth.workspace.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the workspace owner can modify owner roles' }, { status: 403 });
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: {
      ...(role ? { role: role.toUpperCase() } : {}),
      ...(status ? { status } : {}),
    },
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'MEMBER_ROLE_UPDATED',
    entityType: 'WorkspaceMember',
    entityId: memberId,
    metadata: { newRole: role, newStatus: status },
  });

  return NextResponse.json({ success: true, member: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'members:manage')) {
    return NextResponse.json({ error: 'Permission denied: cannot remove members' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('id');

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId: auth.workspace.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  if (member.role === 'OWNER') {
    return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 });
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  return NextResponse.json({ success: true, message: 'Member removed from workspace' });
}
