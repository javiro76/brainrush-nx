import { Module, DynamicModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { createWinstonConfig } from './winston.config';

export interface LoggingModuleOptions {
  serviceName?: string;
}

/**
 * Módulo de logging centralizado que puede ser importado por cualquier microservicio
 */
@Module({})
export class LoggingModule {
  /**
   * Configura el módulo de logging para un servicio específico
   * @param options Opciones de configuración del logging
   * @returns DynamicModule configurado
   */
  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const { serviceName = 'App' } = options;

    return {
      module: LoggingModule,
      imports: [
        WinstonModule.forRoot(createWinstonConfig(serviceName))
      ],
      providers: [LoggerService],
      exports: [LoggerService, WinstonModule],
      global: true, // Hace que el módulo esté disponible globalmente
    };
  }
}
