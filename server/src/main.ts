import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  // Serve static product images from booklet
  const publicDir = path.resolve(__dirname, '../public');
  app.useStaticAssets(publicDir);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log('=====================================================');
  console.log(`🪔 Festive E-Commerce NestJS API running on: http://localhost:${port}`);
  console.log(`⚡ WebSocket Server listening on: ws://localhost:${port}`);
  console.log(`📦 Product Catalog loaded from Asian Plastowares 2026 Booklet`);
  console.log(`💳 Razorpay Integration active (Sandbox/Test mode ready)`);
  console.log('=====================================================');
}

bootstrap();
