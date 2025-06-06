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
  ) { }

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

  /**
   * Formatea el nombre del servicio para una mejor visualización
   */
  serviceBanner(serviceName: string, port: string | number, docsPath = 'docs') {
    const environment = process.env['NODE_ENV'] || 'development';
    const isProd = environment === 'production';

    this.logger.info(`=========================================`);
    //  this.logger.log({ message: `===================================`,level:'info' });
    this.logger.info(`🚀 ${this.formatServiceName(serviceName)} en puerto: ${port}`);

    if (!isProd) {
      this.logger.info(`📚 API Docs: http://localhost:${port}/${docsPath}`);
    }

    this.logger.info(`🏥 Health Check: http://localhost:${port}/health`);
    this.logger.info(`🛡️  Environment: ${environment}`);
    this.logger.info(`🌐 ${isProd ? 'Production Mode' : 'Development Mode'}`);
    this.logger.info(`=============================================\n`);
  }

  private formatServiceName(name: string): string {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  dbConnection(dbName: string) {
    this.logger.info(`📦 Conectado a la base de datos: ${dbName}`);
  }

  eventListener(event: string) {
    this.logger.info(`👂 Escuchando evento: ${event}`);
  }
}
