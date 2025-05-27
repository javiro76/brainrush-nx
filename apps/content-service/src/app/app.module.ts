import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma';
import { AppConfigModule } from '../config/app-config.module';
import { HealthModule } from '../health/health.module';
import { NatsModule } from '../nats/nats.module';
import { AreasModule } from '../areas/areas.module';
import { TextosModule } from '../textos/textos.module';
import { PreguntasModule } from '../preguntas/preguntas.module';
import { OpcionesModule } from '../opciones/opciones.module';
import { LoggingModule } from '@brainrush-nx/shared';

@Module({
  imports: [
    AppConfigModule,

    // Sistema de logging centralizado
    LoggingModule.forRoot({ serviceName: 'Content-Service' }),

    PrismaModule,
    HealthModule,
    NatsModule,
    AreasModule,
    TextosModule,
    PreguntasModule,
    OpcionesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
