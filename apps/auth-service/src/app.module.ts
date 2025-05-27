import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NatsModule } from './nats/nats.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from '@brainrush-nx/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Sistema de logging centralizado
    LoggingModule.forRoot({ serviceName: 'Auth-Service' }),

    // Rate limiting - protección contra abusos
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // 60 segundos
      limit: 50, // 50 solicitudes por minuto (más permisivo que API Gateway)
    }]),

    PrismaModule,
    NatsModule,
    AuthModule,
    HealthModule,
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
