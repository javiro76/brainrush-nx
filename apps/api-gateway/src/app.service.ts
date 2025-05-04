import { Injectable } from '@nestjs/common';
import { LoggerService } from './common/logger.service';

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
