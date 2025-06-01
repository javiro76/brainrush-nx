# Guía de Implementación - Esquema Prisma Exams Service

## 🚀 Plan de Implementación

Esta guía detalla los pasos necesarios para implementar el nuevo esquema de `exams-service` en el proyecto BrainRush existente.

## 📋 Pre-requisitos

- [x] Análisis del contexto existente completado
- [x] Diseño del esquema validado
- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] Prisma CLI instalado

## 🔧 Paso 1: Configuración Inicial

### 1.1 Verificar Variables de Entorno

```bash
# En apps/exams-service/.env
DATABASE_URL="postgresql://usuario:password@localhost:5432/exams_db?schema=public"
```

### 1.2 Instalar Dependencias (si no están)

```bash
cd apps/exams-service
npm install prisma @prisma/client
npm install -D prisma
```

## 🗄️ Paso 2: Migración de Base de Datos

### 2.1 Generar Migración Inicial

```bash
cd apps/exams-service
npx prisma migrate dev --name "complete_exam_system_setup"
```

### 2.2 Generar Cliente Prisma

```bash
npx prisma generate
```

### 2.3 Verificar la Migración

```bash
npx prisma studio
```

## 📊 Paso 3: Poblar Datos Iniciales (Opcional)

### 3.1 Script de Seed para Testing

