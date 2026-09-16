const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getEncryptionKey() {
  const keyHex = process.env.ENCRYPTION_KEY || DEFAULT_KEY_HEX;
  return Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
}

function decryptSecret(encryptedHex, ivHex, authTagHex) {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function main() {
  const account = await prisma.socialAccount.findFirst({
    where: { accountHandle: { contains: 'brownmonkey' } },
    include: { credentials: true, metrics: true }
  });

  if (!account || !account.credentials) {
    console.log('No account or credentials found');
    return;
  }

  const { encryptedAccessToken, iv, authTag } = account.credentials;
  try {
    const raw = decryptSecret(encryptedAccessToken, iv, authTag);
    console.log('DECRYPTED CREDENTIAL:', raw);
  } catch (err) {
    console.error('Decryption failed:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
