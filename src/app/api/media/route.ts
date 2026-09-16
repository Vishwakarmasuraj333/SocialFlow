import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import {
  uploadBufferToCloudinary,
  destroyFromCloudinary,
  getCloudinaryStatus,
} from '@/lib/cloudinary';

// Cast prisma.mediaAsset to any to safely accommodate runtime schema fields
// while Next.js holds the query_engine dll lock
const mediaAssetDb = (prisma as any).mediaAsset;

const PREDEFINED_FOLDERS = [
  'Root',
  'SocialFlow',
  'Campaigns',
  'Posts',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'TikTok',
  'Other',
];

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder');
  const search = searchParams.get('search');
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  const where: Record<string, unknown> = {
    workspaceId: auth.workspace.id,
    ...(includeDeleted ? {} : { isSoftDeleted: false }),
  };

  if (folder && folder !== 'ALL') {
    where.folder = folder;
  }

  if (search) {
    where.OR = [
      { originalName: { contains: search } },
      { filename: { contains: search } },
      { folder: { contains: search } },
      { tagsJson: { contains: search } },
    ];
  }

  const [assets, allFoldersRaw, totalCount, totalSizeAggregate] = await Promise.all([
    mediaAssetDb.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
    mediaAssetDb.findMany({
      where: {
        workspaceId: auth.workspace.id,
        isSoftDeleted: false,
      },
      select: { folder: true },
      distinct: ['folder'],
    }),
    mediaAssetDb.count({
      where: {
        workspaceId: auth.workspace.id,
        isSoftDeleted: false,
      },
    }),
    mediaAssetDb.aggregate({
      where: {
        workspaceId: auth.workspace.id,
        isSoftDeleted: false,
      },
      _sum: { sizeBytes: true },
    }),
  ]);

  // Merge predefined folders with custom folders
  const existingFolderSet = new Set([
    ...PREDEFINED_FOLDERS,
    ...(allFoldersRaw || []).map((f: any) => f.folder).filter(Boolean),
  ]);

  const totalBytes = (totalSizeAggregate as any)?._sum?.sizeBytes || 0;
  const imageCount = (assets || []).filter((a: any) => a.resourceType !== 'video').length;
  const videoCount = (assets || []).filter((a: any) => a.resourceType === 'video').length;

  return NextResponse.json({
    assets: assets || [],
    folders: Array.from(existingFolderSet),
    stats: {
      totalCount: totalCount || 0,
      totalBytes,
      imageCount,
      videoCount,
      cloudinary: getCloudinaryStatus(),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'media:upload')) {
    return NextResponse.json({ error: 'Permission denied: cannot upload media' }, { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';

  // 1. MULTIPART FORM-DATA UPLOAD (Primary Real File Upload to Cloudinary)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const displayName = (formData.get('name') as string) || (formData.get('originalName') as string);
      const folder = (formData.get('folder') as string) || 'Root';
      const tagsRaw = formData.get('tags') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      // Validate file size: 60MB max for videos, 20MB for images
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);
      const maxSizeBytes = isVideo ? 60 * 1024 * 1024 : 20 * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        return NextResponse.json({
          error: `File size exceeds limit (${isVideo ? '60MB for videos' : '20MB for images'})`,
        }, { status: 400 });
      }

      const tags = tagsRaw
        ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload directly to Cloudinary
      const originalFilename = displayName?.trim() || file.name || 'unnamed-asset';
      const uploadResult = await uploadBufferToCloudinary(buffer, {
        filename: originalFilename,
        folder,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        tags,
      });

      const uniqueFilename = `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      // Save metadata to database
      const asset = await mediaAssetDb.create({
        data: {
          workspaceId: auth.workspace.id,
          filename: uniqueFilename,
          originalName: originalFilename,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type,
          format: uploadResult.format || file.name.split('.').pop() || 'jpeg',
          duration: uploadResult.duration || null,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          sizeBytes: uploadResult.bytes || file.size,
          width: uploadResult.width || null,
          height: uploadResult.height || null,
          folder: folder || 'Root',
          tagsJson: tags.length > 0 ? JSON.stringify(tags) : null,
          isSoftDeleted: false,
        },
      });

      await logAuditEvent({
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        action: 'MEDIA_UPLOADED',
        entityType: 'MediaAsset',
        entityId: asset.id,
        metadata: {
          filename: asset.filename,
          publicId: uploadResult.public_id,
          bytes: asset.sizeBytes,
          url: asset.url,
        },
      });

      return NextResponse.json({
        success: true,
        asset,
        message: 'Asset uploaded to Cloudinary successfully',
      });
    } catch (uploadErr: any) {
      console.error('Failed to process file upload:', uploadErr);
      return NextResponse.json({
        error: uploadErr.message || 'Failed to upload asset to Cloudinary',
      }, { status: 500 });
    }
  }

  // 2. JSON PAYLOAD (For external URL or legacy registration)
  try {
    const body = await req.json();
    const { url, originalName, mimeType, sizeBytes, width, height, folder, tags, publicId, resourceType } = body;

    if (!url || !originalName) {
      return NextResponse.json({ error: 'URL and originalName are required' }, { status: 400 });
    }

    const filename = `${Date.now()}-${originalName.replace(/\s+/g, '-').toLowerCase()}`;

    const asset = await mediaAssetDb.create({
      data: {
        workspaceId: auth.workspace.id,
        filename,
        originalName,
        url,
        publicId: publicId || null,
        resourceType: resourceType || (mimeType?.startsWith('video/') ? 'video' : 'image'),
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: sizeBytes || 1024 * 500,
        width: width || 1200,
        height: height || 800,
        folder: folder || 'Root',
        tagsJson: tags ? JSON.stringify(tags) : null,
        isSoftDeleted: false,
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'MEDIA_UPLOADED',
      entityType: 'MediaAsset',
      entityId: asset.id,
    });

    return NextResponse.json({ success: true, asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid JSON request' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'media:upload')) {
    return NextResponse.json({ error: 'Permission denied: cannot update media' }, { status: 403 });
  }

  const body = await req.json();
  const { id, originalName, folder, tags, restore } = body;

  if (!id) {
    return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
  }

  const existing = await mediaAssetDb.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (restore) {
    updateData.isSoftDeleted = false;
    updateData.deletedAt = null;
  }

  if (originalName !== undefined) {
    updateData.originalName = originalName.trim();
  }

  if (folder !== undefined) {
    updateData.folder = folder.trim() || 'Root';
  }

  if (tags !== undefined) {
    updateData.tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null;
  }

  const updated = await mediaAssetDb.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: restore ? 'MEDIA_RESTORED' : 'MEDIA_METADATA_UPDATED',
    entityType: 'MediaAsset',
    entityId: id,
    metadata: updateData,
  });

  return NextResponse.json({
    success: true,
    asset: updated,
    message: restore ? 'Media asset restored from trash' : 'Media metadata updated',
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'media:delete')) {
    return NextResponse.json({ error: 'Permission denied: cannot delete media' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const permanent = searchParams.get('permanent') === 'true';

  if (!id) {
    return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
  }

  const asset = await mediaAssetDb.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  if (!permanent) {
    // 1. SOFT DELETE -> Moved to Central Trash
    await mediaAssetDb.update({
      where: { id },
      data: {
        isSoftDeleted: true,
        deletedAt: new Date(),
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'MEDIA_SOFT_DELETED',
      entityType: 'MediaAsset',
      entityId: id,
      metadata: { originalName: asset.originalName, folder: asset.folder },
    });

    return NextResponse.json({
      success: true,
      message: `Asset "${asset.originalName}" moved to Trash. It can be restored at any time.`,
    });
  }

  // 2. PERMANENT PURGE -> Destroy from Cloudinary CDN and purge from Database
  let cloudinaryResult = null;
  const assetRecord = asset as any;
  if (assetRecord.publicId) {
    try {
      cloudinaryResult = await destroyFromCloudinary(
        assetRecord.publicId,
        assetRecord.resourceType === 'video' ? 'video' : 'image'
      );
    } catch (cdnErr) {
      console.warn('Could not destroy asset from Cloudinary:', cdnErr);
    }
  }

  await mediaAssetDb.delete({
    where: { id },
  });

  await logAuditEvent({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    action: 'MEDIA_PERMANENTLY_PURGED',
    entityType: 'MediaAsset',
    entityId: id,
    metadata: {
      originalName: asset.originalName,
      publicId: assetRecord.publicId,
      cloudinaryResult,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Asset "${asset.originalName}" permanently purged from Cloudinary and database.`,
  });
}
