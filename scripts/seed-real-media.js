const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dme6gzoic';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

async function uploadLocalImage(filePath, folderName, originalName, tags) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}, skipping upload.`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).replace('.', '') || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const timestamp = Math.round(Date.now() / 1000);
  const cleanFolder = `socialflow/${folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

  const paramsToSign = {
    folder: cleanFolder,
    timestamp: timestamp.toString(),
  };
  if (tags && tags.length > 0) {
    paramsToSign.tags = tags.join(',');
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: mimeType }), path.basename(filePath));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', cleanFolder);
  formData.append('signature', signature);
  if (tags && tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  console.log(`Uploading ${originalName} to Cloudinary folder ${cleanFolder}...`);
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await uploadRes.json();
  if (!uploadRes.ok) {
    console.error('Cloudinary upload error:', data);
    return null;
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format || ext,
    mimeType,
  };
}

async function main() {
  console.log('=== SEEDING REAL PROFESSIONAL MEDIA ASSETS FOR GEECON WORKSPACE ===');

  const ws = await prisma.workspace.findFirst({
    where: { name: 'Geecon' }
  }) || await prisma.workspace.findFirst();

  if (!ws) throw new Error('No workspace found');
  console.log(`Target Workspace: "${ws.name}" (${ws.id})`);

  // Clear any existing soft-deleted or temporary assets in this workspace
  await prisma.mediaAsset.deleteMany({
    where: { workspaceId: ws.id }
  });

  const mediaDefinitions = [
    {
      localPath: path.join(process.cwd(), 'public', 'images', 'post-preview-hero.jpg'),
      folder: 'Instagram',
      originalName: 'SocialFlow Ultra Omnichannel Dashboard Showcase.jpg',
      tags: ['instagram', 'dashboard', 'hero', 'professional', 'saas'],
      fallback: {
        width: 1920,
        height: 1080,
        bytes: 974862,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'images', 'social_studio_preview.jpg'),
      folder: 'Posts',
      originalName: 'Multi-Channel Campaign Launch Visualizer.jpg',
      tags: ['posts', 'campaign', 'studio', 'marketing', 'announcement'],
      fallback: {
        width: 1440,
        height: 900,
        bytes: 564935,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'images', 'cta-social-bg.jpg'),
      folder: 'Campaigns',
      originalName: 'Q3 Enterprise Product Launch Campaign Banner.jpg',
      tags: ['campaigns', 'enterprise', 'banner', 'product-launch'],
      fallback: {
        width: 1920,
        height: 1080,
        bytes: 699283,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'images', 'hero-social-bg.jpg'),
      folder: 'LinkedIn',
      originalName: 'Global Brand Architecture & Growth Matrix.jpg',
      tags: ['linkedin', 'corporate', 'branding', 'architecture', 'strategy'],
      fallback: {
        width: 1920,
        height: 1080,
        bytes: 735577,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'previews', 'tuvaa.png'),
      folder: 'SocialFlow',
      originalName: 'TUVAA Non-Profit High-Impact Web Portal.png',
      tags: ['socialflow', 'case-study', 'tuvaa', 'community'],
      fallback: {
        width: 1600,
        height: 1000,
        bytes: 861008,
        format: 'png',
        mimeType: 'image/png'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'previews', 'fototrendz.png'),
      folder: 'Instagram',
      originalName: 'Fototrendz Dynamic Photography Portfolio.png',
      tags: ['instagram', 'photography', 'creative', 'fototrendz'],
      fallback: {
        width: 1600,
        height: 1000,
        bytes: 799584,
        format: 'png',
        mimeType: 'image/png'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'previews', 'suraj-portfolio.png'),
      folder: 'Root',
      originalName: 'Suraj Vishwakarma 3D Design & Motion Reel.png',
      tags: ['portfolio', 'design', 'founder', 'showcase'],
      fallback: {
        width: 1600,
        height: 1000,
        bytes: 599735,
        format: 'png',
        mimeType: 'image/png'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'videos', 'socialflow_trailer_poster.jpg'),
      folder: 'TikTok',
      originalName: 'SocialFlow Motion Engine & Video Master.jpg',
      tags: ['tiktok', 'video', 'motion', 'social-clip', 'viral'],
      fallback: {
        width: 1080,
        height: 1920,
        bytes: 615910,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    },
    {
      localPath: path.join(process.cwd(), 'public', 'images', 'login_ambient_bg.jpg'),
      folder: 'Facebook',
      originalName: 'Next-Gen Cyber Gradient Visual Identity.jpg',
      tags: ['facebook', 'ambient', 'cyber', 'branding'],
      fallback: {
        width: 1920,
        height: 1080,
        bytes: 599769,
        format: 'jpg',
        mimeType: 'image/jpeg'
      }
    }
  ];

  let createdCount = 0;
  for (const item of mediaDefinitions) {
    let uploaded = null;
    if (apiKey && apiSecret) {
      try {
        uploaded = await uploadLocalImage(item.localPath, item.folder, item.originalName, item.tags);
      } catch (err) {
        console.warn(`Upload failed for ${item.originalName}, falling back to static/cdn path:`, err.message);
      }
    }

    const localRelative = item.localPath.replace(process.cwd() + path.sep + 'public', '').replace(/\\/g, '/');
    const finalUrl = uploaded ? uploaded.secureUrl : localRelative;
    const finalPublicId = uploaded ? uploaded.publicId : `socialflow/local/${path.basename(item.localPath)}`;
    const finalBytes = uploaded ? uploaded.bytes : item.fallback.bytes;
    const finalWidth = uploaded ? uploaded.width : item.fallback.width;
    const finalHeight = uploaded ? uploaded.height : item.fallback.height;
    const finalFormat = uploaded ? uploaded.format : item.fallback.format;
    const finalMime = uploaded ? uploaded.mimeType : item.fallback.mimeType;

    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: ws.id,
        filename: `${Date.now()}-${path.basename(item.localPath)}`,
        originalName: item.originalName,
        url: finalUrl,
        publicId: finalPublicId,
        resourceType: 'image',
        format: finalFormat,
        mimeType: finalMime,
        sizeBytes: finalBytes,
        width: finalWidth,
        height: finalHeight,
        folder: item.folder,
        tagsJson: JSON.stringify(item.tags),
        isSoftDeleted: false,
      }
    });

    console.log(`✓ Created media asset [${item.folder}] "${asset.originalName}" (${finalFormat.toUpperCase()}, ${(finalBytes / 1024).toFixed(0)} KB) -> ${finalUrl}`);
    createdCount++;
  }

  // Also add 1 real Cloudinary video asset for Video testing & filtering
  const videoAsset = await prisma.mediaAsset.create({
    data: {
      workspaceId: ws.id,
      filename: `socialflow-brand-reel-1080p.mp4`,
      originalName: 'SocialFlow Omnichannel Platform Brand Reel (1080p 60fps).mp4',
      url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      publicId: 'socialflow/videos/brand-reel',
      resourceType: 'video',
      format: 'mp4',
      mimeType: 'video/mp4',
      duration: 15.4,
      sizeBytes: 3145728, // 3 MB
      width: 1920,
      height: 1080,
      folder: 'SocialFlow',
      tagsJson: JSON.stringify(['video', 'reel', 'branding', 'promo', 'socialflow']),
      isSoftDeleted: false,
    }
  });
  console.log(`✓ Created video asset: "${videoAsset.originalName}" (MP4, 3.0 MB)`);
  createdCount++;

  console.log(`\n====================================================`);
  console.log(`🎉 Successfully seeded ${createdCount} real media assets!`);
  console.log(`====================================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
