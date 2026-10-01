import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { ThrottleGuard } from './throttle.guard';

@Controller('auth')
class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login() {
    return {};
  }
  @Post('forgot-password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  forgotPassword() {
    return {};
  }
}
@Controller('media')
class MediaController {
  @Post('upload')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  uploadSingle() {
    return {};
  }
  @Post('upload-many')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  uploadMany() {
    return {};
  }
}
@Controller('general')
class GeneralController {
  @Get('one') one() {
    return {};
  }
  @Get('two') two() {
    return {};
  }
}

describe('Global rate limits', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
      controllers: [AuthController, MediaController, GeneralController],
      providers: [{ provide: APP_GUARD, useClass: ThrottleGuard }],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => app.close());

  it('shares the 120-request general budget across routes and ignores forged forwarded IPs', async () => {
    for (let i = 0; i < 120; i++) {
      await request(app.getHttpServer())
        .get(`/general/${i % 2 ? 'one' : 'two'}`)
        .set('X-Forwarded-For', `192.0.2.${i}`)
        .expect(200);
    }
    const response = await request(app.getHttpServer()).get('/general/two').expect(429);
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('shares the ten-request auth budget while allowing general routes', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer()).post('/auth/login').expect(201);
    }
    await request(app.getHttpServer()).post('/auth/forgot-password').expect(429);
    await request(app.getHttpServer()).get('/general/one').expect(200);
  });

  it('shares the twenty-request upload budget', async () => {
    for (let i = 0; i < 20; i++) await request(app.getHttpServer()).post('/media/upload').expect(201);
    await request(app.getHttpServer()).post('/media/upload-many').expect(429);
  });
});
