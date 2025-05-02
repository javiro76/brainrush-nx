import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../../config';

export const NATS_SERVICE = 'NATS_CLIENT';

@Global()
@Module({
    imports: [
        ClientsModule.register([
            {
                name: NATS_SERVICE,
                transport: Transport.NATS,
                options: {
                    servers: envs.natsServers,
                },
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class NatsModule { }