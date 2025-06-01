# DTOs y Interfaces - Exams Service

## 🔗 Interfaces Compatibles con Frontend

Estos DTOs están diseñados para ser compatibles con las interfaces existentes del frontend y facilitar la integración.

### 📝 DTOs para Creación de Exámenes

```typescript
// src/dto/create-exam.dto.ts
import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ExamType, DifficultyLevel } from '@prisma/client';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExamType)
  type: ExamType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(480) // Máximo 8 horas
  timeLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  passingScore?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts: number = 1;

  @IsBoolean()
  showResults: boolean = true;

  @IsBoolean()
  shuffleQuestions: boolean = false;

  @IsBoolean()
  shuffleOptions: boolean = false;

  @IsArray()
  @IsString({ each: true })
  questionIds: string[];
}
```

### 🎯 DTOs para Ejecución de Exámenes

```typescript
// src/dto/start-exam.dto.ts
export class StartExamDto {
  @IsString()
  examId: string;
}

// src/dto/submit-answer.dto.ts
export class SubmitAnswerDto {
  @IsString()
  attemptId: string;

  @IsString()
  examQuestionId: string;

  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  responseText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number;
}

// src/dto/finish-exam.dto.ts
export class FinishExamDto {
  @IsString()
  attemptId: string;

  @IsOptional()
  @IsEnum(['COMPLETED', 'ABANDONED'])
  status?: 'COMPLETED' | 'ABANDONED' = 'COMPLETED';
}
```

### 📊 DTOs para Consultas y Filtros

```typescript
// src/dto/exam-filters.dto.ts
export class ExamFiltersDto {
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// src/dto/dashboard-query.dto.ts
export class DashboardQueryDto {
  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30; // Últimos N días

  @IsOptional()
  @IsEnum(ExamType)
  examType?: ExamType;
}
```

## 🔄 Interfaces de Respuesta

### 📋 Respuestas para Dashboard

```typescript
// src/interfaces/dashboard.interface.ts
export interface StudentProgressResponse {
  studentId: string;
  totalExamsCompleted: number;
  totalExamsPassed: number;
  overallAverageScore: number;
  bestOverallScore: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: {
    completed: number;
    goal: number;
    percentage: number;
  };
  lastActivityDate: Date;
}

export interface AreaProgressResponse {
  areaId: string;
  areaName: string; // Obtenido del content-service
  areaColor: string;
  totalExamsTaken: number;
  averageScore: number;
  bestScore: number;
  lastExamDate: Date;
  improvementTrend: number;
  progress: number; // Porcentaje basado en averageScore
}

export interface UpcomingExamResponse {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  difficulty: DifficultyLevel;
  timeLimit: number;
  totalQuestions: number;
  canStart: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  bestScore: number;
  averageScore: number;
  estimatedDuration: string;
  lastAttemptDate?: Date;
}

export interface RecentScoreResponse {
  id: string;
  examTitle: string;
  examType: ExamType;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number; // En minutos
  correctAnswers: number;
  totalQuestions: number;
}

export interface DashboardDataResponse {
  studentProgress: StudentProgressResponse;
  areaProgress: AreaProgressResponse[];
  upcomingExams: UpcomingExamResponse[];
  recentScores: RecentScoreResponse[];
  weeklyStats: {
    examsThisWeek: number;
    hoursStudied: number;
    averageScoreThisWeek: number;
    improvementFromLastWeek: number;
  };
}
```

### 🎯 Respuestas para Ejecución de Exámenes

```typescript
// src/interfaces/exam-execution.interface.ts
export interface QuestionForStudentResponse {
  id: string;
  questionId: string;
  order: number;
  points: number;
  questionData: {
    id: string;
    texto: string;
    opciones: {
      id: string;
      texto: string;
    }[];
    // No incluir opcionCorrecta ni explicacion durante la ejecución
  };
  timeLimit?: number; // Por pregunta si aplica
}

export interface StartExamResponse {
  attemptId: string;
  exam: {
    id: string;
    title: string;
    description: string;
    type: ExamType;
    totalQuestions: number;
    timeLimit: number;
    showResults: boolean;
  };
  questions: QuestionForStudentResponse[];
  timeRemaining?: number; // En segundos
  canPause: boolean;
  instructions: string;
}

export interface SubmitAnswerResponse {
  responseId: string;
  isCorrect?: boolean; // Puede ser null si no se muestra inmediatamente
  pointsEarned: number;
  timeSpent: number;
  feedback?: {
    explanation: string;
    correctAnswer?: string;
    additionalResources?: string[];
  };
  progress: {
    answeredQuestions: number;
    totalQuestions: number;
    currentScore: number;
  };
}

export interface ExamResultsResponse {
  attemptId: string;
  exam: {
    id: string;
    title: string;
    type: ExamType;
    totalQuestions: number;
  };
  results: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    totalScore: number;
    percentage: number;
    passed: boolean;
    timeSpent: number; // En segundos
    grade: string; // A, B, C, D, F
  };
  detailedResults: {
    questionId: string;
    questionText: string;
    selectedAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
    timeSpent: number;
    explanation: string;
  }[];
  recommendations: {
    areasToImprove: string[];
    suggestedNextExams: string[];
    studyResources: string[];
  };
  comparison: {
    averageScore: number;
    percentile: number; // En qué percentil está el estudiante
    betterThan: number; // Porcentaje de estudiantes que superó
  };
}
```

