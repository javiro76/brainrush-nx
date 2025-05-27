/**
 * Content Service - BrainRush
 * Servicio para gestión de contenidos de simulacros ICFES
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Content-Service');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const globalPrefix = 'api';
  const port = configService.get<number>('PORT', 3335);

  // Configuración global
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Content Service API')
    .setDescription('API para gestión de contenido de simulacros ICFES en BrainRush')
    .setVersion('1.0')
    .addTag('areas', 'Endpoints para gestionar áreas')
    .addTag('textos', 'Endpoints para gestionar textos')
    .addTag('preguntas', 'Endpoints para gestionar preguntas')
    .addTag('opciones', 'Endpoints para gestionar opciones')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  await app.listen(port);
  logger.log(
    `🚀 Content Service is running on: http://localhost:${port}/${globalPrefix}`
  );
  logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();
