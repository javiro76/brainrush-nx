import { Injectable } from '@nestjs/common';
import { LoggerService } from '@brainrush-nx/shared';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {
    this.logger.log('AppService', 'Servicio inicializado');
  }

  getHello(): string {
    this.logger.log('AppService', 'Método getHello() invocado');
    return 'Hello World!';
  }
}
