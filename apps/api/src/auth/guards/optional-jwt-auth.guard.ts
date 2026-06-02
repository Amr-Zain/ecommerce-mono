import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

type RequestWithUser = Request & { user?: unknown };

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser | false | null): TUser | null {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
