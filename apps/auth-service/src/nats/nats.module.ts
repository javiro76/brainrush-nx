import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config';
import { NatsService } from './nats.service';
import { NATS_SERVICE } from './nats.constants';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.NATS_SERVERS,
        },
      },
    ]),
  ],
  providers: [NatsService], // Registrar el NatsService como proveedor
  exports: [ClientsModule, NatsService], // Exportar tanto ClientsModule como NatsService
})
export class NatsModule { }
