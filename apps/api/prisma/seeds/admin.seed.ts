import { PrismaClient } from '../../node_modules/.prisma/client/index.js';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(prisma: PrismaClient) {
  const superAdminRole = await prisma.role.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      isActive: true,
      translations: {
        create: [
          { langId: 'en', name: 'Super Admin' },
          { langId: 'ar', name: 'مدير العام' },
        ],
      },
    },
  });

  console.log('Super Admin Role created/updated');

  const permissions = [
    { resource: 'dashboard', action: 'read' },
    ...['returns', 'exchanges'].flatMap((resource) => ['list', 'read', 'update'].map((action) => ({ resource, action }))),
  ];
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: permission },
      update: { roles: { connect: { id: superAdminRole.id } } },
      create: { ...permission, roles: { connect: { id: superAdminRole.id } } },
    });
  }

  const adminEmail = 'admin@info.com';
  const hashedPassword = await bcrypt.hash('123456789', 10);

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
  return { superAdminRole, adminUser };
}
