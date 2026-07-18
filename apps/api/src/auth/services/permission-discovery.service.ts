import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { IRolesRepository, ROLES_REPOSITORY } from '@/common/interfaces';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(PermissionDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @Inject(ROLES_REPOSITORY) private readonly rolesRepository: IRolesRepository,
  ) {}

  async onModuleInit() {
    try {
      await this.discoverAndSyncPermissions();
    } catch (error) {
      this.logger.error('Failed to discover and sync permissions:', error);
    }
  }

  private async discoverAndSyncPermissions() {
    const discoveredPermissions = new Set<string>();
    for (const wrapper of this.discoveryService.getControllers()) {
      this.scanController(wrapper, discoveredPermissions);
    }

    const permissions = [...discoveredPermissions].flatMap((permission) => {
      const [resource, action] = permission.split(':');
      return resource && action ? [{ resource, action }] : [];
    });
    if (!permissions.length) {
      this.logger.warn('No permissions found to sync');
      return;
    }

    const created = await this.rolesRepository.syncDiscoveredPermissions(permissions);
    this.logger.log(`Permission discovery complete. Found ${permissions.length}; created ${created}.`);
  }

  private scanController(wrapper: InstanceWrapper<unknown>, discoveredPermissions: Set<string>) {
    const instance = wrapper.instance;
    if (!instance) return;
    const prototype = Object.getPrototypeOf(instance) as object | null;
    if (!prototype || typeof prototype !== 'object') return;
    const prototypeRecord = prototype as Record<string, unknown>;

    for (const methodName of this.metadataScanner.getAllMethodNames(prototype)) {
      const method = prototypeRecord[methodName];
      if (typeof method !== 'function') continue;
      for (const permission of this.reflector.get<RequiredPermission[]>(PERMISSIONS_KEY, method) ?? []) {
        discoveredPermissions.add(`${permission.resource}:${permission.action}`);
      }
    }
  }
}
