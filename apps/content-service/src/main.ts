/**
 * Content Service - BrainRush
 * Servicio para gestión de contenidos de simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig,corsConfigs, setupSwagger, swaggerConfigs } from '@brainrush-nx/shared';
import { envs } from './config/envs'; // Importamos la nueva configuración

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


  // Configuración de CORS para servicio interno
  app.enableCors(corsConfigs.internalService());
  logger.log('Content-Service', '🌐 CORS configurado para servicio interno');

  // Configuración de Swagger
setupSwagger(app, swaggerConfigs.examsService(), logger);

  await app.listen(port);

  // Log mejorado con más información
  logger.log('Content-Service', `=============================================`);
  logger.log('Content-Service', `🚀 Content Service is running on port: ${port}`);
  logger.log('Content-Service', `📚 API Docs: http://localhost:${port}/docs`);
  logger.log('Content-Service', `🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log('Content-Service', `=============================================`);
}

bootstrap();
