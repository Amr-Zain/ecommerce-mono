import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const httpAdapterHost = app.get(HttpAdapterHost);

  // App exception filters & pipes setup
  app.useGlobalPipes(new I18nValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new I18nValidationExceptionFilter({ detailedErrors: false })
  );

  // Implements NestJS graceful shut down hooks (recommended for Prisma)
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
});
