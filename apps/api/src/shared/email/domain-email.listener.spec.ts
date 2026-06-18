import { createDomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
import { DomainEmailListener } from './domain-email.listener';

describe('DomainEmailListener', () => {
  const email = { sendTemplate: jest.fn().mockResolvedValue(undefined) };
  const consumer = { run: jest.fn((_event, _name, handler) => handler()) };
  const listener = new DomainEmailListener(email as never, consumer as never);

  beforeEach(() => jest.clearAllMocks());

  it('sends secret OTP events directly without the durable consumer', async () => {
    await listener.sendEmailOtp(
      createDomainEvent({
        eventName: DOMAIN_EVENTS.authEmailOtpRequested,
        aggregateType: 'email_otp_challenge',
        aggregateId: 'challenge-1',
        payload: {
          recipient: 'user@example.com',
          locale: 'en',
          code: '1234',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          purpose: 'login',
        },
      }),
    );
    expect(email.sendTemplate).toHaveBeenCalledWith(expect.objectContaining({ template: 'emailOtp' }));
    expect(consumer.run).not.toHaveBeenCalled();
  });

  it('uses the idempotent consumer for durable verified events', async () => {
    const event = createDomainEvent({
      eventName: DOMAIN_EVENTS.authEmailVerified,
      aggregateType: 'user',
      aggregateId: '1',
      payload: { userId: '1', recipient: 'user@example.com', locale: 'ar' },
    });
    await listener.sendWelcome(event);
    expect(consumer.run).toHaveBeenCalledWith(event, 'DomainEmail.welcome', expect.any(Function));
    expect(email.sendTemplate).toHaveBeenCalledWith(expect.objectContaining({ template: 'welcome', locale: 'ar' }));
  });
});
