import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { NatsService } from './nats.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'NATS_SERVICE',
                transport: Transport.NATS,
                options: {
                    servers: [envs.NATS_SERVERS],
                    // Configuración de reconexión
                    reconnect: true,
                    reconnectTimeWait: 2000,
                    maxReconnectAttempts: 10,
                    // Configuración de timeouts
                    timeout: 5000,
                    // Configuración de cola
                    queue: 'exams-service',
                    // JSON codec por defecto
                    json: true,
                },
            },
        ]),
    ],
    providers: [NatsService],
    exports: [ClientsModule, NatsService],
})
export class NatsModule { }
