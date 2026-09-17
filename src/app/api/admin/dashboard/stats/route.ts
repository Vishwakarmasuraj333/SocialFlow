import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const workspaceId = auth.workspace?.id;

    const [
      totalWebsites,
      activeWebsites,
      totalDomains,
      totalSocialAccounts,
      connectedSocialAccounts,
      scheduledPosts,
      publishedPosts,
      failedPosts,
      totalMediaAssets,
      totalInfrastructureAssets,
      activeAdmins,
      totalSecurityEvents,
      recentSecurityEvents,
      recentPosts,
      recentWebsites,
    ] = await Promise.all([
      // Websites (Exclude ARCHIVED)
      prisma.website.count({
        where: {
          status: { not: 'ARCHIVED' },
          ...(workspaceId ? { workspaceId } : {}),
        },
      }),
      prisma.website.count({
        where: {
          status: 'ACTIVE',
          ...(workspaceId ? { workspaceId } : {}),
        },
      }),

      // Domains (Exclude ARCHIVED)
      prisma.domain.count({
        where: {
          status: { not: 'ARCHIVED' },
          ...(workspaceId ? { workspaceId } : {}),
        },
      }),

      // Social Accounts
      prisma.socialAccount.count({ where: { isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) } }),
      prisma.socialAccount.count({ where: { status: 'CONNECTED', isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) } }),

      // Posts
      prisma.post.count({ where: { status: 'SCHEDULED', isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) } }),
      prisma.post.count({ where: { status: 'PUBLISHED', isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) } }),
      prisma.post.count({ where: { status: 'FAILED', isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) } }),

      // Media Assets
      prisma.mediaAsset.count({ where: workspaceId ? { workspaceId } : {} }),

      // Infrastructure Assets (Exclude ARCHIVED)
      prisma.infrastructureAsset.count({
        where: {
          isArchived: false,
          status: { not: 'ARCHIVED' },
          ...(workspaceId ? { workspaceId } : {}),
        },
      }),

      // Admins (Users with ACTIVE status)
      prisma.user.count({ where: { status: 'ACTIVE' } }),

      // Security Events
      prisma.securityEvent.count(),

      // Recent Security Events
      prisma.securityEvent.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { name: true, email: true, role: true } } },
      }),

      // Recent Posts
      prisma.post.findMany({
        take: 5,
        where: { isSoftDeleted: false, ...(workspaceId ? { workspaceId } : {}) },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } }, targets: true },
      }),

      // Recent Websites (Exclude ARCHIVED)
      prisma.website.findMany({
        take: 6,
        where: {
          status: { not: 'ARCHIVED' },
          ...(workspaceId ? { workspaceId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: { domains: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalWebsites,
        activeWebsites,
        domains: totalDomains,
        socialAccounts: totalSocialAccounts,
        connectedPlatforms: connectedSocialAccounts,
        scheduledPosts,
        publishedPosts,
        failedPosts,
        mediaAssets: totalMediaAssets,
        infrastructureAssets: totalInfrastructureAssets,
        activeAdmins,
        securityEvents: totalSecurityEvents,
      },
      recentSecurityEvents,
      recentPosts,
      recentWebsites,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to compute dashboard metrics' }, { status: 500 });
  }
}
