import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma';
import { HealthModule } from '../health/health.module';
import { NatsModule } from '../nats/nats.module';
import { AreasModule } from '../areas/areas.module';
import { TextosModule } from '../textos/textos.module';
import { PreguntasModule } from '../preguntas/preguntas.module';
import { OpcionesModule } from '../opciones/opciones.module';
import { LoggingModule } from '@brainrush-nx/shared';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Sistema de logging centralizado
    LoggingModule.forRoot({ serviceName: 'Content-Service' }),

    // Configuración de rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos
      limit: 100, // 100 requests por minuto (más permisivo para contenido)
    }]),

    PrismaModule,
    HealthModule,
    NatsModule,
    AreasModule,
    TextosModule,
    PreguntasModule,
    OpcionesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
