import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NatsModule } from './nats/nats.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    NatsModule,
    AuthModule,
    HealthModule, // Agregamos el módulo de Health Checks
  ],
  providers: [AppService],
})
export class AppModule { }
