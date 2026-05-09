import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(PermissionDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.discoverAndSyncPermissions();
  }

  /**
   * Discover all permissions from controllers and sync to database
   */
  private async discoverAndSyncPermissions() {
    this.logger.log('🔍 Discovering permissions from controllers...');

    const discoveredPermissions = new Set<string>();
    const controllers = this.discoveryService.getControllers();

    // Scan all controllers
    for (const wrapper of controllers) {
      this.scanController(wrapper, discoveredPermissions);
    }

    // Sync to database
    await this.syncPermissionsToDatabase(Array.from(discoveredPermissions));

    this.logger.log(`✅ Permission discovery complete. Found ${discoveredPermissions.size} unique permissions.`);
  }

  /**
   * Scan a controller for permission metadata
   */
  private scanController(wrapper: InstanceWrapper<unknown>, discoveredPermissions: Set<string>) {
    const { instance } = wrapper;
    if (!instance) return;

    const prototype = Object.getPrototypeOf(instance) as object | null;
    if (!prototype || typeof prototype !== 'object') {
      return;
    }
    const methodNames = this.metadataScanner.getAllMethodNames(prototype);
    const prototypeRecord = prototype as Record<string, unknown>;

    for (const methodName of methodNames) {
      const method = prototypeRecord[methodName];
      if (typeof method !== 'function') {
        continue;
      }

      // Get permissions from method decorator
      const permissions = this.reflector.get<RequiredPermission[]>(PERMISSIONS_KEY, method);

      if (permissions && permissions.length > 0) {
        permissions.forEach((perm) => {
          const key = `${perm.resource}:${perm.action}`;
          discoveredPermissions.add(key);
        });
      }
    }
  }

  /**
   * Sync discovered permissions to database
   */
  private async syncPermissionsToDatabase(permissions: string[]) {
    if (permissions.length === 0) {
      this.logger.warn('⚠️  No permissions found to sync');
      return;
    }

    const permissionMap = new Map<string, { resource: string; action: string }>();

    // Parse permission strings
    permissions.forEach((perm) => {
      const [resource, action] = perm.split(':');
      if (resource && action) {
        permissionMap.set(perm, { resource, action });
      }
    });

    // Get all existing permissions from database
    const existingPermissions = await this.prisma.permission.findMany({
      select: { resource: true, action: true },
    });

    const existingKeys = new Set(existingPermissions.map((p) => `${p.resource}:${p.action}`));

    // Find missing permissions
    const missingPermissions = Array.from(permissionMap.entries())
      .filter(([key]) => !existingKeys.has(key))
      .map(([, value]) => value);

    if (missingPermissions.length === 0) {
      this.logger.log('✅ All permissions already exist in database');
      return;
    }

    this.logger.log(`📝 Creating ${missingPermissions.length} new permissions...`);

    // Get or create a default "Super Admin" role
    let superAdminRole = await this.prisma.role.findFirst({
      where: { nameEn: 'Super Admin' },
    });

    if (!superAdminRole) {
      this.logger.log('🔧 Creating Super Admin role...');
      superAdminRole = await this.prisma.role.create({
        data: {
          nameEn: 'Super Admin',
          nameAr: 'مدير عام',
          isActive: true,
        },
      });
    }

    // Create missing permissions and assign to Super Admin
    for (const perm of missingPermissions) {
      await this.prisma.permission.create({
        data: {
          roleId: superAdminRole.id,
          resource: perm.resource,
          action: perm.action,
        },
      });

      this.logger.log(`  ✓ Created: ${perm.resource}.${perm.action}`);
    }

    this.logger.log('✅ Permission sync complete');
  }
}
