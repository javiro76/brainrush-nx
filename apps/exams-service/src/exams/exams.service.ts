import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NatsService } from '../nats/nats.service';
import { CacheService } from '../cache/cache.service';
import {
  CreateExamDto,
  UpdateExamDto,
  StartExamDto,
  SubmitExamDto,
  ExamDto,
  ExamStatisticsDto,
} from '../dtos';
import { UserRole } from '@brainrush-nx/shared';
import { ExamStatus, ExamType, AttemptStatus, Exam, ExamQuestion } from '@prisma/exams-client';
import { firstValueFrom } from 'rxjs';

// Interfaces
interface ContentQuestion {
  id: string;
  type: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  difficulty: string;
  points: number;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  metadata?: unknown;
  areaId?: string;
  subAreaId?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para tipado
interface ExamWithRelations extends Exam {
  questions?: ExamQuestion[];
  _count?: {
    attempts: number;
  };
}

interface QuestionWithDetails extends ExamQuestion {
  question?: ContentQuestion;
}

interface QuestionsApiResponse {
  questions: ContentQuestion[];
}

interface ExamResponse {
  questionId: string;
  selectedOptionId?: string;
  responseText?: string;
  timeSpent?: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

interface WhereClause {
  examId?: string;
  studentId?: string;
}

interface User {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
}

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly natsService: NatsService,
    private readonly cacheService: CacheService,
  ) { }