### 📊 Respuestas para Estadísticas (Profesores)

```typescript
// src/interfaces/teacher-statistics.interface.ts
export interface ExamStatisticsResponse {
  exam: {
    id: string;
    title: string;
    type: ExamType;
    difficulty: DifficultyLevel;
    totalQuestions: number;
    publishedAt: Date;
  };
  statistics: {
    totalAttempts: number;
    totalStudents: number;
    completedAttempts: number;
    abandonedAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    medianScore: number;
    passingRate: number;
    averageTimeSpent: number; // En minutos
  };
  questionStatistics: {
    questionId: string;
    questionText: string;
    order: number;
    totalResponses: number;
    correctResponses: number;
    incorrectResponses: number;
    successRate: number;
    averageTimeSpent: number;
    difficultyIndex: number;
    discriminationIndex: number;
    optionDistribution: {
      [optionId: string]: {
        count: number;
        percentage: number;
      };
    };
  }[];
  trends: {
    date: string;
    averageScore: number;
    completionRate: number;
  }[];
}

export interface StudentPerformanceResponse {
  studentId: string;
  studentName: string; // Del auth-service
  attempts: {
    attemptId: string;
    attemptNumber: number;
    startedAt: Date;
    completedAt?: Date;
    status: string;
    percentage: number;
    timeSpent: number;
    passed: boolean;
  }[];
  averageScore: number;
  bestScore: number;
  improvementTrend: number;
  areasOfStrength: string[];
  areasOfImprovement: string[];
}
```

## 🔄 Mappers y Transformadores

```typescript
// src/mappers/exam.mapper.ts
export class ExamMapper {
  static toUpcomingExamResponse(
    exam: any, 
    studentAttempts: any[], 
    areaInfo?: any
  ): UpcomingExamResponse {
    const completedAttempts = studentAttempts.filter(a => a.status === 'COMPLETED').length;
    const inProgressAttempt = studentAttempts.find(a => a.status === 'IN_PROGRESS');
    const bestScore = Math.max(...studentAttempts.map(a => a.percentage), 0);

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      difficulty: exam.difficulty,
      timeLimit: exam.timeLimit,
      totalQuestions: exam.totalQuestions,
      canStart: completedAttempts < exam.maxAttempts && !inProgressAttempt,
      attemptsUsed: completedAttempts,
      maxAttempts: exam.maxAttempts,
      bestScore: bestScore,
      averageScore: exam.statistics?.averageScore || 0,
      estimatedDuration: this.calculateEstimatedDuration(exam.timeLimit, exam.totalQuestions),
      lastAttemptDate: studentAttempts[0]?.completedAt
    };
  }

  static toQuestionForStudent(
    examQuestion: any, 
    shuffleOptions: boolean = false
  ): QuestionForStudentResponse {
    const questionSnapshot = examQuestion.questionSnapshot;
    let opciones = questionSnapshot.opciones;

    if (shuffleOptions) {
      opciones = this.shuffleArray([...opciones]);
    }

    return {
      id: examQuestion.id,
      questionId: examQuestion.questionId,
      order: examQuestion.order,
      points: examQuestion.points,
      questionData: {
        id: questionSnapshot.id,
        texto: questionSnapshot.texto,
        opciones: opciones.map(opt => ({
          id: opt.id,
          texto: opt.texto
        }))
        // Intencionalmente omitimos opcionCorrecta y explicacion
      }
    };
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static calculateEstimatedDuration(timeLimit: number, questionCount: number): string {
    if (!timeLimit) return 'Sin límite';
    
    const avgTimePerQuestion = timeLimit / questionCount;
    const estimatedMinutes = Math.ceil(questionCount * avgTimePerQuestion * 0.8); // 80% del tiempo límite
    
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutos`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }
}
```

## 🎯 Validadores Personalizados

```typescript
// src/validators/exam.validators.ts
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidQuestionIds', async: true })
export class IsValidQuestionIds implements ValidatorConstraintInterface {
  async validate(questionIds: string[], args: ValidationArguments) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return false;
    }

    // Validar que todos los IDs tienen formato válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return questionIds.every(id => uuidRegex.test(id));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Question IDs must be valid UUIDs';
  }
}

@ValidatorConstraint({ name: 'isReasonableTimeLimit', async: false })
export class IsReasonableTimeLimit implements ValidatorConstraintInterface {
  validate(timeLimit: number, args: ValidationArguments) {
    const questionCount = (args.object as any).questionIds?.length || 1;
    const minTimePerQuestion = 0.5; // 30 segundos mínimo por pregunta
    const maxTimePerQuestion = 10; // 10 minutos máximo por pregunta
    
    const minTotalTime = questionCount * minTimePerQuestion;
    const maxTotalTime = questionCount * maxTimePerQuestion;
    
    return timeLimit >= minTotalTime && timeLimit <= maxTotalTime;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Time limit must be reasonable for the number of questions';
  }
}
```

Estos DTOs e interfaces proporcionan una base sólida para la implementación del servicio, manteniendo compatibilidad con el frontend existente y siguiendo las mejores prácticas de validación y transformación de datos.
