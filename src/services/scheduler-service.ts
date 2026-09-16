import prisma from '@/lib/db';
import { executePostPublishing } from './publishing-service';

export async function processDueScheduledPosts(): Promise<{
  processedCount: number;
  results: Array<{ postId: string; status: string }>;
}> {
  const now = new Date();

  const duePosts = await prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      isSoftDeleted: false,
      scheduledAt: {
        lte: now,
      },
    },
    take: 20,
  });

  const results: Array<{ postId: string; status: string }> = [];

  for (const post of duePosts) {
    try {
      const res = await executePostPublishing(post.id);
      results.push({ postId: post.id, status: res.overallStatus });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'FAILED' },
      });
      results.push({ postId: post.id, status: `FAILED: ${errMsg}` });
    }
  }

  return {
    processedCount: duePosts.length,
    results,
  };
}
