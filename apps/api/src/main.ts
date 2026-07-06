import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('479Property+ API')
    .setDescription('Enterprise property management platform API')
    .setVersion('0.1.0')
    .addServer(`/${globalPrefix}`)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
  Logger.log(`Swagger docs on http://localhost:${port}/${globalPrefix}/docs`, 'Bootstrap');
}

void bootstrap();
