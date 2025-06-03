import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsUUID, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamResponseDto {
  @ApiProperty({ description: 'ID de la pregunta' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @ApiProperty({ description: 'ID de la opción seleccionada' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  selectedOptionId: string;

  @ApiProperty({ description: 'Tiempo tomado para responder en segundos' })
  @IsString()
  @IsOptional()
  timeSpent?: string;
}

export class SubmitExamDto {
  @ApiProperty({ description: 'ID del intento de examen' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  attemptId: string;

  @ApiProperty({
    description: 'Respuestas del examen',
    type: [ExamResponseDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamResponseDto)
  responses: ExamResponseDto[];
  @ApiProperty({ description: 'Indica si el examen se envía por tiempo agotado' })
  @IsBoolean()
  @IsOptional()
  isTimeUp?: boolean;

  @ApiProperty({ description: 'Tiempo total gastado en el examen en segundos' })
  @IsNumber()
  @IsOptional()
  timeSpent?: number;
}
