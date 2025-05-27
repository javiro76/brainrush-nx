import { Global, Module } from '@nestjs/common';
import { NatsService } from './nats.service';

/**
 * Módulo global para registro de eventos (actualmente solo log)
 * A futuro se puede implementar comunicación con NATS
 */
@Global()
@Module({
  imports: [],
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule { }
