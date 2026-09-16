import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { destroyFromCloudinary } from '@/lib/cloudinary';

const mediaAssetDb = (prisma as any).mediaAsset;

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    // Superadmins can inspect global workspace trash or filter by workspace
    let workspaceFilter = {};
    if (workspaceIdParam) {
      workspaceFilter = { workspaceId: workspaceIdParam };
    } else if (!auth.user.isSuperAdmin && auth.workspace) {
      workspaceFilter = { workspaceId: auth.workspace.id };
    }

    const [trashedPosts, trashedWebsites, trashedDomains, trashedLocations, trashedCampaigns, trashedMedia] = await Promise.all([
      prisma.post.findMany({
        where: { isSoftDeleted: true, ...workspaceFilter },
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
          workspace: { select: { id: true, name: true, slug: true } },
          campaign: { select: { id: true, name: true, color: true } },
          targets: true,
        },
        orderBy: { deletedAt: 'desc' },
      }),
      prisma.website.findMany({
        where: { status: 'ARCHIVED', ...workspaceFilter },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          domains: { select: { id: true, domain: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.domain.findMany({
        where: { status: 'ARCHIVED', ...workspaceFilter },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
          website: { select: { id: true, name: true, domain: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.businessLocation.findMany({
        where: { isArchived: true, ...workspaceFilter },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.campaign.findMany({
        where: { status: 'ARCHIVED', ...workspaceFilter },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
          _count: { select: { posts: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      mediaAssetDb.findMany({
        where: { isSoftDeleted: true, ...workspaceFilter },
        include: {
          workspace: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { deletedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      posts: trashedPosts,
      websites: trashedWebsites,
      domains: trashedDomains,
      locations: trashedLocations,
      campaigns: trashedCampaigns,
      media: trashedMedia || [],
      totalCount:
        trashedPosts.length +
        trashedWebsites.length +
        trashedDomains.length +
        trashedLocations.length +
        trashedCampaigns.length +
        (trashedMedia || []).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch trash items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, action, id, ids, workspaceId } = body;

    const targetIds: string[] = ids && ids.length ? ids : (id ? [id] : []);
    const targetWorkspaceId = workspaceId || auth.workspace?.id;

    // EMPTY ALL TRASH
    if (action === 'EMPTY_ALL_TRASH') {
      const filter = targetWorkspaceId && !auth.user.isSuperAdmin ? { workspaceId: targetWorkspaceId } : {};

      // 1. Safe purge of soft-deleted posts
      const postsToPurge = await prisma.post.findMany({
        where: { isSoftDeleted: true, ...filter },
        select: { id: true },
      });
      const postIds = postsToPurge.map((p) => p.id);
      if (postIds.length > 0) {
        await prisma.postTarget.deleteMany({ where: { postId: { in: postIds } } });
        await prisma.approval.deleteMany({ where: { postId: { in: postIds } } });
        await prisma.post.deleteMany({ where: { id: { in: postIds } } });
      }

      // 2. Safe purge of archived websites
      const websitesToPurge = await prisma.website.findMany({
        where: { status: 'ARCHIVED', ...filter },
        select: { id: true },
      });
      const websiteIds = websitesToPurge.map((w) => w.id);
      if (websiteIds.length > 0) {
        await prisma.webContent.deleteMany({ where: { websiteId: { in: websiteIds } } });
        await prisma.infrastructureAsset.deleteMany({ where: { websiteId: { in: websiteIds } } });
        await prisma.domain.updateMany({ where: { websiteId: { in: websiteIds } }, data: { websiteId: null } });
        await prisma.website.deleteMany({ where: { id: { in: websiteIds } } });
      }

      // 3. Safe purge of archived domains
      const domainsToPurge = await prisma.domain.findMany({
        where: { status: 'ARCHIVED', ...filter },
        select: { id: true },
      });
      const domainIds = domainsToPurge.map((d) => d.id);
      if (domainIds.length > 0) {
        await prisma.dnsRecord.deleteMany({ where: { domainId: { in: domainIds } } });
        await prisma.domain.deleteMany({ where: { id: { in: domainIds } } });
      }

      // 4. Safe purge of archived locations
      await prisma.businessLocation.deleteMany({
        where: { isArchived: true, ...filter },
      });

      // 5. Safe purge of archived campaigns
      const campaignsToPurge = await prisma.campaign.findMany({
        where: { status: 'ARCHIVED', ...filter },
        select: { id: true },
      });
      const campaignIds = campaignsToPurge.map((c) => c.id);
      if (campaignIds.length > 0) {
        await prisma.post.updateMany({ where: { campaignId: { in: campaignIds } }, data: { campaignId: null } });
        await prisma.campaign.deleteMany({ where: { id: { in: campaignIds } } });
      }

      await prisma.auditLog.create({
        data: {
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'CENTRAL_TRASH_EMPTIED',
          entityType: 'System',
          metadataJson: JSON.stringify({
            emptiedBy: auth.user.email,
            deletedPosts: postIds.length,
            deletedWebsites: websiteIds.length,
            deletedDomains: domainIds.length,
            deletedCampaigns: campaignIds.length,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Central Trash emptied completely (${postIds.length + websiteIds.length + domainIds.length + campaignIds.length} assets permanently deleted).`,
      });
    }

    if (!category || !action) {
      return NextResponse.json({ error: 'Category and action are required' }, { status: 400 });
    }

    if (!targetIds.length) {
      return NextResponse.json({ error: 'No item IDs provided' }, { status: 400 });
    }

    // WEBSITES
    if (category === 'websites') {
      if (action === 'RESTORE') {
        const result = await prisma.website.updateMany({
          where: { id: { in: targetIds } },
          data: { status: 'ACTIVE' },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'WEBSITES_RESTORED',
          entityType: 'Website',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} website(s) restored to active fleet.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        await prisma.webContent.deleteMany({ where: { websiteId: { in: targetIds } } });
        await prisma.infrastructureAsset.deleteMany({ where: { websiteId: { in: targetIds } } });
        await prisma.domain.updateMany({ where: { websiteId: { in: targetIds } }, data: { websiteId: null } });
        const result = await prisma.website.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'WEBSITES_PERMANENTLY_DELETED',
          entityType: 'Website',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} website(s) permanently deleted from database.` });
      }
    }

    // DOMAINS
    if (category === 'domains') {
      if (action === 'RESTORE') {
        const result = await prisma.domain.updateMany({
          where: { id: { in: targetIds } },
          data: { status: 'ACTIVE' },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'DOMAINS_RESTORED',
          entityType: 'Domain',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} domain(s) restored successfully.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        await prisma.dnsRecord.deleteMany({ where: { domainId: { in: targetIds } } });
        const result = await prisma.domain.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'DOMAINS_PERMANENTLY_DELETED',
          entityType: 'Domain',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} domain(s) permanently deleted from database.` });
      }
    }

    // LOCATIONS
    if (category === 'locations') {
      if (action === 'RESTORE') {
        const result = await prisma.businessLocation.updateMany({
          where: { id: { in: targetIds } },
          data: { isArchived: false, status: 'ACTIVE' },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'LOCATIONS_RESTORED',
          entityType: 'BusinessLocation',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} location(s) restored to active directory.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        const result = await prisma.businessLocation.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'LOCATIONS_PERMANENTLY_DELETED',
          entityType: 'BusinessLocation',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} location(s) permanently deleted from database.` });
      }
    }

    // POSTS
    if (category === 'posts') {
      if (action === 'RESTORE') {
        const result = await prisma.post.updateMany({
          where: { id: { in: targetIds } },
          data: { isSoftDeleted: false, deletedAt: null },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'POSTS_RESTORED',
          entityType: 'Post',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} post(s) restored to active feed.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        await prisma.postTarget.deleteMany({ where: { postId: { in: targetIds } } });
        await prisma.approval.deleteMany({ where: { postId: { in: targetIds } } });
        const result = await prisma.post.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'POSTS_PERMANENTLY_DELETED',
          entityType: 'Post',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} post(s) permanently deleted from database.` });
      }
    }

    // CAMPAIGNS
    if (category === 'campaigns') {
      if (action === 'RESTORE') {
        const result = await prisma.campaign.updateMany({
          where: { id: { in: targetIds } },
          data: { status: 'ACTIVE' },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'CAMPAIGNS_RESTORED',
          entityType: 'Campaign',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} campaign(s) restored to active campaigns.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        await prisma.post.updateMany({ where: { campaignId: { in: targetIds } }, data: { campaignId: null } });
        const result = await prisma.campaign.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'CAMPAIGNS_PERMANENTLY_DELETED',
          entityType: 'Campaign',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} campaign(s) permanently deleted from database.` });
      }
    }

    // MEDIA ASSETS (Cloudinary CDN + Database sync)
    if (category === 'media') {
      if (action === 'RESTORE') {
        const result = await mediaAssetDb.updateMany({
          where: { id: { in: targetIds } },
          data: { isSoftDeleted: false, deletedAt: null },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'MEDIA_RESTORED',
          entityType: 'MediaAsset',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} media asset(s) restored to library.` });
      }

      if (action === 'PERMANENT_DELETE' || action === 'DELETE') {
        const assets = await mediaAssetDb.findMany({
          where: { id: { in: targetIds } },
        });

        for (const asset of assets) {
          if (asset.publicId) {
            try {
              await destroyFromCloudinary(
                asset.publicId,
                asset.resourceType === 'video' ? 'video' : 'image'
              );
            } catch (cdnErr) {
              console.warn(`Failed to destroy ${asset.publicId} on Cloudinary:`, cdnErr);
            }
          }
        }

        const result = await mediaAssetDb.deleteMany({
          where: { id: { in: targetIds } },
        });

        await logAuditEvent({
          workspaceId: targetWorkspaceId || null,
          userId: auth.user.id,
          action: 'MEDIA_PERMANENTLY_PURGED',
          entityType: 'MediaAsset',
          metadata: { count: result.count, ids: targetIds },
        });

        return NextResponse.json({ success: true, message: `${result.count} media asset(s) permanently purged from Cloudinary and database.` });
      }
    }

    return NextResponse.json({ error: 'Invalid category or action' }, { status: 400 });
  } catch (error: any) {
    console.error('Trash API error:', error);
    return NextResponse.json({ error: error.message || 'Trash operation failed' }, { status: 500 });
  }
}
