import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    CommonModule, // Importamos el CommonModule que contiene el LoggerService
  ],
  controllers: [HealthController],
})
export class HealthModule {}
