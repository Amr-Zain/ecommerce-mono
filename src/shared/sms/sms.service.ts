import { Injectable, Logger } from '@nestjs/common';

/**
 * SMS service
 * Handles sending SMS messages (verification, notifications)
 *
 * TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  sendVerificationSms(phone: string, code: string): Promise<void> {
    this.logger.log(`Sending verification SMS to ${phone} with code: ${code}`);
    // TODO: Implement SMS sending
    return Promise.resolve();
  }

  sendPasswordResetSms(phone: string, code: string): Promise<void> {
    this.logger.log(`Sending password reset SMS to ${phone} with code: ${code}`);
    // TODO: Implement SMS sending
    return Promise.resolve();
  }

  sendNotification(phone: string, message: string): Promise<void> {
    this.logger.log(`Sending notification SMS to ${phone}: ${message}`);
    // TODO: Implement SMS sending
    return Promise.resolve();
  }
}
