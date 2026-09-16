import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const platform = searchParams.get('platform');

  const where: Record<string, unknown> = {
    workspaceId: auth.workspace.id,
  };

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (type && type !== 'ALL') {
    where.type = type;
  }

  if (platform && platform !== 'ALL') {
    where.platform = platform;
  }

  const items = await prisma.inboxItem.findMany({
    where,
    include: {
      socialAccount: {
        select: { id: true, platform: true, accountName: true, accountHandle: true, avatarUrl: true },
      },
      replies: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      assignedTo: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { receivedAt: 'desc' },
  });

  return NextResponse.json({ items });
}
