import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// Importamos desde el alias configurado en tsconfig.base.json
import { PrismaClient } from '@prisma/exams-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
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
    }

    async onModuleDestroy() {
        this.logger.log('PrismaService', 'Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('PrismaService', 'Database connection closed');
    }
}
