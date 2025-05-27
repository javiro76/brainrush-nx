import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from './nats.constants';
import { LoggerService } from '@brainrush-nx/shared';

@Injectable()
export class NatsService {
  constructor(
    @Inject(NATS_SERVICE) private client: ClientProxy,
    private readonly logger: LoggerService
  ) {}

  /**
   * Emite un evento cuando un usuario se registra
   * @param userData Datos del usuario registrado
   */
  emitUserRegistered(userData: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  }) {
    try {
      const payload = {
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        role: userData.role || 'student',
      };      this.logger.log('NatsService', `Emitiendo evento 'user.registered' para ${userData.email} con payload: ${JSON.stringify(payload)}`);
      this.client.emit('user.registered', payload);
    } catch (error) {
      this.logger.error('NatsService', `Error al emitir evento 'user.registered': ${error.message}`, error.stack);
    }
  }

  /**
   * Emite un evento cuando un usuario inicia sesión
   * @param userData Datos del usuario que inició sesión
   */
  emitUserLoggedIn(userData: { id: string; email: string }) {    try {
      this.logger.log('NatsService', `Emitiendo evento 'user.logged_in' para ${userData.email}`);
      this.client.emit('user.logged_in', userData);
    } catch (error) {
      this.logger.error('NatsService', `Error al emitir evento 'user.logged_in': ${error.message}`, error.stack);
    }
  }

  /**
   * Método para verificar la conexión con NATS
   */
  async checkConnection(): Promise<boolean> {
    try {
      this.logger.log('NatsService', 'Verificando conexión con NATS...');
      const client = this.client.connect();

      if (client) {
        this.logger.log('NatsService', 'Conexión con NATS establecida correctamente');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error al verificar la conexión con NATS: ${error.message}`, error.stack);
      return false;
    }
  }
}
