import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { executePostPublishing } from '@/services/publishing-service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const result = await executePostPublishing(id);

    return NextResponse.json({
      success: result.overallStatus === 'PUBLISHED',
      overallStatus: result.overallStatus,
      targets: result.targets,
      errorMessage: result.errorMessage,
    });
  } catch (error: any) {
    console.error('Error publishing post:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish post' }, { status: 500 });
  }
}
