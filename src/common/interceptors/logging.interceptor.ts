import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor
 * Logs all incoming requests and outgoing responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    if (Object.keys((body as Record<string, unknown>) || {}).length > 0) {
      this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`← ${method} ${url} ${responseTime}ms`);
        },
        error: (error: Error) => {
          const responseTime = Date.now() - now;
          this.logger.error(`← ${method} ${url} ${responseTime}ms - Error: ${error.message}`);
        },
      }),
    );
  }
}
