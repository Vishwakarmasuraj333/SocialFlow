import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      isRead: false,
    },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { notificationId, markAll } = await req.json();

  if (markAll) {
    await prisma.notification.updateMany({
      where: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
      },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  }

  if (notificationId) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  }

  return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const notificationId = searchParams.get('id');
  const clearAll = searchParams.get('clearAll') === 'true';

  if (clearAll) {
    await prisma.notification.deleteMany({
      where: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
      },
    });
    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  }

  if (notificationId) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
      },
    });
    return NextResponse.json({ success: true, message: 'Notification removed' });
  }

  return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}
