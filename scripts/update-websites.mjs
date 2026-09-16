import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.website.updateMany({
    where: { domain: 'blog.socialflow.io' },
    data: {
      status: 'ACTIVE',
      cms: 'Next.js MDX Engine',
      framework: 'Next.js 16 / TypeScript',
      deploymentUrl: '/images/websites/socialflow-blog.jpg',
      notes: 'Official Engineering Blog'
    }
  });

  await prisma.website.updateMany({
    where: { domain: 'docs.socialflow.io' },
    data: {
      status: 'ACTIVE',
      cms: 'Interactive API Docs Engine',
      framework: 'Next.js / OpenAPI',
      deploymentUrl: '/images/websites/socialflow-docs.jpg',
      notes: 'Developer Portal & API Reference'
    }
  });

  await prisma.website.updateMany({
    where: { domain: 'socialflow.io' },
    data: {
      status: 'ACTIVE',
      cms: 'Next.js 16 Production Core',
      framework: 'React 19 / TypeScript',
      deploymentUrl: '/images/websites/socialflow-app.jpg',
      notes: 'Omni-Channel Social Command Center'
    }
  });

  // Also ensure domain records are ACTIVE
  await prisma.domain.updateMany({
    data: { status: 'ACTIVE' }
  });

  const sites = await prisma.website.findMany();
  console.log('Websites restored and updated:');
  for (const s of sites) {
    console.log(`- ${s.name} | Status: ${s.status} | CMS: ${s.cms} | Img: ${s.deploymentUrl}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
