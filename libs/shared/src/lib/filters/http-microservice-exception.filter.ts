// libs/shared/src/lib/filters/microservice-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro de excepciones personalizado para microservicios en NestJS en producción.
 * Maneja excepciones, registra información relevante y envía respuestas al cliente.
 *
 * - Registra detalles completos de la excepción.
 * - Responde con un formato estandarizado.
 */

@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('MicroserviceExceptionFilter');
  private readonly serviceName = process.env['SERVICE_NAME'] || 'Unknown-Service';

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception instanceof HttpException
      ? this.formatMessage(exception.getResponse())
      : 'Internal server error';

    // 📡 Log con contexto de microservicio
    this.logger.error(`[${this.serviceName}] ${status}: ${request.method} ${request.url}`, {
      error: exception.message,
      stack: exception.stack,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'] || 'none',
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      service: this.serviceName,
      correlationId: request.headers['x-correlation-id'],
    });
  }

  private formatMessage(response: string | any): string | string[] {
    return typeof response === 'object'
      ? response.message || 'Unknown error'
      : response;
  }
}
