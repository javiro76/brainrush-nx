/**
 * Exams Service - BrainRush
 * Servicio para gestión de exámenes de simulacros ICFES
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { configureApp, LoggerService, securityConfigApp, getServiceConfig, corsConfigs,  setupSwagger, swaggerConfigs } from '@brainrush-nx/shared';
import { envs } from './config/envs';

import { Transport, MicroserviceOptions } from '@nestjs/microservices';

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
  app.use(securityConfigApp({
    isPublic: false,
    hasFrontend: false,
    allowSwagger: process.env.ENABLE_SWAGGER === 'true',
  }));

  // Configuración global
  configureApp(app, getServiceConfig('exams-service'));



  // Configuración de CORS para servicio interno
  app.enableCors(corsConfigs.internalService());
  logger.log('Exams-Service', '🌐 CORS configurado para servicio interno');

  // Configuración de Swagger centralizada
  setupSwagger(app, swaggerConfigs.examsService(), logger);

  // ====================================
  // MICROSERVICIO NATS
  // ====================================

  // Configurar como microservicio NATS
  // const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.NATS,
  //     options: {
  //       servers: [envs.NATS_SERVERS],
  //       queue: 'exams-service',
  //     },
  //   }
  // ); await natsApp.listen();
  // logger.log(`🔌 NATS Microservice listening on:, ${envs.NATS_SERVERS}`);

  // ====================================
  // INICIO DEL SERVIDOR HTTP
  // ====================================

  await app.listen(envs.PORT);


}


bootstrap();
