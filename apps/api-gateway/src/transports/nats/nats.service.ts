import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nats from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('NatsService');
  public client: nats.NatsConnection;
  private subscription: nats.Subscription;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Conectar al servidor NATS
      const natsUrl = this.configService.get('NATS_URL') || 'nats://localhost:4222';
      this.logger.log(`Conectando a NATS en ${natsUrl}`);

      this.client = await nats.connect({ servers: natsUrl });
      this.logger.log('Conexión a NATS establecida con éxito');

      // Suscribirse a eventos de autenticación
      await this.subscribeToAuthEvents();
    } catch (error) {
      this.logger.error(`Error al conectar con NATS: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.subscription) {
        await this.subscription.drain();
      }

      if (this.client) {
        await this.client.drain();
        this.logger.log('Conexión a NATS cerrada correctamente');
      }
    } catch (error) {
      this.logger.error(`Error al cerrar conexión con NATS: ${error.message}`, error.stack);
    }
  }

  // Suscribirse a los eventos de autenticación emitidos por el Auth Service
  private async subscribeToAuthEvents() {
    try {
      // Suscripción al evento 'user.registered'
      const userRegisteredSubscription = this.client.subscribe('user.registered');
      this.logger.log('Suscrito al evento: user.registered');

      // Procesar los mensajes de nuevos usuarios registrados
      (async () => {
        for await (const msg of userRegisteredSubscription) {
          try {
            const rawData = new TextDecoder().decode(msg.data);
            this.logger.debug(`Mensaje raw recibido: ${rawData}`);

            let message;
            try {
              message = JSON.parse(rawData);
            } catch (parseError) {
              this.logger.error(`Error al parsear el mensaje JSON: ${parseError.message}`);
              this.logger.debug(`Contenido del mensaje: ${rawData}`);
              continue;
            }

            // Extraer los datos del usuario del mensaje
            // El formato de NestJS ClientProxy es { pattern: string, data: any }
            const userData = message.data || message;

            if (!userData || !userData.email) {
              this.logger.warn(`Mensaje recibido sin los datos esperados: ${rawData}`);
              continue;
            }

            this.logger.log(`Evento recibido - Nuevo usuario registrado: ${userData.email} (${userData.role || 'sin rol'})`);

            // Aquí podrías implementar cualquier lógica adicional cuando un nuevo usuario se registre
            // Por ejemplo: actualizar caché, enviar notificaciones, etc.
          } catch (error) {
            this.logger.error(`Error al procesar evento user.registered: ${error.message}`);
          }
        }
      })();

      // Suscripción al evento 'user.logged_in'
      const userLoggedInSubscription = this.client.subscribe('user.logged_in');
      this.logger.log('Suscrito al evento: user.logged_in');

      // Procesar los mensajes de usuarios que inician sesión
      (async () => {
        for await (const msg of userLoggedInSubscription) {
          try {
            const rawData = new TextDecoder().decode(msg.data);
            this.logger.debug(`Mensaje raw recibido: ${rawData}`);

            let message;
            try {
              message = JSON.parse(rawData);
            } catch (parseError) {
              this.logger.error(`Error al parsear el mensaje JSON: ${parseError.message}`);
              continue;
            }

            // Extraer los datos del usuario del mensaje
            const userData = message.data || message;

            if (!userData || !userData.email) {
              this.logger.warn(`Mensaje recibido sin los datos esperados: ${rawData}`);
              continue;
            }

            this.logger.log(`Evento recibido - Usuario inició sesión: ${userData.email}`);

            // Aquí podrías implementar cualquier lógica adicional cuando un usuario inicie sesión
            // Por ejemplo: actualizar estadísticas de sesiones activas, etc.
          } catch (error) {
            this.logger.error(`Error al procesar evento user.logged_in: ${error.message}`);
          }
        }
      })();
    } catch (error) {
      this.logger.error(`Error al suscribirse a eventos de autenticación: ${error.message}`, error.stack);
    }
  }
}
