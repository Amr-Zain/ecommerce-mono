import { createCipheriv, createHash, randomBytes } from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';

type GatewaySeed = {
  identifier: string;
  provider: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  environment: string;
  priority: number;
  enabledMethods: string[];
  supportedCountries: string[];
  supportedCurrencies: string[];
  publicSettings: Record<string, unknown>;
  secrets: Record<string, string | undefined>;
};

const secretKeys = {
  cod: [],
  bank_transfer: [],
  stripe: ['secret_key', 'webhook_secret'],
  tap: ['secret_key', 'webhook_secret', 'hash_secret'],
  moyasar: ['secret_key', 'webhook_secret'],
  tabby: ['secret_key', 'webhook_secret'],
} as const;
const dummyPaymentSecrets = {
  stripeSecretKey: 'sk_test_dummy_dashboard_stripe_secret',
  stripeWebhookSecret: 'whsec_dummy_dashboard_stripe_webhook',
  tapSecretKey: 'sk_test_dummy_dashboard_tap_secret',
  tapWebhookSecret: 'tap_whsec_dummy_dashboard_webhook',
  tapHashSecret: 'tap_hash_dummy_dashboard_secret',
  moyasarSecretKey: 'sk_test_dummy_dashboard_moyasar_secret',
  moyasarWebhookSecret: 'moyasar_whsec_dummy_dashboard_webhook',
  tabbySecretKey: 'sk_test_dummy_dashboard_tabby_secret',
  tabbyWebhookSecret: 'tabby_whsec_dummy_dashboard_webhook',
} as const;

export async function seedPaymentGateways(prisma: PrismaClient) {
  const gateways = defaultGateways();

  for (const gateway of gateways) {
    const encryptedSecrets = encryptSecrets(gateway.provider, gateway.secrets);
    await prisma.paymentGateway.upsert({
      where: { identifier: gateway.identifier },
      update: {
        provider: gateway.provider,
        name: gateway.name,
        description: gateway.description,
        image: gateway.image,
        icon: gateway.icon,
        environment: gateway.environment,
        priority: gateway.priority,
        publicSettings: toJson(gateway.publicSettings),
        enabledMethods: gateway.enabledMethods,
        supportedCountries: gateway.supportedCountries,
        supportedCurrencies: gateway.supportedCurrencies,
        ...(Object.keys(encryptedSecrets).length ? { secretSettings: toJson(encryptedSecrets) } : {}),
      },
      create: {
        identifier: gateway.identifier,
        provider: gateway.provider,
        name: gateway.name,
        description: gateway.description,
        image: gateway.image,
        icon: gateway.icon,
        environment: gateway.environment,
        priority: gateway.priority,
        publicSettings: toJson(gateway.publicSettings),
        secretSettings: toJson(encryptedSecrets),
        enabledMethods: gateway.enabledMethods,
        supportedCountries: gateway.supportedCountries,
        supportedCurrencies: gateway.supportedCurrencies,
        isActive: true,
      },
    });
  }

  console.log('Payment gateways seeded');
}

