import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Render, Railway and similar hosts sit behind a proxy.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // QR images are loaded by the web app
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS: comma-separated CORS_ORIGINS / FRONTEND_URL in production, open in development.
  const origins = [process.env.CORS_ORIGINS, process.env.FRONTEND_URL]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: origins.length && process.env.NODE_ENV === 'production' ? origins : true,
    credentials: true,
  });

  // Uploaded registration documents and QR codes
  const uploadPath = join(process.cwd(), 'uploads', 'registrations');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Swagger API docs at /api/docs
  const config = new DocumentBuilder()
    .setTitle('PharmaGuard AI API')
    .setDescription(
      'Pharmaceutical supply-chain safety platform: blockchain batch traceability, ' +
        'agentic AI recall management, smart-contract sale blocking and compliance reporting.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`PharmaGuard AI API running on port ${port} (docs: /api/docs)`);
}

bootstrap();
