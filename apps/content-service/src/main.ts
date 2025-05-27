/**
 * Content Service - BrainRush
 * Servicio para gestión de contenidos de simulacros ICFES
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { envs } from './config/envs'; // Importamos la nueva configuración
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Content-Service');
  const app = await NestFactory.create(AppModule);

  // Usamos las variables de envs en lugar de ConfigService
  const globalPrefix = 'api';
  const port = envs.PORT; // Obtenemos el puerto de envs

  // Configuración global
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de CORS (mejorada con variables de entorno)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true, // Puedes mover esto a envs si lo necesitas
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
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingrese el token JWT'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(port);

  // Log mejorado con más información
  logger.log(`=============================================`);
  logger.log(`🚀 Content Service is running on port: ${port}`);
  logger.log(`📚 API Docs: http://localhost:${port}/${globalPrefix}/docs`);
  logger.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`=============================================`);
}

bootstrap();
