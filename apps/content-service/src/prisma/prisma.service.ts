import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// Importamos desde el alias configurado en tsconfig.base.json
import { PrismaClient } from '@prisma/content-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
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
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established');

    // Opcional: Logging para queries (útil en desarrollo)
    // Eliminar el logging de queries temporalmente para evitar errores de compilación
    // this.$on('query', (e: { query: string; duration: number }) => {
    //   this.logger.debug(`Query: ${e.query}`);
    //   this.logger.debug(`Duration: ${e.duration}ms`);
    // });
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
