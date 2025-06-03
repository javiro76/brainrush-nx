import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class StartExamDto {
  @ApiProperty({ description: 'ID del usuario que inicia el examen' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Configuración especial para este intento' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Dirección IP del usuario' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User Agent del navegador' })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
