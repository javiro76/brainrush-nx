import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';


/**
 * Filtro de excepciones HTTP personalizado para NestJS en desarrollo.
 * Maneja excepciones HTTP, registra información relevante y envía respuestas al cliente.
 *
 * - Sanitiza el cuerpo de la solicitud en producción.
 * - Registra detalles completos en desarrollo.
 * - Responde con un formato estandarizado.
 */
interface ErrorResponse {
  message?: string | string[];
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');
  private readonly isProduction = process.env['NODE_ENV'] === 'production';

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // 🔒 Sanitizar body en producción (remover passwords, tokens, etc.)
    const sanitizedBody = this.sanitizeRequestBody(request.body);
    const sanitizedHeaders = this.sanitizeHeaders(request.headers);

    // 📝 Log completo solo en desarrollo
    if (!this.isProduction) {
      this.logger.error(`HTTP Exception: ${JSON.stringify({
        status,
        path: request.url,
        method: request.method,
        headers: sanitizedHeaders,
        body: sanitizedBody,
        error: errorResponse,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
      }, null, 2)}`);
    } else {
      // 🏭 Log minimal en producción
      this.logger.error(`HTTP ${status}: ${request.method} ${request.url} - ${this.formatMessage(errorResponse)}`);
    }

    // 📤 Respuesta al cliente
    const responsePayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.formatMessage(errorResponse),
      error: this.formatError(errorResponse),
      // 🆔 ID único para rastrear errores en logs
      errorId: this.generateErrorId(),
      // 🔒 Solo en desarrollo: detalles extra
      ...((!this.isProduction && status >= 500) && {
        stack: exception.stack?.split('\n').slice(0, 5), // Primeras 5 líneas del stack
        details: errorResponse,
      }),
    };

    response.status(status).json(responsePayload);
  }

  private formatMessage(response: string | ErrorResponse): string | string[] {
    return typeof response === 'object'
      ? response.message || 'Unknown error'
      : response;
  }

  private formatError(response: string | ErrorResponse): string | null {
    return typeof response === 'object'
      ? response.error || null
      : null;
  }

  // 🔒 Remover información sensible del body
  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key', 'credential'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // 🔒 Sanitizar headers sensibles
  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (header in sanitized) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // 🆔 Generar ID único para rastrear errores
  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
