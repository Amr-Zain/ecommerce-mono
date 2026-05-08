import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Check if endpoint is explicitly marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Get the request path
        const request = context.switchToHttp().getRequest();
        const path = request.route?.path || request.url;

        // Admin and client routes ALWAYS require authentication
        if (path.startsWith('/admin') || path.startsWith('/client')) {
            // First authenticate the user
            const result = super.canActivate(context);

            // If authentication is a promise, handle it
            if (result instanceof Promise) {
                return result.then((authenticated) => {
                    if (authenticated) {
                        return this.validateUserType(request, path);
                    }
                    return false;
                });
            }

            // If authentication succeeded synchronously, validate user type
            if (result) {
                return this.validateUserType(request, path);
            }

            return false;
        }

        // For other routes, require authentication by default
        return super.canActivate(context);
    }

    /**
     * Validate user type based on path
     */
    private validateUserType(request: any, path: string): boolean {
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        // Admin routes - require admin user type
        if (path.startsWith('/admin')) {
            if (user.userType !== 'admin') {
                throw new ForbiddenException('Admin access only');
            }
        }

        // Client routes - require client user type
        if (path.startsWith('/client')) {
            if (user.userType !== 'client') {
                throw new ForbiddenException('Client access only');
            }
        }

        return true;
    }
}
