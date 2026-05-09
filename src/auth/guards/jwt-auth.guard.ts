import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthenticatedUser {
  userType: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  route?: { path: string };
}

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
    const path = request.route?.path ?? request.url;

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
