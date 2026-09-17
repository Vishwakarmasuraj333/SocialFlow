const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findUnique({
    where: { id: 'cmu58mlg6000bl604oro0osuu' },
    include: {
      targets: true,
    }
  });
  console.log('Target post details:', JSON.stringify(post, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
