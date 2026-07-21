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

const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

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
