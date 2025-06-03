import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsUUID, IsDate, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType, ExamStatus, DifficultyLevel } from '@prisma/exams-client';

export class CreateExamDto {
  @ApiProperty({ description: 'Título del examen', example: 'Simulacro ICFES Completo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descripción del examen', example: 'Examen completo de simulacro ICFES con preguntas de todas las áreas' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ExamType, description: 'Tipo de examen' })
  @IsEnum(ExamType)
  type: ExamType;

  @ApiPropertyOptional({ enum: ExamStatus, description: 'Estado del examen', default: ExamStatus.DRAFT })
  @IsEnum(ExamStatus)
  @IsOptional()
  status?: ExamStatus;

  @ApiProperty({ description: 'Tiempo límite en minutos', example: 180, minimum: 1 })
  @IsNumber()
  @Min(1)
  timeInMinutes: number;
  @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Dificultad del examen' })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Puntaje máximo del examen', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Puntaje mínimo para aprobar', minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Número máximo de intentos permitidos', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;
  @ApiPropertyOptional({ description: 'Instrucciones especiales para el examen' })
  @IsString()
  @IsOptional()
  instructions?: string;
  @ApiPropertyOptional({ description: 'ID del área principal del examen' })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiPropertyOptional({ description: 'Tiempo límite del examen en minutos' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Mostrar resultados al finalizar', default: true })
  @IsBoolean()
  @IsOptional()
  showResults?: boolean;

  @ApiPropertyOptional({ description: 'Mezclar preguntas', default: false })
  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Mezclar opciones de respuesta', default: false })
  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @ApiPropertyOptional({ description: 'IDs de preguntas específicas', type: [String] })
  @IsArray()
  @IsOptional()
  @IsUUID(4, { each: true })
  questionIds?: string[];

  @ApiProperty({
    description: 'Configuración de preguntas por área',
    example: [
      { areaId: 'area-1', questionCount: 30 },
      { areaId: 'area-2', questionCount: 25 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAreaConfigDto)
  areasConfig: ExamAreaConfigDto[];
}

export class ExamAreaConfigDto {
  @ApiProperty({ description: 'ID del área', example: 'area-1' })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiProperty({ description: 'Cantidad de preguntas para esta área', minimum: 1 })
  @IsNumber()
  @Min(1)
  questionCount: number;
}
