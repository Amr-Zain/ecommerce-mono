import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { seedAdmin } from './seeds/admin.seed.ts';
import { seedEmailTemplates } from './seeds/email-templates.seed.ts';
import { seedStorefront } from './seeds/storefront.seed.ts';
import { seedLoyalty } from './seeds/loyalty.seed.ts';
import { seedDashboard } from './seeds/dashboard.seed.ts';
import { seedPaymentGateways } from './seeds/payment-gateways.seed.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in environment');
}

const schema = new URL(databaseUrl).searchParams.get('schema') ?? 'public';
const pool = new pg.Pool({
  connectionString: databaseUrl,
  options: `-c search_path=${schema.replace(/[^a-zA-Z0-9_]/g, '')}`,
});
const adapter = new PrismaPg(pool, { schema });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

  if (process.env.SEED_SCOPE === 'storefront') {
    await seedStorefront(prisma);
    console.log('Storefront seed completed successfully!');
    return;
  }

  if (process.env.SEED_SCOPE === 'email-templates') {
    await seedEmailTemplates(prisma);
    console.log('Email template seed completed successfully!');
    return;
  }

  await seedAdmin(prisma);
  await seedLoyalty(prisma);
  await seedStorefront(prisma);
  await seedPaymentGateways(prisma);
  await seedDashboard(prisma);
  await seedEmailTemplates(prisma);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
