import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  message?: string | string[];
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For any other properties
}


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.formatMessage(errorResponse),
      error: this.formatError(errorResponse),
    });
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
}
