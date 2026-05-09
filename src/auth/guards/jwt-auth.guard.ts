import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthenticatedUser {
  userType: string;
  [key: string]: unknown;
}

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const path = this.resolveRoutePath(request);

    if (path.startsWith('/admin') || path.startsWith('/client')) {
      const result = super.canActivate(context);

      if (result instanceof Promise) {
        return result.then((authenticated) => {
          if (authenticated) {
            return this.validateUserType(request, path);
          }
          return false;
        });
      }

      if (result) {
        return this.validateUserType(request, path);
      }

      return false;
    }

    return super.canActivate(context);
  }

  /** Express `route` is often typed as `any`; never read `.route` directly — use keyed access as `unknown`. */
  private resolveRoutePath(request: AuthenticatedRequest): string {
    const url = typeof request.url === 'string' ? request.url : '';
    if (typeof request !== 'object' || request === null) {
      return url;
    }

    const routeUnknown: unknown = (request as unknown as Record<PropertyKey, unknown>)['route'];
    if (routeUnknown && typeof routeUnknown === 'object') {
      const routeObj = routeUnknown as Record<PropertyKey, unknown>;
      const routePathUnknown = routeObj['path'];
      if (typeof routePathUnknown === 'string') {
        return routePathUnknown;
      }
    }
    return url;
  }

  private validateUserType(request: AuthenticatedRequest, path: string): boolean {
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (path.startsWith('/admin')) {
      if (user.userType !== 'admin') {
        throw new ForbiddenException('Admin access only');
      }
    }

    if (path.startsWith('/client')) {
      if (user.userType !== 'client') {
        throw new ForbiddenException('Client access only');
      }
    }

    return true;
  }
}
