import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType, ExamStatus, DifficultyLevel } from '@prisma/exams-client';

export class ExamDto {
    @ApiProperty({ description: 'ID único del examen' })
    id: string;

    @ApiProperty({ description: 'Título del examen' })
    title: string;

    @ApiProperty({ description: 'Descripción del examen' })
    description: string;

    @ApiProperty({ enum: ExamType, description: 'Tipo de examen' })
    type: ExamType;

    @ApiProperty({ enum: ExamStatus, description: 'Estado del examen' })
    status: ExamStatus;

    @ApiProperty({ description: 'Tiempo límite en minutos' })
    timeInMinutes: number;    @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Dificultad del examen' })
    difficulty?: DifficultyLevel;

    @ApiPropertyOptional({ description: 'ID del área principal del examen' })
    areaId?: string;

    @ApiPropertyOptional({ description: 'Puntaje máximo del examen' })
    maxScore?: number;

    @ApiPropertyOptional({ description: 'Puntaje mínimo para aprobar' })
    passingScore?: number;

    @ApiPropertyOptional({ description: 'Número máximo de intentos permitidos' })
    maxAttempts?: number;

    @ApiPropertyOptional({ description: 'Instrucciones especiales' })
    instructions?: string;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización' })
    updatedAt: Date;

    @ApiProperty({ description: 'ID del usuario creador' })
    createdBy: string;

    @ApiPropertyOptional({ description: 'Número total de preguntas' })
    questionsCount?: number;    @ApiPropertyOptional({ description: 'Preguntas del examen' })
    questions?: ExamQuestionDto[];
}

export class ExamQuestionDto {
    @ApiProperty({ description: 'ID único de la pregunta en el examen' })
    id: string;

    @ApiProperty({ description: 'ID de la pregunta original del content-service' })
    questionId: string;

    @ApiProperty({ description: 'Orden de la pregunta en el examen' })
    order: number;

    @ApiProperty({ description: 'Puntos asignados a esta pregunta' })
    points: number;

    @ApiPropertyOptional({ description: 'Indica si la pregunta es obligatoria' })
    required?: boolean;

    @ApiPropertyOptional({ description: 'Datos de la pregunta desde content-service' })
    questionData?: Record<string, unknown>;
}
