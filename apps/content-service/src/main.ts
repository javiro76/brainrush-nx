/**
 * Content Service - BrainRush
 * Servicio para gestión de contenidos de simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig } from '@brainrush-nx/shared';
import { envs } from './config/envs'; // Importamos la nueva configuración
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 1. Obtener la instancia
  const logger = app.get(LoggerService);
  // 2. Establecer como logger global (IMPORTANTE)
  app.useLogger(logger);

  // Determinar el entorno de ejecución
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log('Content-Service', `🚀 Content Service iniciando en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

  // Configuración de seguridad para servicio interno
  app.use(securityConfigApp({
    isPublic: false,
    hasFrontend: false,
    allowSwagger: process.env.ENABLE_SWAGGER === 'true',
  }));

  // Usamos las variables de envs en lugar de ConfigService
  const port = envs.PORT; // Obtenemos el puerto de envs

  // Configuración global
  configureApp(app, getServiceConfig('content-service'));


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
