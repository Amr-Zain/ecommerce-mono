import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AuthEmailOtpRequestedPayload,
  AuthEmailVerifiedPayload,
  AuthPasswordResetRequestedPayload,
  DomainEvent,
  DOMAIN_EVENTS,
} from '@/common/events/domain-event';
import { IdempotentEventConsumer } from '@/common/events/idempotent-event-consumer.service';
import { EmailService } from './email.service';

@Injectable()
export class DomainEmailListener {
  constructor(
    private readonly email: EmailService,
    private readonly consumer: IdempotentEventConsumer,
  ) {}

  @OnEvent(DOMAIN_EVENTS.authEmailOtpRequested, { async: true, suppressErrors: false })
  sendEmailOtp(event: DomainEvent<AuthEmailOtpRequestedPayload>) {
    return this.email.sendTemplate({
      to: event.payload.recipient,
      locale: this.locale(event.payload.locale),
      template: 'emailOtp',
      variables: { code: event.payload.code, expiresMinutes: this.expiresMinutes(event.payload.expiresAt) },
    });
  }

  @OnEvent(DOMAIN_EVENTS.authPasswordResetRequested, { async: true, suppressErrors: false })
  sendPasswordResetOtp(event: DomainEvent<AuthPasswordResetRequestedPayload>) {
    return this.email.sendTemplate({
      to: event.payload.recipient,
      locale: this.locale(event.payload.locale),
      template: 'passwordResetOtp',
      variables: { code: event.payload.code, expiresMinutes: this.expiresMinutes(event.payload.expiresAt) },
    });
  }

  @OnEvent(DOMAIN_EVENTS.authEmailVerified, { async: true, suppressErrors: false })
  sendWelcome(event: DomainEvent<AuthEmailVerifiedPayload>) {
    return this.consumer.run(event, 'DomainEmail.welcome', () =>
      this.email.sendTemplate({
        to: event.payload.recipient,
        locale: this.locale(event.payload.locale),
        template: 'welcome',
        variables: { name: event.payload.name },
      }),
    );
  }

  private locale(locale: string) {
    return locale === 'ar' ? 'ar' : 'en';
  }

  private expiresMinutes(expiresAt: string) {
    return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60_000));
  }
}
