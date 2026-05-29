import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: string;
  action: 'list' | 'create' | 'read' | 'update' | 'delete';
}

export const RequirePermissions = (...permissions: RequiredPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
