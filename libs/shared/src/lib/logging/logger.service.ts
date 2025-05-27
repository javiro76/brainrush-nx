import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Servicio de logging centralizado utilizando Winston
 * Este servicio permite registrar logs de manera consistente en toda la aplicación
 */
@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  /**
   * Registra un mensaje de información
   */
  log(context: string, message: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Registra un mensaje de error
   */
  error(context: string, message: string, trace?: string): void {
    this.logger.error(`${message}${trace ? ` - ${trace}` : ''}`, { context });
  }

  /**
   * Registra un mensaje de advertencia
   */
  warn(context: string, message: string): void {
    this.logger.warn(message, { context });
  }

  /**
   * Registra un mensaje de depuración
   */
  debug(context: string, message: string): void {
    this.logger.debug(message, { context });
  }

  /**
   * Registra un mensaje de tipo verbose
   */
  verbose(context: string, message: string): void {
    this.logger.verbose(message, { context });
  }
}
