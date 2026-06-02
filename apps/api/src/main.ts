import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Prisma } from '@prisma/client';

import { SnakeToCamelPipe } from './common/pipes/snake-to-camel.pipe';
import cookieParser from 'cookie-parser';

(Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (this: Prisma.Decimal) {
  return Number(this.toString());
};
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (this: bigint) {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Accept-Language, Authorization, X-Requested-With, X-Platform',
  });

  app.use(cookieParser());

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new SnakeToCamelPipe(), new I18nValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
});
