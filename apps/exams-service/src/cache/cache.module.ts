import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { envs } from '../config/envs';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: envs.REDIS_HOST,
      port: envs.REDIS_PORT,
      password: envs.REDIS_PASSWORD,
      db: envs.REDIS_DB,
      // Configuración por defecto
      ttl: 300, // 5 minutos
      max: 1000, // máximo 1000 items en cache
      // Configuración de conexión
      retryDelay: 1000,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      // Configuración de logging
      showFriendlyErrorStack: true,
      lazyConnect: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class CacheRedisModule { }
