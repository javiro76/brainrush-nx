/**
 * api-gateway - BrainRush
 * Servicio api-gateway simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig } from '@brainrush-nx/shared';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 1. Obtener la instancia
  const logger = app.get(LoggerService);
  // 2. Establecer como logger global (IMPORTANTE)
  app.useLogger(logger);

  // Determinar el entorno de ejecución
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log('API-Gateway', `🚀 API-Gateway iniciando en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

  // Configuración de seguridad
  app.use(securityConfigApp({
    isPublic: true,
    hasFrontend: true,
    allowSwagger: process.env.ENABLE_SWAGGER === 'true',
  }));

  // Configuración global
  configureApp(app, getServiceConfig('api-gateway'));


  // Configuración de CORS
  app.enableCors({
    origin: isProduction ? [
      // Lista de dominios permitidos en producción
      'https://brainrush.com',
      'https://api.brainrush.com'
    ] : true, // En desarrollo, permitir todos los orígenes
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('BrainRush API Gateway')
    .setDescription('API Gateway para el ecosistema de microservicios BrainRush')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(envs.PORT);
  logger.log(`API Gateway is running on: http://localhost:${envs.PORT}`);
  logger.log(`Swagger documentation available at: http://localhost:${envs.PORT}/api/docs`);
  logger.log(`Health check available at: http://localhost:${envs.PORT}/health`);
}
void bootstrap();
