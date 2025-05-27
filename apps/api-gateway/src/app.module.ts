import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { NatsModule } from './transports/nats/nats.module';
import { ContentModule } from './content/content.module';
import { LoggingModule } from '@brainrush-nx/shared';

@Module({
  imports: [
    // Sistema de logging centralizado
    LoggingModule.forRoot({ serviceName: 'API-Gateway' }),

    // Rate limiting - protección contra abusos
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // tiempo de vida en milisegundos (60 segundos)
      limit: 10, // número máximo de solicitudes en el ttl
    }]),

    // Otros módulos
    HttpModule,
    AuthModule,
    CommonModule, // Importamos el CommonModule que contiene nuestro LoggerService local (será removido)
    HealthModule, // Importamos el módulo de Health Checks
    NatsModule,   // Añadimos el módulo NATS para eventos
    ContentModule, // Módulo para el servicio de contenido
  ],
  providers: [
    AppService,
    // Configurar ThrottlerGuard como guard global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
