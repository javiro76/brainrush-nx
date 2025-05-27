import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Importamos desde el alias configurado en tsconfig.base.json
import { PrismaClient } from '@prisma/content-client';
import { LoggerService } from '@brainrush-nx/shared';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }
  async onModuleInit() {
    this.logger.log('PrismaService', 'Connecting to database...');
    await this.$connect();
    this.logger.log('PrismaService', 'Database connection established');

    // Opcional: Logging para queries (útil en desarrollo)
    // Eliminar el logging de queries temporalmente para evitar errores de compilación
    // this.$on('query', (e: { query: string; duration: number }) => {
    //   this.logger.debug(`Query: ${e.query}`);
    //   this.logger.debug(`Duration: ${e.duration}ms`);
    // });
  }
  async onModuleDestroy() {
    this.logger.log('PrismaService', 'Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('PrismaService', 'Database connection closed');
  }
}
