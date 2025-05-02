import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from '../config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  // Crear la aplicación HTTP
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule);

  // Configurar seguridad y validación global
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const logger = new Logger('Main Auth');

  try {
    // Configurar microservicio NATS
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    });

    // Iniciar todos los microservicios (en este caso, solo NATS)
    await app.startAllMicroservices();
    logger.log(`NATS Microservice is running and connected to ${envs.natsServers.join(', ')}`);

    // Iniciar servidor HTTP
    await app.listen(envs.port);
    logger.log(`HTTP Server is running on: http://localhost:${envs.port}`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Error starting Auth Service: ${err.message}`);
    } else {
      logger.error('Unknown error starting Auth Service');
    }
    process.exit(1);
  }
}

void bootstrap();