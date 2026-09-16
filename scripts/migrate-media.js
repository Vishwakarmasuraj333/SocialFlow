const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('Checking MediaAsset table columns...');
  const tableInfo = await p.$queryRawUnsafe(`PRAGMA table_info(MediaAsset);`);
  console.log('Existing columns:', tableInfo.map(c => c.name));

  const existingNames = new Set(tableInfo.map(c => c.name));

  const columnsToAdd = [
    { name: 'publicId', def: 'TEXT' },
    { name: 'resourceType', def: 'TEXT NOT NULL DEFAULT "image"' },
    { name: 'format', def: 'TEXT' },
    { name: 'duration', def: 'REAL' },
    { name: 'isSoftDeleted', def: 'BOOLEAN NOT NULL DEFAULT 0' },
    { name: 'deletedAt', def: 'DATETIME' },
  ];

  for (const col of columnsToAdd) {
    if (!existingNames.has(col.name)) {
      console.log(`Adding column ${col.name} ${col.def}...`);
      await p.$executeRawUnsafe(`ALTER TABLE MediaAsset ADD COLUMN ${col.name} ${col.def};`);
      console.log(`✓ Added ${col.name}`);
    } else {
      console.log(`✓ Column ${col.name} already exists`);
    }
  }

  // Create indexes if they don't exist
  try {
    await p.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MediaAsset_isSoftDeleted_idx" ON "MediaAsset"("isSoftDeleted");`);
    console.log('✓ Created index on isSoftDeleted');
  } catch (e) {
    console.warn('Index notice:', e.message);
  }

  const updatedInfo = await p.$queryRawUnsafe(`PRAGMA table_info(MediaAsset);`);
  console.log('Updated columns:', updatedInfo.map(c => c.name));
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
