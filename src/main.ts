import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { AppExceptionFilter } from './common/filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // App exception filters & pipes setup
  app.useGlobalPipes(new I18nValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
    new AppExceptionFilter()
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
