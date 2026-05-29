# Shared Module

Domain-specific services that are reused across multiple feature modules.

## Structure

```
shared/
├── cache/               ← Caching service (Redis/in-memory)
│   ├── cache.service.ts
│   └── cache.module.ts
│
├── email/               ← Email sending service
│   ├── email.service.ts
│   └── email.module.ts
│
├── notifications/       ← Push notifications
│   ├── notification.service.ts
│   └── notification.module.ts
│
├── sms/                 ← SMS sending service
│   ├── sms.service.ts
│   └── sms.module.ts
│
└── storage/             ← File storage service
    ├── storage.service.ts
    └── storage.module.ts
```

## Guidelines

### When to Add a Shared Service

Add a service to `shared/` when:

- ✅ It's used by multiple feature modules
- ✅ It has domain-specific logic
- ✅ It integrates with external services
- ✅ It's not generic enough for `common/`

### Module Organization

Each shared service should:

1. Have its own module
2. Export the service
3. Be imported by feature modules that need it

Example:

```typescript
// shared/email/email.module.ts
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

// users/users.module.ts
@Module({
  imports: [EmailModule], // ← Import shared module
  providers: [UsersService],
})
export class UsersModule {}
```

### Avoid Circular Dependencies

Shared services should NOT depend on feature modules:

```
❌ BAD:
UsersService → EmailService → UsersService (circular!)

✅ GOOD:
UsersService → EmailService (one direction)
OrdersService → EmailService (one direction)
```

## Integration TODOs

### Email Service

- [ ] Choose provider (SendGrid, AWS SES, Mailgun)
- [ ] Add API keys to `.env`
- [ ] Create email templates
- [ ] Implement HTML email rendering

### SMS Service

- [ ] Choose provider (Twilio, AWS SNS)
- [ ] Add API keys to `.env`
- [ ] Implement phone number validation
- [ ] Add rate limiting

### Storage Service

- [ ] Choose provider (AWS S3, Azure Blob, Google Cloud)
- [ ] Add credentials to `.env`
- [ ] Implement file validation (size, type)
- [ ] Add image optimization

### Cache Service

- [ ] Install Redis or use in-memory cache
- [ ] Add Redis connection to `.env`
- [ ] Implement cache invalidation strategy
- [ ] Add cache warming

### Notification Service

- [ ] Choose provider (Firebase, OneSignal)
- [ ] Add API keys to `.env`
- [ ] Implement device token management
- [ ] Add notification templates
