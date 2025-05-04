import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { LoggerService } from '../common/logger.service';
import { envs } from '../config';
import * as os from 'os'; // Importamos el módulo os de Node.js

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private logger: LoggerService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    this.logger.log('HealthController', 'Checking system health status');

      // Determinar la ruta para verificar el espacio en disco según el sistema operativo
      const isWindows = os.platform() === 'win32';
      const diskPath = isWindows ? 'C:\\\\' : '/';

    return this.health.check([
      // Verifica la salud de los microservicios
      () => this.checkAuthService(),

      // Verifica recursos del sistema
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB límite
      () => this.disk.checkStorage('disk', { path: diskPath, thresholdPercent: 0.9 }), // 90% de uso de disco como límite
    ]);
  }

  // Health check específico para el servicio de autenticación
  private checkAuthService() {
    const authServiceUrl = `http://${envs.authServiceHost}:${envs.authServicePort}/health`;
    this.logger.log('HealthController', `Checking auth service health at ${authServiceUrl}`);

    return this.http.pingCheck('auth_service', authServiceUrl);
  }
}
