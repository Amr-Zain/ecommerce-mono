import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

interface Permission {
  resource: string;
  action: string;
}

interface UserRole {
  permissions: Permission[];
}

interface AuthenticatedUser {
  userType: string;
  role?: UserRole;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.userType !== 'admin') {
      return true;
    }

    if (!user.role?.permissions) {
      throw new ForbiddenException('Access denied: No permissions');
    }

    const userPermissions = user.role.permissions;

    const hasAllPermissions = requiredPermissions.every((required) =>
      userPermissions.some(
        (permission) => permission.resource === required.resource && permission.action === required.action,
      ),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    return true;
  }
}
