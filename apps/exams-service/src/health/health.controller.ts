import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  PrismaHealthIndicator
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoggerService } from '@brainrush-nx/shared';
import { PrismaService } from '../database/prisma.service';
import { envs } from '../config/envs';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) { }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Verificación de salud del servicio de exámenes' })
  @ApiResponse({ status: 200, description: 'Servicio saludable' })
  @ApiResponse({ status: 503, description: 'Servicio no saludable' })
  check() {
    this.logger.log('HealthController', 'Ejecutando health check completo para Exams Service');

    return this.health.check([
      // Verificación de base de datos
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Verificación de memoria (máximo 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Verificación de espacio en disco (mínimo 1GB libre)
      () => this.disk.checkStorage('storage', {
        thresholdPercent: 0.9,
        path: process.platform === 'win32' ? 'C:\\' : '/'
      }),

      // Verificación de servicios dependientes
      () => this.checkContentService(),
      () => this.checkAuthService(),
      () => this.checkNatsService(),
    ]);
  }

  // Health check específico para el servicio de contenido
  private checkContentService() {
    const contentServiceUrl = `${envs.CONTENT_SERVICE_URL}/health`;
    this.logger.log('HealthController', `Verificando servicio de contenido en ${contentServiceUrl}`);

    return this.http.pingCheck('content_service', contentServiceUrl);
  }

  // Health check específico para el servicio de autenticación
  private checkAuthService() {
    const authServiceUrl = `${envs.AUTH_SERVICE_URL}/health`;
    this.logger.log('HealthController', `Verificando servicio de autenticación en ${authServiceUrl}`);

    return this.http.pingCheck('auth_service', authServiceUrl);
  }

  // Health check para NATS
  private checkNatsService() {
    // Para NATS, verificamos el primer servidor de la lista
    const natsUrl = envs.NATS_SERVERS[0].replace('nats://', 'http://') + ':8222';
    this.logger.log('HealthController', `Verificando NATS en ${natsUrl}`);

    return this.http.pingCheck('nats_service', natsUrl);
  }
}
