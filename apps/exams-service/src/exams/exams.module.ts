import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';
import { CacheRedisModule } from '../cache/cache.module';

@Module({
  imports: [DatabaseModule, NatsModule, CacheRedisModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