  /**
   * Crear un nuevo examen (solo profesores y admins)
   */
  async create(createExamDto: CreateExamDto, userId: string): Promise<ExamDto> {
    this.logger.debug(`Creating exam: ${createExamDto.title} by user: ${userId}`);

    // Validar que las preguntas existen en content-service
    if (createExamDto.questionIds?.length > 0) {
      await this.validateQuestions(createExamDto.questionIds);
    }

    // Crear el examen
    const exam = await this.prisma.exam.create({
      data: {
        title: createExamDto.title,
        description: createExamDto.description,
        type: createExamDto.type as ExamType,
        difficulty: createExamDto.difficulty,
        createdBy: userId,
        areaId: createExamDto.areaId,
        timeLimit: createExamDto.timeLimit,
        passingScore: createExamDto.passingScore,
        maxAttempts: createExamDto.maxAttempts || 1,
        showResults: createExamDto.showResults ?? true,
        shuffleQuestions: createExamDto.shuffleQuestions ?? false,
        shuffleOptions: createExamDto.shuffleOptions ?? false,
      },
      include: {
        questions: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    // Agregar preguntas si se proporcionaron
    if (createExamDto.questionIds?.length > 0) {
      await this.addQuestionsToExam(exam.id, createExamDto.questionIds);
    }

    this.logger.debug(`Exam created successfully: ${exam.id}`);
    return this.mapToExamDto(exam);
  }

  /**
   * Obtener todos los exámenes con filtros
   */
  async findAll(
    page = 1,
    limit = 10,
    type?: ExamType,
    status?: ExamStatus,
    areaId?: string,
  ): Promise<{ exams: ExamDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(status && { status }),
      ...(areaId && { areaId }),
    };

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          questions: true,
          _count: {
            select: { attempts: true },
          },
        },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      exams: exams.map(this.mapToExamDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un examen por ID
   */
  async findOne(id: string): Promise<ExamDto> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return this.mapToExamDto(exam);
  }

  /**
   * Actualizar un examen
   */
  async update(
    id: string,
    updateExamDto: UpdateExamDto,
    userId: string,
  ): Promise<ExamDto> {
    const exam = await this.findExamWithPermissions(id, userId);

    // No permitir edición si el examen ya fue publicado y tiene intentos
    if (exam.status === ExamStatus.PUBLISHED) {
      const attemptCount = await this.prisma.examAttempt.count({
        where: { examId: id },
      });

      if (attemptCount > 0) {
        throw new ConflictException(
          'Cannot edit published exam with existing attempts',
        );
      }
    }

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: {
        ...updateExamDto,
        updatedAt: new Date(),
      },
      include: {
        questions: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    this.logger.debug(`Exam updated: ${id} by user: ${userId}`);
    return this.mapToExamDto(updatedExam);
  }

  /**
   * Eliminar un examen
   */
  async remove(id: string, userId: string): Promise<void> {
    const exam = await this.findExamWithPermissions(id, userId);

    // No permitir eliminación si tiene intentos
    const attemptCount = await this.prisma.examAttempt.count({
      where: { examId: id },
    });

    if (attemptCount > 0) {
      throw new ConflictException(
        'Cannot delete exam with existing attempts',
      );
    }

    await this.prisma.exam.delete({ where: { id } });

    // Limpiar cache relacionado
    await this.cacheService.invalidateExamCache(id);

    this.logger.debug(`Exam deleted: ${id} by user: ${userId}`);
  }

  /**
   * Publicar un examen
   */
  async publish(id: string, userId: string): Promise<ExamDto> {
    const exam = await this.findExamWithPermissions(id, userId);

    if (exam.status === ExamStatus.PUBLISHED) {
      throw new ConflictException('Exam is already published');
    }

    // Validar que el examen tenga al menos una pregunta
    const questionCount = await this.prisma.examQuestion.count({
      where: { examId: id },
    });

    if (questionCount === 0) {
      throw new BadRequestException(
        'Cannot publish exam without questions',
      );
    }

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: {
        status: ExamStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        questions: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    this.logger.debug(`Exam published: ${id} by user: ${userId}`);
    return this.mapToExamDto(updatedExam);
  }

  /**
   * Iniciar un examen (estudiantes)
   */
  async startExam(
    examId: string,
    startExamDto: StartExamDto,
    userId: string,
  ): Promise<{
    attemptId: string;
    examId: string;
    timeLimit: number;
    totalQuestions: number;
    questions: QuestionWithDetails[];
  }> {
    // Verificar que el examen existe y está publicado
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    if (exam.status !== ExamStatus.PUBLISHED) {
      throw new BadRequestException('Exam is not available');
    }

    // Verificar intentos previos
    const previousAttempts = await this.prisma.examAttempt.count({
      where: {
        examId,
        studentId: userId,
      },
    });

    if (previousAttempts >= exam.maxAttempts) {
      throw new BadRequestException(
        `Maximum attempts reached (${exam.maxAttempts})`,
      );
    }

    // Verificar si ya hay un intento en progreso
    const activeAttempt = await this.cacheService.getActiveExam(userId);
    if (activeAttempt && activeAttempt.examId === examId) {
      throw new ConflictException('Exam already in progress');
    }

    // Crear nuevo intento
    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId,
        studentId: userId,
        attempt: previousAttempts + 1,
        totalQuestions: exam.questions.length,
        ipAddress: startExamDto.ipAddress,
        userAgent: startExamDto.userAgent,
      },
    });    // Obtener preguntas del content-service
    const questions = await this.getExamQuestions(examId);

    // Guardar en cache el examen activo
    const examSession = {
      attemptId: attempt.id,
      examId,
      userId,
      startedAt: new Date(),
      timeLimit: exam.timeLimit,
      questions: questions.map(q => ({
        id: q.id,
        questionId: q.questionId,
        order: q.order,
        points: q.points,
      })),
    };

    await this.cacheService.setActiveExam(userId, examSession);

    this.logger.debug(`Exam started: ${examId} by user: ${userId}, attempt: ${attempt.attempt}`);

    return {
      attemptId: attempt.id,
      examId,
      timeLimit: exam.timeLimit,
      totalQuestions: exam.questions.length,
      questions: questions,
    };
  }

  /**
   * Enviar respuestas del examen
   */
  async submitExam(attemptId: string, submitExamDto: SubmitExamDto, userId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    if (attempt.studentId !== userId) {
      throw new ForbiddenException('You can only submit your own exam attempts');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Exam attempt is not in progress');
    }

    // Procesar respuestas
    const responses = await this.processExamResponses(
      attemptId,
      submitExamDto.responses
    );

    // Calcular resultados
    const results = this.calculateExamResults(responses, attempt.totalQuestions);

    // Actualizar intento
    const completedAttempt = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: submitExamDto.timeSpent,
        answeredQuestions: results.answeredQuestions,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        skippedQuestions: results.skippedQuestions,
        totalScore: results.totalScore,
        percentage: results.percentage,
        passed: results.passed,
      },
    });

    this.logger.log(`Exam submitted: ${attempt.examId} by student: ${userId}, attempt: ${attemptId}`);

    return {
      attemptId,
      examId: attempt.examId,
      results,
      completedAt: completedAttempt.completedAt,
    };
  }  /**
   * Obtener estadísticas de un examen
   */
  async getExamStatistics(examId: string): Promise<ExamStatisticsDto> {
    // const exam = await this.findOne(examId); // Not needed for statistics

    const stats = await this.prisma.examAttempt.aggregate({
      where: {
        examId,
        status: AttemptStatus.COMPLETED
      },
      _avg: {
        percentage: true,
        timeSpent: true,
      },
      _max: {
        percentage: true,
      },
      _min: {
        percentage: true,
      },
      _count: true,
    });

    const passedCount = await this.prisma.examAttempt.count({
      where: {
        examId,
        status: AttemptStatus.COMPLETED,
        passed: true,
      },
    });    return {
      examId,
      totalAttempts: stats._count,
      completedAttempts: stats._count,
      averageScore: stats._avg.percentage || 0,
      averagePercentage: stats._avg.percentage || 0,
      passRate: stats._count > 0 ? (passedCount / stats._count) : 0,
      highestScore: stats._max.percentage || 0,
      lowestScore: stats._min.percentage || 0,
      averageTimeMinutes: stats._avg.timeSpent ? Math.round(stats._avg.timeSpent / 60) : 0,
    };
  }

  /**
   * Obtener intentos de un examen específico
   */
  async getExamAttempts(
    examId: string,
    studentId?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;    const where: WhereClause = { examId };
    if (studentId) where.studentId = studentId;

    const [attempts, total] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          exam: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);

    return {
      data: attempts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener resultados de un intento específico
   */
  async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        responses: {
          include: {
            examQuestion: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    // Verificar permisos
    const user = await this.getUserById(userId);
    if (attempt.studentId !== userId && !['ADMIN', 'TEACHER'].includes(user.role)) {
      throw new ForbiddenException('You can only view your own results');
    }

    return {
      attempt,
      responses: attempt.responses,
      exam: attempt.exam,
    };
  }

  /**
   * Obtener intentos de un estudiante específico
   */
  async getStudentAttempts(
    studentId: string,
    examId?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;    const where: WhereClause = { studentId };
    if (examId) where.examId = examId;

    const [attempts, total] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          exam: {
            select: {
              title: true,
              type: true,
              difficulty: true,
            },
          },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);

    return {
      data: attempts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener información de un usuario
   */
  async getUserById(userId: string): Promise<User> {
    try {
      return await firstValueFrom(this.natsService.getUserById(userId));
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}: ${error.message}`);
      throw new BadRequestException('Invalid user');
    }
  }

  // Métodos privados auxiliares

  private async validateQuestions(questionIds: string[]): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.natsService.send('content.questions.validate', { questionIds }),
      );

      if (!response.valid) {
        throw new BadRequestException('Some questions are invalid');
      }
    } catch (error) {
      this.logger.error('Error validating questions:', error);
      throw new BadRequestException('Failed to validate questions');
    }
  }

  private async addQuestionsToExam(
    examId: string,
    questionIds: string[],
  ): Promise<void> {
    const questions = questionIds.map((questionId, index) => ({
      examId,
      questionId,
      order: index + 1,
      points: 1, // Por defecto 1 punto
    }));

    await this.prisma.examQuestion.createMany({
      data: questions,
    });

    // Actualizar contador total
    await this.prisma.exam.update({
      where: { id: examId },
      data: { totalQuestions: questionIds.length },
    });
  }
  private async findExamWithPermissions(
    id: string,
    userId: string,
  ): Promise<Exam> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    // Solo el creador o un admin puede modificar el examen
    if (exam.createdBy !== userId) {
      // Verificar si es admin via NATS
      try {
        const userResponse = await firstValueFrom(
          this.natsService.getUserById(userId),
        );

        if (userResponse.role !== UserRole.ADMIN) {
          throw new ForbiddenException('Insufficient permissions');
        }
      } catch {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return exam;
  }  private async getExamQuestions(examId: string): Promise<QuestionWithDetails[]> {
    // Primero verificar cache
    const cached = await this.cacheService.getContentQuestions(examId);
    if (cached && Array.isArray(cached)) {
      return cached as QuestionWithDetails[];
    }

    // Obtener preguntas de la base de datos local
    const examQuestions = await this.prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });

    // Obtener detalles de las preguntas del content-service
    const questionIds = examQuestions.map(eq => eq.questionId);

    try {
      const questionsResponse = await firstValueFrom(
        this.natsService.send('content.questions.findByIds', { questionIds }),
      );      const fullQuestions: QuestionWithDetails[] = examQuestions.map(eq => {
        const questionDetail = questionsResponse.questions.find(
          (q: ContentQuestion) => q.id === eq.questionId,
        );

        return {
          ...eq,
          question: questionDetail,
        };
      });

      // Cachear por 30 minutos
      await this.cacheService.setContentQuestions(examId, fullQuestions);

      return fullQuestions;
    } catch (error) {
      this.logger.error('Error fetching question details:', error);
      throw new BadRequestException('Failed to load exam questions');
    }
  }  private mapToExamDto(exam: ExamWithRelations): ExamDto {
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      status: exam.status,
      difficulty: exam.difficulty,
      createdBy: exam.createdBy,
      areaId: exam.areaId,
      timeInMinutes: exam.timeLimit,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      questionsCount: exam.totalQuestions,
      questions: exam.questions?.map(q => ({
        id: q.id,
        questionId: q.questionId,
        order: q.order,
        points: q.points,
        required: q.required,
      })),
    };
  }

  private async processExamResponses(attemptId: string, responses: ExamResponse[]) {
    const savedResponses = await Promise.all(
      responses.map(response =>
        this.prisma.examResponse.create({
          data: {
            attemptId,
            examQuestionId: response.questionId,
            selectedOptionId: response.selectedOptionId,
            responseText: response.responseText,
            timeSpent: response.timeSpent ? parseInt(response.timeSpent, 10) : 0,
            // isCorrect se calculará después
          },
        })
      )
    );

    // Evaluar respuestas
    for (const response of savedResponses) {
      const isCorrect = await this.evaluateResponse(response);
      await this.prisma.examResponse.update({
        where: { id: response.id },
        data: {
          isCorrect,
          pointsEarned: isCorrect ? 1 : 0, // Simplificado por ahora
        },
      });
    }

    return savedResponses;
  }

  private async evaluateResponse(response: { id: string; examQuestionId: string; selectedOptionId?: string }): Promise<boolean> {
    try {
      // Obtener la pregunta del content-service para verificar la respuesta correcta
      const questionData = await firstValueFrom(
        this.natsService.send('content.question.findById', {
          id: response.examQuestionId
        })
      );

      // Lógica de evaluación (simplificada)
      return questionData.correctOptionId === response.selectedOptionId;
    } catch (error) {
      this.logger.warn(`Failed to evaluate response ${response.id}: ${error.message}`);
      return false;
    }
  }

  private calculateExamResults(responses: {
    isCorrect?: boolean;
    pointsEarned?: number;
    selectedOptionId?: string;
    responseText?: string;
  }[], totalQuestions: number) {
    const answeredQuestions = responses.filter(r => r.selectedOptionId || r.responseText).length;
    const correctAnswers = responses.filter(r => r.isCorrect === true).length;
    const incorrectAnswers = responses.filter(r => r.isCorrect === false).length;
    const skippedQuestions = totalQuestions - answeredQuestions;
    const totalScore = responses.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = percentage >= 60; // 60% para aprobar (configurable)

    return {
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      totalScore,
      percentage,
      passed,
    };
  }
}
