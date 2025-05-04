import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@brainrush-nx/shared';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Usar el logger de Winston como logger global
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Determinar el entorno de ejecución
  const isProduction = process.env.NODE_ENV === 'production';
  logger.log(`Aplicación iniciando en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

  // Implementar Helmet con configuración condicional según el entorno
  if (isProduction) {
    // Configuración estricta para producción
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "validator.swagger.io"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        crossOriginEmbedderPolicy: false, // Necesario para Swagger UI
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Necesario para Swagger UI
        strictTransportSecurity: {
          maxAge: 63072000, // 2 años en segundos
          includeSubDomains: true,
          preload: true,
        },
      })
    );
    logger.log('Seguridad: Configuración estricta de Helmet aplicada para producción');
  } else {
    // Configuración más permisiva para desarrollo
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
            fontSrc: ["'self'", "https:", "http:", "data:"],
            objectSrc: ["'self'"],
            mediaSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'self'", "https:", "http:"],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        // Sin HSTS en desarrollo para evitar problemas con HTTP local
      })
    );
    logger.log('Seguridad: Configuración flexible de Helmet aplicada para desarrollo');
  }

  // Configuración global
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

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

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`API Gateway is running on: http://localhost:${process.env.PORT ?? 3000}`);
  logger.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
void bootstrap();
