import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in environment');
}

const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

  // 1. Create Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      nameEn: 'Super Admin',
      nameAr: 'مدير خارق',
      isActive: true,
    },
  });

  console.log('Super Admin Role created/updated');

  // 2. Create Super Admin User
  const adminEmail = 'admin@fayendra.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      roleId: superAdminRole.id,
      userType: 'admin',
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      roleId: superAdminRole.id,
      userType: 'admin',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`Super Admin User created/updated: ${adminUser.email}`);
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
