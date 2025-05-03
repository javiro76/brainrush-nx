import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('PrismaService');

    constructor() {
        super({
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to MongoDB database');
        } catch (error) {
            this.logger.error(`Failed to connect to MongoDB database: ${error.message}`);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from MongoDB database');
    }
}
