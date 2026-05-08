import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Only enforce permissions for admin users
        if (!user || user.userType !== 'admin') {
            return true;
        }

        if (!user.role || !user.role.permissions) {
            throw new ForbiddenException('Access denied: No permissions');
        }

        const userPermissions = user.role.permissions;

        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every((required) =>
            userPermissions.some(
                (permission: any) =>
                    permission.resource === required.resource &&
                    permission.action === required.action,
            ),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('Access denied: Insufficient permissions');
        }

        return true;
    }
}
