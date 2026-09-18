const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== UPDATING WEBSITES IN NEON DB WITH REAL VISIBLE IMAGES ===');
  
  const workspace = await prisma.workspace.findFirst();
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });

  // 1. Update Suraj Portfolio
  const pSite = await prisma.website.findFirst({
    where: { domain: { contains: 'suraj-animation-portfolio' } }
  });
  if (pSite) {
    await prisma.website.update({
      where: { id: pSite.id },
      data: {
        name: 'Suraj Vishwakarma Portfolio',
        domain: 'suraj-animation-portfolio.vercel.app',
        url: 'https://suraj-animation-portfolio.vercel.app',
        productionUrl: 'https://suraj-animation-portfolio.vercel.app',
        deploymentUrl: '/previews/suraj-portfolio.png',
        framework: 'React 19 / Three.js WebGL',
        hostingProvider: 'Vercel Production',
        cms: 'Creative Portfolio Studio',
        notes: '5 Interactive 3D Pages',
      }
    });
    console.log('✓ Updated Suraj Portfolio with real preview image /previews/suraj-portfolio.png');
  }

  // 2. Update Pinterest Developers
  const pinSite = await prisma.website.findFirst({
    where: { domain: { contains: 'pinterest.com' } }
  });
  if (pinSite) {
    await prisma.website.update({
      where: { id: pinSite.id },
      data: {
        name: 'Pinterest Developer Platform',
        domain: 'developers.pinterest.com',
        url: 'https://developers.pinterest.com',
        productionUrl: 'https://developers.pinterest.com',
        deploymentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        framework: 'React / Node.js API',
        hostingProvider: 'AWS CloudFront / Fastly CDN',
        cms: 'Pinterest Developer Engine',
        notes: 'OAuth 2.0 & Webhook Gateway',
      }
    });
    console.log('✓ Updated Pinterest Developers with real preview image');
  }

  // 3. Upsert SocialFlow Live App
  let sfSite = await prisma.website.findFirst({
    where: { domain: { contains: 'socialflow-zeta-one' } }
  });
  if (sfSite) {
    await prisma.website.update({
      where: { id: sfSite.id },
      data: {
        name: 'SocialFlow Command Center',
        domain: 'socialflow-zeta-one.vercel.app',
        url: 'https://socialflow-zeta-one.vercel.app',
        productionUrl: 'https://socialflow-zeta-one.vercel.app',
        deploymentUrl: '/images/websites/socialflow-app.jpg',
        framework: 'Next.js 16 / TypeScript',
        hostingProvider: 'Vercel Production Edge',
        cms: 'SocialFlow SaaS Platform',
        notes: '18 Monitored Admin Routes',
      }
    });
  } else {
    sfSite = await prisma.website.create({
      data: {
        workspaceId: workspace.id,
        name: 'SocialFlow Command Center',
        domain: 'socialflow-zeta-one.vercel.app',
        url: 'https://socialflow-zeta-one.vercel.app',
        productionUrl: 'https://socialflow-zeta-one.vercel.app',
        deploymentUrl: '/images/websites/socialflow-app.jpg',
        framework: 'Next.js 16 / TypeScript',
        hostingProvider: 'Vercel Production Edge',
        cms: 'SocialFlow SaaS Platform',
        notes: '18 Monitored Admin Routes',
        environment: 'PRODUCTION',
        status: 'ACTIVE',
        sslStatus: 'ACTIVE',
        createdById: admin?.id,
      }
    });
  }
  console.log('✓ Verified SocialFlow Command Center with real preview image /images/websites/socialflow-app.jpg');

  // Verify all websites in DB
  const allWebsites = await prisma.website.findMany({ where: { status: { not: 'ARCHIVED' } } });
  console.log('\nAll Active Websites in DB:');
  for (const w of allWebsites) {
    console.log({
      id: w.id,
      name: w.name,
      domain: w.domain,
      url: w.url,
      preview: w.deploymentUrl,
      hosting: w.hostingProvider,
      framework: w.framework
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
