import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';

/** Share budgets across related endpoints so switching routes cannot bypass limits. */
@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  protected generateKey(context: ExecutionContext, tracker: string, throttlerName: string): string {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    let group = 'api';
    if (
      controller === 'AuthController' &&
      ['register', 'sendOtp', 'loginOtp', 'login', 'forgotPassword', 'resetPassword'].includes(handler)
    ) {
      group = 'auth';
    } else if (controller === 'MediaController' && ['uploadSingle', 'uploadMany'].includes(handler)) {
      group = 'upload';
    }
    return createHash('sha256').update(`${throttlerName}:${group}:${tracker}`).digest('hex');
  }
}
