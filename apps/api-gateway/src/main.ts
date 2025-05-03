import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@brainrush-nx/shared';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('API Gateway');
  const app = await NestFactory.create(AppModule);

  //configuración global
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true, // Permite todas las solicitudes en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(envs.port);
  logger.log(`🚀 Gateway corriendo en puerto ${envs.port}`);
}
void bootstrap();
