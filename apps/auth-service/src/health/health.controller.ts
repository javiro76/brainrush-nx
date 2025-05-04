import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';


@Controller('health')
export class HealthController {
  private readonly logger = new Logger('HealthController');

  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    this.logger.log('Checking auth-service health status');

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
      // Intenta realizar una consulta sencilla para verificar la conexión
      await this.prisma.$queryRaw`SELECT 1`;

      this.logger.log('Database connection is healthy');

      return {
        database: {
          status: 'up',
        },
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);

      return {
        database: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }
}
