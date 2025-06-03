import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';

export class ExamStatisticsDto {
  @ApiProperty({ description: 'ID del examen' })
  @IsString()
  @IsUUID()
  examId: string;

  @ApiProperty({ description: 'Número total de intentos' })
  @IsNumber()
  totalAttempts: number;

  @ApiProperty({ description: 'Número de intentos completados' })
  @IsNumber()
  completedAttempts: number;

  @ApiProperty({ description: 'Puntuación promedio' })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Porcentaje promedio' })
  @IsNumber()
  averagePercentage: number;

  @ApiProperty({ description: 'Tasa de aprobación (0-1)' })
  @IsNumber()
  passRate: number;

  @ApiProperty({ description: 'Puntuación más alta' })
  @IsNumber()
  highestScore: number;

  @ApiProperty({ description: 'Puntuación más baja' })
  @IsNumber()
  lowestScore: number;

  @ApiProperty({ description: 'Tiempo promedio de finalización en minutos' })
  @IsNumber()
  averageTimeMinutes: number;
}
