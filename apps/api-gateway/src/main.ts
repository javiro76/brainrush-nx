/**
 * api-gateway - BrainRush
 * Servicio api-gateway simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig, corsConfigs, compressionConfigs, logCompressionConfig } from '@brainrush-nx/shared';
import { envs } from './config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


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

  // Configuración global (incluye prefix desde getServiceConfig)
  configureApp(app, getServiceConfig('api-gateway'));

  // ====================================
  // NOTA: NO configurar prefix manualmente aquí
  // La configuración del prefix se maneja en getServiceConfig()
  // ====================================

  // Compresión para API Gateway
  app.use(compressionConfigs.apiGateway());
  logCompressionConfig('API-Gateway', 6, 1024, logger);

  // Configuración de CORS
  app.enableCors(corsConfigs.apiGateway([
    // Dominios adicionales específicos si es necesario
    // 'https://admin.brainrush.com'
  ]));
  logger.log('API-Gateway', '🌐 CORS configurado para servicio público');


  // Configuración de Swagger simplificada
  if (envs.ENABLE_SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('BrainRush API Gateway')
      .setDescription('API Gateway para simulacros ICFES')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${envs.API_PREFIX}/docs`, app, document);

    // logger.log('API-Gateway', `📚 Swagger disponible en: ${envs.API_PREFIX}/docs`);
  }


  // Iniciar el servidor
  await app.listen(envs.PORT);

    // Banner de inicio
  logger.serviceBanner('API-Gateway', envs.PORT, `${envs.API_PREFIX}/docs`);

}
void bootstrap();
