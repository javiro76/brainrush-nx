import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    CommonModule, // Importamos CommonModule que contiene LoggerService
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
