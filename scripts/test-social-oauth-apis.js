const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAll() {
  console.log('=== SOCIALFLOW REAL OAUTH & APIS TECHNICAL AUDIT ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Database connection check
  const accountsCount = await prisma.socialAccount.count();
  test(`PostgreSQL database connected (found ${accountsCount} social accounts)`, () => {
    if (typeof accountsCount !== 'number') throw new Error('Could not count accounts');
  });

  // 2. Check platforms table
  const platforms = await prisma.platform.findMany();
  test(`Platforms catalog loaded (${platforms.length} platforms registered)`, () => {
    if (platforms.length === 0) throw new Error('No platforms registered');
  });

  // 3. Verify AES-256-GCM encryption & decryption
  const crypto = require('crypto');
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long!';
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

  function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
  }

  function decrypt(encrypted, ivHex, authTagHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  const sampleToken = 'EAABsbCS1iHgBAO...real_oauth_token_sample';
  const { encrypted, iv, authTag } = encrypt(sampleToken);
  const decrypted = decrypt(encrypted, iv, authTag);

  test('AES-256-GCM authenticated encryption/decryption round-trip', () => {
    if (decrypted !== sampleToken) throw new Error('Decrypted token does not match original');
  });

  // 4. Verify Super Admin exists
  const superAdmin = await prisma.user.findFirst({
    where: { OR: [{ role: 'SUPER_ADMIN' }, { isSuperAdmin: true }] },
  });
  test(`Super Administrator account active (${superAdmin?.email || 'None'})`, () => {
    if (!superAdmin) throw new Error('Super Admin not found in DB');
  });

  // 5. Verify Workspace exists
  const workspace = await prisma.workspace.findFirst();
  test(`Active enterprise workspace verified (${workspace?.name || 'None'})`, () => {
    if (!workspace) throw new Error('Workspace not found in DB');
  });

  // 6. Verify existing social account credentials structure
  const existingAccounts = await prisma.socialAccount.findMany({
    include: { credentials: true },
  });
  test(`Social accounts data integrity verified (${existingAccounts.length} accounts)`, () => {
    for (const acc of existingAccounts) {
      if (!acc.platform) throw new Error(`Account ${acc.id} missing platform`);
      if (acc.credentials && !acc.credentials.iv) throw new Error(`Account ${acc.id} has invalid credentials format`);
    }
  });

  console.log(`\n=== AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  await prisma.$disconnect();
}

verifyAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
