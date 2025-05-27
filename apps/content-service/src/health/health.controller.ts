import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult, MemoryHealthIndicator } from '@nestjs/terminus';
import { LoggerService } from '@brainrush-nx/shared';
import { PrismaService } from '../prisma';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
    private readonly logger: LoggerService,
  ) { }

  @Get()
  @HealthCheck()
  async check() {
    this.logger.log('HealthController', 'Checking content-service health status');

    return this.health.check([
      // Verificar memoria
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),

      // Verificar conexión a base de datos
      () => this.checkDatabase(),
    ]);
  }

  // Verificador personalizado para la base de datos PostgreSQL
  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      // Ejecutar una consulta simple para verificar la conexión
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        database: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      };
    } catch (error) {
      this.logger.error('HealthController', `Database health check failed: ${error.message}`);
      return {
        database: {
          status: 'down',
          message: `Database connection failed: ${error.message}`,
        },
      };
    }
  }
}
