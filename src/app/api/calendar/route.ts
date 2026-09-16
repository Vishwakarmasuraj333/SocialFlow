import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
  const endDate = end ? new Date(end) : new Date(new Date().setMonth(new Date().getMonth() + 1));

  const posts = await prisma.post.findMany({
    where: {
      workspaceId: auth.workspace.id,
      isSoftDeleted: false,
      OR: [
        {
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    include: {
      targets: true,
      campaign: { select: { id: true, name: true, color: true } },
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return NextResponse.json({ posts });
}
