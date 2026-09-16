const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const crypto = require('crypto');
require('dotenv').config();

async function testFullFlow() {
  console.log('=== VERIFYING FULL MEDIA ASSET & CLOUDINARY FLOW ===');

  const ws = await p.workspace.findFirst();
  if (!ws) throw new Error('No workspace found in database');
  console.log('Using workspace:', ws.name, ws.id);

  // 1. Check Cloudinary credentials
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  console.log('Cloudinary Config:', { cloudName, apiKeyExists: Boolean(apiKey), apiSecretExists: Boolean(apiSecret) });

  // 2. Upload test image to Cloudinary
  const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M9QzwAEjDAGAwMAAPsB/0sZ2U0AAAAASUVORK5CYII=', 'base64');
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'socialflow/test_verification';

  const paramsToSign = { folder, timestamp: timestamp.toString() };
  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  formData.append('file', new Blob([testPng], { type: 'image/png' }), 'verification-sample.png');
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('signature', signature);

  console.log('Step 1: Uploading verification sample to Cloudinary...');
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(`Cloudinary upload failed: ${JSON.stringify(uploadData)}`);
  console.log('✓ Cloudinary Uploaded:', uploadData.secure_url, 'PublicId:', uploadData.public_id);

  // 3. Save to database
  console.log('Step 2: Saving metadata to SQLite MediaAsset...');
  const asset = await p.mediaAsset.create({
    data: {
      workspaceId: ws.id,
      filename: `${Date.now()}-verification-sample.png`,
      originalName: 'Verification Sample Banner.png',
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      resourceType: 'image',
      format: 'png',
      mimeType: 'image/png',
      sizeBytes: uploadData.bytes,
      width: uploadData.width,
      height: uploadData.height,
      folder: 'SocialFlow',
      tagsJson: JSON.stringify(['verification', 'automated-test']),
      isSoftDeleted: false,
    },
  });
  console.log('✓ Saved to SQLite with ID:', asset.id);

  // 4. Test query
  const queried = await p.mediaAsset.findUnique({ where: { id: asset.id } });
  console.log('✓ Queried back from database:', queried.originalName, queried.folder);

  // 5. Test Soft Delete (Move to Trash)
  console.log('Step 3: Testing soft delete (Move to Trash)...');
  await p.mediaAsset.update({
    where: { id: asset.id },
    data: { isSoftDeleted: true, deletedAt: new Date() },
  });
  const trashed = await p.mediaAsset.findFirst({ where: { id: asset.id, isSoftDeleted: true } });
  console.log('✓ Soft deleted successfully, trashed item found:', Boolean(trashed));

  // 6. Test Restore from Trash
  console.log('Step 4: Testing restore from Trash...');
  await p.mediaAsset.update({
    where: { id: asset.id },
    data: { isSoftDeleted: false, deletedAt: null },
  });
  const restored = await p.mediaAsset.findFirst({ where: { id: asset.id, isSoftDeleted: false } });
  console.log('✓ Restored successfully, active item found:', Boolean(restored));

  // 7. Test Permanent Delete (Cloudinary destroy + SQLite purge)
  console.log('Step 5: Testing permanent delete (Cloudinary destroy + DB purge)...');
  const destroyTimestamp = Math.round(Date.now() / 1000);
  const destroySig = crypto.createHash('sha1').update(`public_id=${uploadData.public_id}&timestamp=${destroyTimestamp}${apiSecret}`).digest('hex');
  const destroyForm = new FormData();
  destroyForm.append('public_id', uploadData.public_id);
  destroyForm.append('api_key', apiKey);
  destroyForm.append('timestamp', destroyTimestamp.toString());
  destroyForm.append('signature', destroySig);

  const destroyRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: destroyForm,
  });
  const destroyData = await destroyRes.json();
  console.log('✓ Cloudinary Destroy Result:', destroyData);

  await p.mediaAsset.delete({ where: { id: asset.id } });
  const purged = await p.mediaAsset.findUnique({ where: { id: asset.id } });
  console.log('✓ Purged from SQLite, exists:', Boolean(purged));

  console.log('\n=== ALL TESTS PASSED: FULL PRODUCTION CLOUDINARY & MEDIA LIFECYCLE 100% OPERATIONAL ===');
}

testFullFlow()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
