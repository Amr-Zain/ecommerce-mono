import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { AdminModule } from '@/admin/admin.module';
import { ClientModule } from '@/client/client.module';
import { AuthModule } from '@/auth/auth.module';

function basicAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const username = process.env.SWAGGER_USERNAME;
  const password = process.env.SWAGGER_PASSWORD;

  if (!username || !password) {
    return next();
  }

  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Swagger UI"');
    res.status(401).send('Authentication required');
    return;
  }

  const base64Credentials = authHeader.slice('Basic '.length);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [providedUsername, providedPassword] = credentials.split(':');

  if (providedUsername !== username || providedPassword !== password) {
    res.set('WWW-Authenticate', 'Basic realm="Swagger UI"');
    res.status(401).send('Invalid credentials');
    return;
  }

  next();
}

function buildSwaggerDocument(app: INestApplication, title: string, modules?: any[]) {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription('API documentation for Ecommerce')
    .setVersion('1.0')
    .addServer('/api/v1')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  return SwaggerModule.createDocument(app, config, {
    ...(modules ? { include: modules } : {}),
    deepScanRoutes: true,
  });
}

export function setupSwagger(app: INestApplication) {
  const fullDocument = buildSwaggerDocument(app, 'Ecommerce API');
  const adminDocument = buildSwaggerDocument(app, 'Ecommerce Admin API', [AdminModule, AuthModule]);
  const clientDocument = buildSwaggerDocument(app, 'Ecommerce Client API', [ClientModule, AuthModule]);
  const publicDocument = buildSwaggerDocument(app, 'Ecommerce Public API', [AuthModule]);

  const commonOptions = {
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
    customSiteTitle: 'Ecommerce API Docs',
  };

  app.use('/api/v1/docs', basicAuthMiddleware);
  app.use('/api/v1/docs/admin', basicAuthMiddleware);
  app.use('/api/v1/docs/client', basicAuthMiddleware);
  app.use('/api/v1/docs/public', basicAuthMiddleware);

  SwaggerModule.setup('api/v1/docs', app, fullDocument, commonOptions);
  SwaggerModule.setup('api/v1/docs/admin', app, adminDocument, commonOptions);
  SwaggerModule.setup('api/v1/docs/client', app, clientDocument, commonOptions);
  SwaggerModule.setup('api/v1/docs/public', app, publicDocument, commonOptions);
}
