import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, from, lastValueFrom } from 'rxjs';
import { CacheService } from './cache.service';
import { findPublicCachePolicy } from './public-cache-policies';

@Injectable()
export class PublicCacheInterceptor implements NestInterceptor {
  constructor(private readonly cache: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const entry = findPublicCachePolicy(request);
    if (!entry) {
      return next.handle();
    }

    return from(this.resolve(entry, next));
  }

  private async resolve(entry: NonNullable<ReturnType<typeof findPublicCachePolicy>>, next: CallHandler) {
    const { policy, match } = entry;
    const key = policy.key(match);
    const cached = await this.cache.get<unknown>(key);
    if (cached !== null) {
      return cached;
    }

    const response = await lastValueFrom(next.handle());
    await this.cache.set(key, response, policy.ttl, policy.tags(match));
    return response;
  }
}
