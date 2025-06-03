import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Módulos de la aplicación
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';
import { CacheRedisModule } from '../cache/cache.module';
import { HealthModule } from '../health/health.module';
import { ExamsModule } from '../exams/exams.module';

@Module({
  imports: [
    // ====================================
    // CONFIGURACIÓN GLOBAL
    // ====================================

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting para proteger la API
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 50, // 50 requests por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),    // ====================================
    // MÓDULOS DE INFRAESTRUCTURA
    // ====================================
    DatabaseModule, // Base de datos con Prisma
    NatsModule,     // Comunicación entre microservicios
    CacheRedisModule, // Redis para cache

    // ====================================
    // MÓDULOS DE FUNCIONALIDAD
    // ====================================

    HealthModule,   // Health checks
    ExamsModule,    // Funcionalidad principal de exámenes
  ],
})
export class AppModule {}
