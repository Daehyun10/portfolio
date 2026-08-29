import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Express } from 'express';
import { AppModule } from '../src/app.module';
import { parseOrigins } from '../src/common/cors';

let cached: Express | null = null;

/// Vercel 서버리스 핸들러. 콜드스타트 비용을 줄이려고 Nest 인스턴스를 모듈 스코프에 캐시한다.
async function getApp(): Promise<Express> {
  if (cached) return cached;

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: parseOrigins(process.env.CORS_ORIGIN ?? '*'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  await app.init();

  cached = app.getHttpAdapter().getInstance() as Express;
  return cached;
}

export default async function handler(req: unknown, res: unknown) {
  const server = await getApp();
  return (server as unknown as (a: unknown, b: unknown) => void)(req, res);
}
