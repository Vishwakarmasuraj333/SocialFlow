import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_HFj6NlAykKG9@ep-wild-sun-b5lsyx53-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const databaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
    ? process.env.DATABASE_URL.trim()
    : DEFAULT_DATABASE_URL;

// Ensure process.env.DATABASE_URL is populated so schema validation never fails
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