Crear `apps/exams-service/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear examen de ejemplo
  const sampleExam = await prisma.exam.create({
    data: {
      title: "Simulacro ICFES Matemáticas",
      description: "Examen de práctica para matemáticas ICFES",
      type: "SIMULACRO",
      status: "PUBLISHED",
      difficulty: "INTERMEDIO",
      timeLimit: 90,
      totalQuestions: 25,
      maxAttempts: 3,
      passingScore: 70,
      createdBy: "teacher-1",
      areaId: "matematicas-area-id"
    }
  });

  // Crear preguntas de ejemplo
  const sampleQuestions = [];
  for (let i = 1; i <= 25; i++) {
    const question = await prisma.examQuestion.create({
      data: {
        examId: sampleExam.id,
        questionId: `math-question-${i}`,
        order: i,
        points: 1,
        questionSnapshot: {
          id: `math-question-${i}`,
          texto: `Pregunta de matemáticas ${i}`,
          opciones: [
            { id: `opt-${i}-a`, texto: "Opción A" },
            { id: `opt-${i}-b`, texto: "Opción B" },
            { id: `opt-${i}-c`, texto: "Opción C" },
            { id: `opt-${i}-d`, texto: "Opción D" }
          ],
          opcionCorrecta: `opt-${i}-a`,
          explicacion: `Explicación para pregunta ${i}`
        }
      }
    });
    sampleQuestions.push(question);
  }

  // Crear estadísticas base
  await prisma.examStatistics.create({
    data: {
      examId: sampleExam.id
    }
  });

  console.log('Datos de prueba creados exitosamente');
  console.log(`Examen creado: ${sampleExam.id}`);
  console.log(`Preguntas creadas: ${sampleQuestions.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3.2 Ejecutar Seed

```bash
npx tsx prisma/seed.ts
```

## 🔌 Paso 4: Servicios de Integración

### 4.1 Crear Service de Integración con Content-Service

Crear `apps/exams-service/src/services/content-integration.service.ts`:

```typescript
import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContentIntegrationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async getQuestionById(questionId: string) {
    const contentServiceUrl = this.configService.get('CONTENT_SERVICE_URL');
    
    try {
      const response = await this.httpService.axiosRef.get(
        `${contentServiceUrl}/api/questions/${questionId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error);
      throw new Error(`Could not fetch question from content service`);
    }
  }

  async getQuestionsByIds(questionIds: string[]) {
    const contentServiceUrl = this.configService.get('CONTENT_SERVICE_URL');
    
    try {
      const response = await this.httpService.axiosRef.post(
        `${contentServiceUrl}/api/questions/batch`,
        { questionIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching questions batch:', error);
      throw new Error('Could not fetch questions from content service');
    }
  }

  async getAreaById(areaId: string) {
    const contentServiceUrl = this.configService.get('CONTENT_SERVICE_URL');
    
    try {
      const response = await this.httpService.axiosRef.get(
        `${contentServiceUrl}/api/areas/${areaId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching area ${areaId}:`, error);
      return null;
    }
  }
}
```

### 4.2 Crear Service Principal de Exams

Crear `apps/exams-service/src/services/exams.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ContentIntegrationService } from './content-integration.service';
import { CreateExamDto, StartExamDto, SubmitAnswerDto } from '../dto';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentService: ContentIntegrationService
  ) {}

  async createExam(teacherId: string, data: CreateExamDto) {
    // Validar que las preguntas existen en content-service
    const questions = await this.contentService.getQuestionsByIds(data.questionIds);
    
    if (questions.length !== data.questionIds.length) {
      throw new Error('Some questions were not found in content service');
    }

    // Crear examen
    const exam = await this.prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        difficulty: data.difficulty,
        areaId: data.areaId,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        passingScore: data.passingScore,
        showResults: data.showResults,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
        createdBy: teacherId,
        status: 'DRAFT'
      }
    });

    // Crear preguntas con snapshots
    const examQuestions = await Promise.all(
      data.questionIds.map(async (questionId, index) => {
        const questionData = questions.find(q => q.id === questionId);
        
        return this.prisma.examQuestion.create({
          data: {
            examId: exam.id,
            questionId: questionId,
            order: index + 1,
            points: this.calculateQuestionPoints(questionData),
            questionSnapshot: this.createQuestionSnapshot(questionData)
          }
        });
      })
    );

    // Actualizar contador
    await this.prisma.exam.update({
      where: { id: exam.id },
      data: { totalQuestions: examQuestions.length }
    });

    // Crear estadísticas base
    await this.prisma.examStatistics.create({
      data: { examId: exam.id }
    });

    return { exam, questions: examQuestions };
  }

  async startExam(studentId: string, examId: string) {
    // Implementar lógica de inicio de examen
    // (Ver WORKFLOWS.md para detalles completos)
  }

  async submitAnswer(data: SubmitAnswerDto) {
    // Implementar lógica de respuesta
    // (Ver WORKFLOWS.md para detalles completos)
  }

  async finishExam(attemptId: string) {
    // Implementar lógica de finalización
    // (Ver WORKFLOWS.md para detalles completos)
  }

  private calculateQuestionPoints(questionData: any): number {
    // Lógica para calcular puntos basado en dificultad
    switch (questionData.difficulty) {
      case 'AVANZADO': return 2;
      case 'INTERMEDIO': return 1;
      case 'BASICO': return 1;
      default: return 1;
    }
  }

  private createQuestionSnapshot(questionData: any) {
    return {
      id: questionData.id,
      texto: questionData.texto,
      competenciaId: questionData.competenciaId,
      afirmacionId: questionData.afirmacionId,
      opciones: questionData.opciones,
      opcionCorrecta: questionData.opcionCorrecta,
      explicacion: questionData.explicacion,
      difficulty: questionData.difficulty,
      snapshotTimestamp: new Date().toISOString()
    };
  }
}
```

## 🌐 Paso 5: Controllers y API

### 5.1 Crear Controller Principal

Crear `apps/exams-service/src/controllers/exams.controller.ts`:

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  Request,
  UseGuards 
} from '@nestjs/common';
import { ExamsService } from '../services/exams.service';
import { DashboardService } from '../services/dashboard.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('api/exams')
@UseGuards(AuthGuard)
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly dashboardService: DashboardService
  ) {}

  @Post()
  async createExam(@Request() req, @Body() data: any) {
    return this.examsService.createExam(req.user.id, data);
  }

  @Get('available')
  async getAvailableExams(@Request() req) {
    return this.examsService.getAvailableExams(req.user.id);
  }

  @Post(':id/start')
  async startExam(@Request() req, @Param('id') examId: string) {
    return this.examsService.startExam(req.user.id, examId);
  }

  @Post('attempts/:attemptId/answers')
  async submitAnswer(@Param('attemptId') attemptId: string, @Body() data: any) {
    return this.examsService.submitAnswer({ ...data, attemptId });
  }

  @Put('attempts/:attemptId/finish')
  async finishExam(@Param('attemptId') attemptId: string) {
    return this.examsService.finishExam(attemptId);
  }

  @Get('dashboard')
  async getDashboardData(@Request() req) {
    return this.dashboardService.getDashboardData(req.user.id);
  }

  @Get('statistics/student')
  async getStudentStatistics(@Request() req) {
    return this.dashboardService.getStudentStatistics(req.user.id);
  }
}
```

### 5.2 Crear Dashboard Service

Crear `apps/exams-service/src/services/dashboard.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(studentId: string) {
    const [
      studentProgress,
      areaProgress,
      upcomingExams,
      recentScores
    ] = await Promise.all([
      this.getStudentProgress(studentId),
      this.getStudentAreaProgress(studentId),
      this.getUpcomingExams(studentId),
      this.getRecentScores(studentId)
    ]);

    return {
      studentProgress,
      areaProgress,
      upcomingExams,
      recentScores
    };
  }

  private async getStudentProgress(studentId: string) {
    return this.prisma.studentProgress.findUnique({
      where: { studentId }
    });
  }

  private async getStudentAreaProgress(studentId: string) {
    return this.prisma.studentAreaStatistics.findMany({
      where: { studentId },
      orderBy: { averageScore: 'desc' }
    });
  }

  private async getUpcomingExams(studentId: string) {
    // Implementar lógica del DASHBOARD_QUERIES.md
  }

  private async getRecentScores(studentId: string) {
    // Implementar lógica del DASHBOARD_QUERIES.md
  }
}
```

