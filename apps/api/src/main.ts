import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  const globalPrefix = config.get<string>('API_GLOBAL_PREFIX', 'api');
  const port = config.get<number>('API_PORT', 3000);
  const corsOrigins = config.get<string>('CORS_ORIGINS', '*');

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({ origin: corsOrigins === '*' ? true : corsOrigins.split(',') });

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
}

void bootstrap();
