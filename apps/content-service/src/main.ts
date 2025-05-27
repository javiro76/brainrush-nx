/**
 * Content Service - BrainRush
 * Servicio para gestión de contenidos de simulacros ICFES
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@brainrush-nx/shared';
import { AppModule } from './app/app.module';
import { envs } from './config/envs'; // Importamos la nueva configuración
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  // Configuración de seguridad con Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Usamos las variables de envs en lugar de ConfigService
  const port = envs.PORT; // Obtenemos el puerto de envs

  // Configuración global (sin prefijo global - se maneja desde API Gateway)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Configuración de CORS restrictiva (solo desde API Gateway)
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction
      ? [process.env.API_GATEWAY_URL || 'http://localhost:3335']
      : ['http://localhost:3335', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
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
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(port);

  // Log mejorado con más información
  logger.log('Content-Service', `=============================================`);
  logger.log('Content-Service', `🚀 Content Service is running on port: ${port}`);
  logger.log('Content-Service', `📚 API Docs: http://localhost:${port}/docs`);
  logger.log('Content-Service', `🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log('Content-Service', `=============================================`);
}

bootstrap();