function defaultGateways(): GatewaySeed[] {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return [
    {
      identifier: 'bank_transfer',
      provider: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Manual bank transfer payment method.',
      image: process.env.BANK_TRANSFER_LOGO_URL || providerLogo('bank_transfer'),
      icon: process.env.BANK_TRANSFER_ICON_URL || providerLogo('bank_transfer'),
      environment: process.env.BANK_TRANSFER_ENVIRONMENT || 'manual',
      priority: 900,
      enabledMethods: envList('BANK_TRANSFER_ENABLED_METHODS', ['bank_transfer']),
      supportedCountries: envList('BANK_TRANSFER_SUPPORTED_COUNTRIES', ['SA', 'EG']),
      supportedCurrencies: envList('BANK_TRANSFER_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
      publicSettings: {
        instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || '',
      },
      secrets: {},
    },
    {
      identifier: 'cod',
      provider: 'cod',
      name: 'Cash on Delivery',
      description: 'Manual cash on delivery payment method.',
      image: process.env.COD_LOGO_URL || providerLogo('cod'),
      icon: process.env.COD_ICON_URL || providerLogo('cod'),
      environment: process.env.COD_ENVIRONMENT || 'manual',
      priority: 910,
      enabledMethods: envList('COD_ENABLED_METHODS', ['cod']),
      supportedCountries: envList('COD_SUPPORTED_COUNTRIES', ['SA', 'EG']),
      supportedCurrencies: envList('COD_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
      publicSettings: {
        instructions: process.env.COD_INSTRUCTIONS || '',
      },
      secrets: {},
    },
    {
      identifier: 'stripe',
      provider: 'stripe',
      name: 'Stripe',
      description: 'Stripe Checkout and PaymentIntent provider.',
      image: process.env.STRIPE_LOGO_URL || providerLogo('stripe'),
      icon: process.env.STRIPE_ICON_URL || providerLogo('stripe'),
      environment: process.env.STRIPE_ENVIRONMENT || 'test',
      priority: 100,
      enabledMethods: envList('STRIPE_ENABLED_METHODS', ['card', 'stripe_checkout', 'stripe_intent']),
      supportedCountries: envList('STRIPE_SUPPORTED_COUNTRIES', ['SA', 'EG']),
      supportedCurrencies: envList('STRIPE_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
      publicSettings: {
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_me',
        api_version: process.env.STRIPE_API_VERSION || '2025-02-24.acacia',
        checkout_expiry_minutes: Number(process.env.STRIPE_CHECKOUT_EXPIRY_MINUTES || 31),
        success_path: process.env.STRIPE_SUCCESS_PATH || '/checkout/success',
        cancel_path: process.env.STRIPE_CANCEL_PATH || '/checkout/cancel',
        frontend_url: frontendUrl,
      },
      secrets: {
        secret_key: process.env.STRIPE_SECRET_KEY || dummyPaymentSecrets.stripeSecretKey,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || dummyPaymentSecrets.stripeWebhookSecret,
      },
    },
    {
      identifier: 'tap',
      provider: 'tap',
      name: 'Tap Payments',
      description: 'Tap regional gateway for card, mada, STC Pay, and Apple Pay.',
      image: process.env.TAP_LOGO_URL || providerLogo('tap'),
      icon: process.env.TAP_ICON_URL || providerLogo('tap'),
      environment: process.env.TAP_ENVIRONMENT || 'test',
      priority: 20,
      enabledMethods: envList('TAP_ENABLED_METHODS', ['card', 'apple_pay', 'tap_checkout']),
      supportedCountries: envList('TAP_SUPPORTED_COUNTRIES', ['SA', 'EG', 'AE', 'KW', 'BH', 'OM', 'QA']),
      supportedCurrencies: envList('TAP_SUPPORTED_CURRENCIES', ['SAR', 'EGP', 'AED', 'KWD', 'BHD', 'OMR', 'QAR']),
      publicSettings: {
        public_key: process.env.TAP_PUBLIC_KEY || 'pk_test_replace_me',
        merchant_id: process.env.TAP_MERCHANT_ID || '',
        supported_methods: process.env.TAP_SUPPORTED_METHODS || 'card,apple_pay,mada,stc_pay',
        installment_plans: process.env.TAP_INSTALLMENT_PLANS || '',
      },
      secrets: {
        secret_key: process.env.TAP_SECRET_KEY || dummyPaymentSecrets.tapSecretKey,
        webhook_secret: process.env.TAP_WEBHOOK_SECRET || dummyPaymentSecrets.tapWebhookSecret,
        hash_secret: process.env.TAP_HASH_SECRET || dummyPaymentSecrets.tapHashSecret,
      },
    },
    {
      identifier: 'moyasar',
      provider: 'moyasar',
      name: 'Moyasar',
      description: 'Moyasar card and Apple Pay processing.',
      image: process.env.MOYASAR_LOGO_URL || providerLogo('moyasar'),
      icon: process.env.MOYASAR_ICON_URL || providerLogo('moyasar'),
      environment: process.env.MOYASAR_ENVIRONMENT || 'test',
      priority: 30,
      enabledMethods: envList('MOYASAR_ENABLED_METHODS', ['card', 'apple_pay', 'moyasar']),
      supportedCountries: envList('MOYASAR_SUPPORTED_COUNTRIES', ['SA']),
      supportedCurrencies: envList('MOYASAR_SUPPORTED_CURRENCIES', ['SAR']),
      publicSettings: {
        publishable_key: process.env.MOYASAR_PUBLISHABLE_KEY || 'pk_test_replace_me',
        supported_methods: process.env.MOYASAR_SUPPORTED_METHODS || 'card,apple_pay,mada',
      },
      secrets: {
        secret_key: process.env.MOYASAR_SECRET_KEY || dummyPaymentSecrets.moyasarSecretKey,
        webhook_secret: process.env.MOYASAR_WEBHOOK_SECRET || dummyPaymentSecrets.moyasarWebhookSecret,
      },
    },
    {
      identifier: 'tabby',
      provider: 'tabby',
      name: 'Tabby',
      description: 'Direct Tabby BNPL checkout provider.',
      image: process.env.TABBY_LOGO_URL || providerLogo('tabby'),
      icon: process.env.TABBY_ICON_URL || providerLogo('tabby'),
      environment: process.env.TABBY_ENVIRONMENT || 'test',
      priority: 40,
      enabledMethods: envList('TABBY_ENABLED_METHODS', ['tabby']),
      supportedCountries: envList('TABBY_SUPPORTED_COUNTRIES', ['SA', 'AE', 'KW', 'BH']),
      supportedCurrencies: envList('TABBY_SUPPORTED_CURRENCIES', ['SAR', 'AED', 'KWD', 'BHD']),
      publicSettings: {
        public_key: process.env.TABBY_PUBLIC_KEY || 'pk_test_replace_me',
        merchant_code: process.env.TABBY_MERCHANT_CODE || '',
        installment_plans: process.env.TABBY_INSTALLMENT_PLANS || '2,3,6',
      },
      secrets: {
        secret_key: process.env.TABBY_SECRET_KEY || dummyPaymentSecrets.tabbySecretKey,
        webhook_secret: process.env.TABBY_WEBHOOK_SECRET || dummyPaymentSecrets.tabbyWebhookSecret,
      },
    },
  ];
}

function envList(key: string, fallback: string[]) {
  const raw = process.env[key];
  if (!raw) return fallback;
  const values = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length ? values : fallback;
}

function providerLogo(provider: string) {
  if (provider === 'cod') return '/payment-providers/cash.svg';
  return `/payment-providers/${provider}.svg`;
}

function encryptSecrets(provider: string, values: Record<string, string | undefined>) {
  const keys = secretKeys[provider as keyof typeof secretKeys] || [];
  const encryptedSecrets: Record<string, unknown> = {};
  for (const key of keys) {
    const value = values[key];
    if (value) encryptedSecrets[key] = encrypt(value);
  }
  return encryptedSecrets;
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: true,
    value: Buffer.concat([iv, tag, encrypted]).toString('base64'),
  };
}

function encryptionKey() {
  const secret = process.env.PAYMENT_SECRETS_KEY || process.env.JWT_SECRET || 'development-payment-secret-key';
  return createHash('sha256').update(secret).digest();
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
