/**
 * Exams Service - BrainRush
 * Servicio para gestión de exámenes de simulacros ICFES
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, LoggerService, securityConfig } from '@brainrush-nx/shared';
import { envs } from './config/envs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as compression from 'compression';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
  // 1. Obtener la instancia
  const logger = app.get(LoggerService);
  // 2. Establecer como logger global (IMPORTANTE)
  app.useLogger(logger);

     // Determinar el entorno de ejecución
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log('Exams-Service', `🚀 Exams-Service iniciando en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);


    // Configuración de seguridad para servicio interno
  app.use(securityConfig({
    isPublic: false,
    hasFrontend: false,
     allowSwagger: process.env.ENABLE_SWAGGER === 'true',
  }));


    // Compresión GZIP
    app.use(compression());    // CORS configurado
    app.enableCors({
      origin: envs.CORS_ORIGINS.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });

    // ====================================
    // CONFIGURACIÓN DE VALIDACIÓN
    // ====================================

    // Pipes de validación globales
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remover propiedades no definidas en DTOs        forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
        transform: true, // Transformar automáticamente tipos
        disableErrorMessages: envs.NODE_ENV === 'production', // Ocultar detalles en prod
        validateCustomDecorators: true,
      })
    );

    // ====================================
    // CONFIGURACIÓN DE API
    // ====================================

    // Prefijo global
    app.setGlobalPrefix('api/v1');

    // Versionado de API
    // app.enableVersioning({
    //   type: VersioningType.URI,
    //   defaultVersion: '1',
    // });

    // ====================================
    // DOCUMENTACIÓN SWAGGER
    // ====================================

    if (envs.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('BrainRush Exams Service API')
        .setDescription(`
          🎯 **Servicio de Exámenes** del ecosistema BrainRush

          ## Características principales:
          - 📝 Gestión completa de exámenes (CRUD)
          - ⏱️ Control de tiempo y intentos
          - 📊 Estadísticas detalladas y analytics
          - 🔒 Seguridad integrada con auth-service
          - 🔄 Comunicación NATS para consistencia
          - 📱 Compatible con dashboard responsive

          ## Tipos de exámenes soportados:
          - **SIMULACRO**: Exámenes ICFES completos
          - **PRACTICA**: Exámenes por área específica
          - **QUIZ**: Cuestionarios cortos
          - **DIAGNOSTICO**: Evaluaciones iniciales
          - **SEGUIMIENTO**: Monitoreo de progreso
          - **PERSONALIZADO**: Creados por profesores

          ## Roles de usuario:
          - **ADMIN**: Acceso completo al sistema
          - **TEACHER**: Crear y gestionar exámenes
          - **STUDENT**: Realizar exámenes y ver resultados
        `)
        .setVersion('1.0.0')
        .setContact(
          'BrainRush Team',
          'https://brainrush.edu.co',
          'support@brainrush.edu.co'
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'JWT token obtenido del auth-service',
            in: 'header',
          },
          'JWT-auth'
        )
        .addTag('Health', 'Endpoints de salud del servicio')
        .addTag('Exams', 'Gestión de exámenes')
        .addTag('Attempts', 'Intentos de exámenes')
        .addTag('Statistics', 'Estadísticas y analytics')
        .addServer('http://localhost:3337', 'Desarrollo Local')
        .addServer('https://api-dev.brainrush.edu.co', 'Desarrollo')
        .addServer('https://api.brainrush.edu.co', 'Producción')
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          `${controllerKey.replace('Controller', '')}_${methodKey}`,
      });

      SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'BrainRush Exams API',
        customfavIcon: '/favicon.ico',
        customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { color: #1976d2; }
        `,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
        },
      });

      logger.log(`📚 Swagger documentation available at: http://localhost:${envs.PORT}/api/docs`);
    }

    // ====================================
    // MICROSERVICIO NATS
    // ====================================

    // Configurar como microservicio NATS
    const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {        transport: Transport.NATS,
        options: {
          servers: [envs.NATS_SERVERS],
          queue: 'exams-service',
        },
      }
    );    await natsApp.listen();
    logger.log(`🔌 NATS Microservice listening on: ${envs.NATS_SERVERS}`);

    // ====================================
    // INICIO DEL SERVIDOR HTTP
    // ====================================

    await app.listen(envs.PORT, '0.0.0.0');    logger.log(`
    🚀 ===================================
       BRAINRUSH EXAMS SERVICE STARTED
    ===================================
    🌐 HTTP Server: http://localhost:${envs.PORT}/api/v1
    📚 API Docs: http://localhost:${envs.PORT}/api/docs
    🔌 NATS: ${envs.NATS_SERVERS}
    🗃️  Database: ${envs.DATABASE_URL.includes('localhost') ? 'Local' : 'Remote'}
    🎯 Environment: ${envs.NODE_ENV}
    📊 Health Check: http://localhost:${envs.PORT}/api/v1/health
    ===================================
    `);

  // } catch (error) {
  //   logger.error('❌ Failed to start Exams Service:', error);
  //   process.exit(1);
  // }
}

// Manejo de señales para cierre graceful
// process.on('SIGTERM', () => {
//   Logger.log('🛑 SIGTERM received, shutting down gracefully...');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   Logger.log('🛑 SIGINT received, shutting down gracefully...');
//   process.exit(0);
// });

// Manejo de excepciones no capturadas
// process.on('unhandledRejection', (reason, promise) => {
//   Logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
// });

// process.on('uncaughtException', (error) => {
//   Logger.error('🚨 Uncaught Exception:', error);
//   process.exit(1);
// });

bootstrap();
