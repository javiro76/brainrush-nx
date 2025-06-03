import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/exams-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
            errorFormat: 'colorless',        });

        // Event listeners comentados por problemas de tipado
        // this.$on('query', (e) => {
        //     this.logger.debug(`Query: ${e.query} Params: ${e.params} Duration: ${e.duration}ms`);
        // });

        // this.$on('error', (e) => {
        //     this.logger.error(`Database error: ${e.message}`, e);
        // });

        // this.$on('info', (e) => {
        //     this.logger.log(`Database info: ${e.message}`);
        // });

        // this.$on('warn', (e) => {
        //     this.logger.warn(`Database warning: ${e.message}`);
        // });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to the database');
        } catch (error) {
            this.logger.error('Failed to connect to database:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Disconnected from database');
        } catch (error) {
            this.logger.error('Error disconnecting from database:', error);
        }
    }

    /**
     * Health check para la base de datos
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }

    /**
     * Limpieza de datos para testing
     */
    async cleanDatabase(): Promise<void> {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }

        const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

        for (const { tablename } of tablenames) {
            if (tablename !== '_prisma_migrations') {
                try {
                    await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
                } catch (error) {
                    this.logger.warn(`Could not truncate ${tablename}:`, error);
                }
            }
        }
    }
}