## 🔄 Paso 6: Jobs y Tareas de Mantenimiento

### 6.1 Configurar Bull Queue para Jobs

```bash
npm install @nestjs/bull bull
npm install -D @types/bull
```

### 6.2 Crear Job de Estadísticas

Crear `apps/exams-service/src/jobs/statistics.processor.ts`:

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../services/prisma.service';

@Processor('statistics')
export class StatisticsProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('updateExamStatistics')
  async updateExamStatistics(job: Job<{ examId: string }>) {
    const { examId } = job.data;
    
    // Implementar lógica de recálculo
    console.log(`Updating statistics for exam ${examId}`);
    
    // Ver WORKFLOWS.md para implementación completa
  }

  @Process('nightlyRecalculation')
  async nightlyRecalculation(job: Job) {
    console.log('Starting nightly statistics recalculation');
    
    // Implementar recálculo nocturno
    // Ver WORKFLOWS.md para detalles
  }
}
```

## 🧪 Paso 7: Testing

### 7.1 Crear Tests Unitarios

Crear `apps/exams-service/src/services/__tests__/exams.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from '../exams.service';
import { PrismaService } from '../prisma.service';

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        {
          provide: PrismaService,
          useValue: {
            exam: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            // ... otros mocks
          },
        },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an exam', async () => {
    // Test implementation
  });

  it('should start an exam for a student', async () => {
    // Test implementation
  });

  // Más tests...
});
```

### 7.2 Crear Tests de Integración

Crear tests que validen la integración con el content-service y la base de datos.

## 📈 Paso 8: Monitoreo y Métricas

### 8.1 Configurar Logging

```typescript
// En main.ts o app.module.ts
import { Logger } from '@nestjs/common';

// Configurar logger para operaciones críticas
const logger = new Logger('ExamsService');

// En los servicios importantes
logger.log(`Exam started: ${examId} by student: ${studentId}`);
logger.error(`Failed to submit answer: ${error.message}`);
```

### 8.2 Métricas de Performance

```typescript
// Añadir métricas para monitorear:
// - Tiempo promedio de respuesta de exámenes
// - Número de exámenes creados por día
// - Tasa de abandono de exámenes
// - Tiempo promedio de finalización
```

## 🚀 Paso 9: Despliegue

### 9.1 Configuración de Producción

```bash
# Variables de entorno para producción
DATABASE_URL="postgresql://prod_user:prod_pass@db_host:5432/exams_prod"
CONTENT_SERVICE_URL="https://content.brainrush.com"
REDIS_URL="redis://redis_host:6379"
```

### 9.2 Migración en Producción

```bash
# Aplicar migraciones sin prompts
npx prisma migrate deploy

# Verificar estado
npx prisma migrate status
```

## ✅ Checklist de Validación

- [ ] Migración de base de datos ejecutada correctamente
- [ ] Cliente Prisma generado y funcionando
- [ ] Servicios de integración con content-service funcionando
- [ ] Endpoints de API respondiendo correctamente
- [ ] Dashboard mostrando datos reales
- [ ] Jobs de estadísticas ejecutándose
- [ ] Tests pasando correctamente
- [ ] Logging y monitoreo configurado
- [ ] Documentación actualizada

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   ```bash
   # Verificar conexión
   npx prisma db pull
   ```

2. **Cliente Prisma no actualizado**
   ```bash
   # Regenerar cliente
   npx prisma generate
   ```

3. **Problemas con migraciones**
   ```bash
   # Reset en desarrollo (⚠️ CUIDADO: Borra datos)
   npx prisma migrate reset
   ```

4. **Errores de integración con content-service**
   - Verificar URLs y autenticación
   - Revisar logs de ambos servicios
   - Validar formatos de respuesta

## 📚 Próximos Pasos

1. **Implementar notificaciones en tiempo real** para actualizaciones de exámenes
2. **Agregar caché Redis** para consultas frecuentes del dashboard
3. **Implementar reportes PDF** de resultados de exámenes
4. **Añadir sistema de backup** automático de datos críticos
5. **Optimizar consultas** basándose en métricas de producción

Esta guía proporciona una ruta clara para implementar el esquema completo de exams-service de manera incremental y segura.
