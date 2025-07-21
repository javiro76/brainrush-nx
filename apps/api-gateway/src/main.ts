/**
 * api-gateway - BrainRush
 * Servicio api-gateway simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig, corsConfigs, compressionConfigs, logCompressionConfig, setupSwagger, swaggerConfigs } from '@brainrush-nx/shared';
import { envs } from './config';


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

  // Compresión para API Gateway
  app.use(compressionConfigs.apiGateway());
  logCompressionConfig('API-Gateway', 6, 1024, logger);

  // Configuración de CORS
  app.enableCors(corsConfigs.apiGateway([
    // Dominios adicionales específicos si es necesario
    // 'https://admin.brainrush.com'
  ]));
  logger.log('API-Gateway', '🌐 CORS configurado para servicio público');

  // Configuración de Swagger centralizada
  setupSwagger(app, swaggerConfigs.apiGateway(), logger);

  // Iniciar el servidor
  await app.listen(envs.PORT);

    // Banner de inicio
  logger.serviceBanner('API-Gateway', envs.PORT, 'api/docs');

}
void bootstrap();
