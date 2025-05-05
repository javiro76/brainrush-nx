import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, RolesGuard } from './guards';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { NatsModule } from '../transports/nats/nats.module'; // Importamos el módulo NATS

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    NatsModule, // Agregamos el módulo NATS a los imports
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Esto permitiría aplicar el JwtAuthGuard globalmente, descomentar si se desea
    /* {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }, */
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
