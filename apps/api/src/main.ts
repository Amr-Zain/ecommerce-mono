import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { VersioningType, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Prisma } from '@prisma/client';
import { setupSwagger } from './common/swagger/swagger.setup';

import { SnakeToCamelPipe } from './common/pipes/snake-to-camel.pipe';
import cookieParser from 'cookie-parser';

(Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (this: Prisma.Decimal) {
  return Number(this.toString());
};
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (this: bigint) {
  return this.toString();
};

const API_VERSION = process.env.API_VERSION ?? '1';

const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedCorsOrigin(origin?: string) {
  if (!origin) {
    return true;
  }

  if (configuredCorsOrigins.includes(origin)) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    exposedHeaders: ['Content-Disposition'],
    allowedHeaders:
      'Content-Type, Accept, Accept-Language, Authorization, X-Requested-With, X-Platform, x-user-type, Cache-Control, Last-Event-ID, X-Anonymous-Session-Token',
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api', {
    exclude: [
      { path: `api/v${API_VERSION}/docs`, method: RequestMethod.ALL },
      { path: `api/v${API_VERSION}/docs/(.*)`, method: RequestMethod.ALL },
      { path: `api/v${API_VERSION}/docs-json`, method: RequestMethod.ALL },
      { path: 'uploads', method: RequestMethod.ALL },
      { path: 'uploads/(.*)', method: RequestMethod.ALL },
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new SnakeToCamelPipe(), new I18nValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  setupSwagger(app);

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
});
