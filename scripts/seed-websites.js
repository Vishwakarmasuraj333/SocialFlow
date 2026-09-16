const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.findFirst({
    where: { slug: 'acme-media' }
  }) || await prisma.workspace.findFirst();

  if (!workspace) {
    console.error('No workspace found!');
    return;
  }

  const user = await prisma.user.findFirst();
  console.log(`Using workspace: ${workspace.name} (${workspace.id})`);

  // Clean existing demo/test websites if any with matching domain
  await prisma.website.deleteMany({
    where: {
      domain: { in: ['tuvaa1.vercel.app', 'fototrendz.vercel.app'] }
    }
  });

  // 1. TUVAA
  const tuvaa = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      name: 'TUVAA – The United Voice of African Associations',
      domain: 'tuvaa1.vercel.app',
      url: 'https://tuvaa1.vercel.app/',
      productionUrl: 'https://tuvaa.org.uk',
      deploymentUrl: 'https://tuvaa1.vercel.app',
      repoUrl: 'https://github.com/tuvaa/tuvaa-platform',
      cms: 'Next.js 15',
      framework: 'Next.js / Turbopack',
      hostingProvider: 'Vercel',
      serverProvider: 'Vercel Edge Network',
      serverIp: '76.76.21.21',
      sslStatus: 'ACTIVE',
      sslExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      domainExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      dnsProvider: 'Vercel DNS',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      notes: 'Umbrella organisation uniting African community groups, professionals, and businesses in the UK. Features B2B event ticketing, community directories, and youth initiatives.',
      createdById: user ? user.id : null,
      domains: {
        create: [
          {
            workspaceId: workspace.id,
            domain: 'tuvaa1.vercel.app',
            registrar: 'Vercel Inc.',
            dnsProvider: 'Vercel DNS',
            sslStatus: 'ACTIVE',
            isVerified: true,
            status: 'ACTIVE',
          },
          {
            workspaceId: workspace.id,
            domain: 'tuvaa.org.uk',
            registrar: 'Nominet UK',
            dnsProvider: 'Cloudflare',
            sslStatus: 'ACTIVE',
            isVerified: true,
            status: 'ACTIVE',
          }
        ]
      },
      contents: {
        create: [
          {
            type: 'PAGE',
            title: 'Home & Welcome Portal',
            slug: 'home',
            content: 'Official homepage of The United Voice of African Associations in Southampton and UK.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'Our Services & Community Welfare',
            slug: 'our-services',
            content: 'BAME mental health, culture promotion, and community integration programmes.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'BBAM Festival 2025 Registration',
            slug: 'bbam-2',
            content: 'Black Business Art and Music Festival at Guildhall Square.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'Events & Cultural Commemorations',
            slug: 'our-events',
            content: 'Community events, youth workshops, and commemorative cultural assemblies.',
            status: 'PUBLISHED',
          }
        ]
      }
    }
  });

  console.log(`Created website: ${tuvaa.name} (${tuvaa.id})`);

  // 2. FOTO TRENDZ
  const fototrendz = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      name: 'Foto Trendz | Professional Portrait Studio',
      domain: 'fototrendz.vercel.app',
      url: 'https://fototrendz.vercel.app/',
      productionUrl: 'https://fototrendz.vercel.app',
      deploymentUrl: 'https://fototrendz.vercel.app',
      repoUrl: 'https://github.com/fototrendz/studio-web',
      cms: 'Next.js 15',
      framework: 'Next.js / Tailwind CSS',
      hostingProvider: 'Vercel',
      serverProvider: 'Vercel Edge Network',
      serverIp: '76.76.21.21',
      sslStatus: 'ACTIVE',
      sslExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      domainExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      dnsProvider: 'Vercel DNS',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      notes: 'Professional home portrait studio photography directly to your home. Specialists in family, baby, kids, and pet portraits with mobile studio lighting.',
      createdById: user ? user.id : null,
      domains: {
        create: [
          {
            workspaceId: workspace.id,
            domain: 'fototrendz.vercel.app',
            registrar: 'Vercel Inc.',
            dnsProvider: 'Vercel DNS',
            sslStatus: 'ACTIVE',
            isVerified: true,
            status: 'ACTIVE',
          }
        ]
      },
      contents: {
        create: [
          {
            type: 'PAGE',
            title: 'Home & Studio Showcase',
            slug: 'home',
            content: 'Foto Trendz professional home portrait studio Southampton.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'Family & Newborn Portraits',
            slug: 'portfolio-family',
            content: 'Cherished memories captured in the comfort of your living room.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'Pet Photography Sessions',
            slug: 'portfolio-pets',
            content: 'High resolution artistic pet studio photography and prints.',
            status: 'PUBLISHED',
          },
          {
            type: 'PAGE',
            title: 'Pricing Packages & Bookings',
            slug: 'contact',
            content: 'Booking calendar and package rates for Southampton home shoots.',
            status: 'PUBLISHED',
          }
        ]
      }
    }
  });

  console.log(`Created website: ${fototrendz.name} (${fototrendz.id})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
