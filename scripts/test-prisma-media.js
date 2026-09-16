const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  const assets = await p.mediaAsset.findMany();
  console.log('Successfully queried MediaAsset, count:', assets.length);
}

test().catch(console.error).finally(() => p.$disconnect());
