/**
 * auth Service - BrainRush
 * Servicio para gestión de autenticación de simulacros ICFES
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService, securityConfigApp, configureApp, getServiceConfig,corsConfigs } from '@brainrush-nx/shared';
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
  logger.log('Auth-Service', `🚀 Auth-Service iniciando en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

 // Configuración de seguridad para servicio interno
  app.use(securityConfigApp({
    isPublic: false,
    hasFrontend: false,
     allowSwagger: process.env.ENABLE_SWAGGER === 'true',
  }));


  // Configuración global
  configureApp(app, getServiceConfig('auth-service'));




  // Configuración de CORS para servicio interno
  app.enableCors(corsConfigs.internalService());
  logger.log('Auth-Service', '🌐 CORS configurado para servicio interno');

  
  // Configuración de Swagger para documentación interna
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Servicio de autenticación para el ecosistema BrainRush')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación')
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

  await app.listen(envs.PORT);

  // Logs informativos mejorados
  logger.log('Auth-Service', `=============================================`);
  logger.log('Auth-Service', `🔐 Auth Service is running on port: ${envs.PORT}`);
  logger.log('Auth-Service', `📚 API Docs: http://localhost:${envs.PORT}/docs`);
  logger.log('Auth-Service', `🏥 Health Check: http://localhost:${envs.PORT}/health`);
  logger.log('Auth-Service', `🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log('Auth-Service', `=============================================`);
}


void bootstrap();
