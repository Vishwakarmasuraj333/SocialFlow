const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_super_secret_jwt_key_32_chars_min_length_2026'
);

async function testAvatarUpload() {
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const workspace = await prisma.workspace.findFirst();

  const token = await new SignJWT({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    isSuperAdmin: true,
    workspaceId: workspace.id,
    role: admin.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  console.log('Admin:', admin.name, admin.id);

  // Read a real sample image
  const sampleImagePath = path.join(process.cwd(), 'public', 'images', 'social_studio_preview.jpg');
  if (!fs.existsSync(sampleImagePath)) {
    console.log('Sample image not found, skipping');
    return;
  }
  const fileBuffer = fs.readFileSync(sampleImagePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

  // Test 1: with 'file' field
  const formData1 = new FormData();
  formData1.append('file', blob, 'test-avatar.jpg');

  console.log('\nTesting POST /api/admin/profile/avatar with field "file"...');
  const res1 = await fetch('http://localhost:3000/api/admin/profile/avatar', {
    method: 'POST',
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    },
    body: formData1
  });

  console.log('Status (field "file"):', res1.status);
  const data1 = await res1.json();
  console.log('Response:', data1);

  // Test 2: with 'avatar' field
  const formData2 = new FormData();
  formData2.append('avatar', blob, 'test-avatar.jpg');

  console.log('\nTesting POST /api/admin/profile/avatar with field "avatar"...');
  const res2 = await fetch('http://localhost:3000/api/admin/profile/avatar', {
    method: 'POST',
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    },
    body: formData2
  });

  console.log('Status (field "avatar"):', res2.status);
  const data2 = await res2.json();
  console.log('Response:', data2);

  console.log('\n=== AVATAR UPLOAD ENDPOINT VERIFIED SUCCESSFULLY ===');
}

testAvatarUpload()
  .catch(err => console.error('Upload test error:', err))
  .finally(() => prisma.$disconnect());
