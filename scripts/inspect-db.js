const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const ws = await p.workspace.findMany();
  console.log('Workspaces:', ws.map(w => ({ id: w.id, name: w.name })));
  
  const websites = await p.website.findMany();
  console.log('Websites:', websites.map(w => ({ id: w.id, name: w.name, domain: w.domain, url: w.url, env: w.environment, notes: w.notes })));
  
  const infra = await p.infrastructureAsset.count();
  const media = await p.mediaAsset.count();
  const sec = await p.securityEvent.count();
  const users = await p.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  
  const domains = await p.domain.findMany({ select: { id: true, domain: true, status: true, sslStatus: true, websiteId: true } });
  console.log('Domains:', domains);
  console.log({ infra, media, sec, usersCount: users.length });
}

main().catch(console.error).finally(() => p.$disconnect());
