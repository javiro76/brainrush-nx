import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// Cambiar la importación para usar el cliente de Prisma directamente desde @prisma/client
import { PrismaClient } from '@prisma/auth-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');

  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database');
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL database: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }
}
