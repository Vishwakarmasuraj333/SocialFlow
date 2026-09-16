import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { canPublishDirectly } from '@/lib/rbac';
import { executePostPublishing } from '@/services/publishing-service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canPublishDirectly(auth.workspace.role)) {
    return NextResponse.json({ error: 'Permission denied: cannot trigger live publishing' }, { status: 403 });
  }

  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const result = await executePostPublishing(post.id);
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Publish execution failed';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
