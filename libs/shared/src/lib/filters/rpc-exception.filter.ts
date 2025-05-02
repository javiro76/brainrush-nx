import { Catch, ArgumentsHost, Logger, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost){
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const rpcError = exception.getError();

    // Log detallado del error
    this.logger.error(
      `RPC Exception: ${JSON.stringify({
        path: request.url,
        error: rpcError,
      })}`,
      exception.stack,
    );

    // Caso 1: Error con estructura { status, message }
    if (this.isErrorWithStatus(rpcError)) {
      return response.status(rpcError.status || 400).json({
        ...rpcError,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Caso 2: Error tipo "Empty response"
    if (typeof rpcError === 'string' && rpcError.includes('Empty response')) {
      return response.status(500).json({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: this.cleanRpcErrorMessage(rpcError),
      });
    }

   // Caso por defecto 
   return response.status(400).json({
    statusCode: 400,
    timestamp: new Date().toISOString(),
    path: request.url,
    message: this.formatRpcError(rpcError),
  });
  }

  private isErrorWithStatus(error: unknown): error is { status: number; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      'message' in error
    );
  }

  private cleanRpcErrorMessage(error: string): string {
    return error.substring(0, error.indexOf('(') - 1);
  }

  private formatRpcError(error: unknown): string {
    return error?.toString() || 'Internal Server Error';
  }
}
