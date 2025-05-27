import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@brainrush-nx/shared';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Auth-Service');
  const app = await NestFactory.create(AppModule);

  // Configuración global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de CORS - importante para comunicación con API Gateway
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(envs.PORT);
  logger.log(`Auth Service is running on: http://localhost:${envs.PORT}`);
}


void bootstrap();
