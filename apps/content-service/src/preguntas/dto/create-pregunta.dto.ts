import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enum para la complejidad de la pregunta
enum Complejidad {
    BASICO = 'básico',
    MEDIO = 'medio',
    AVANZADO = 'avanzado',
}

export class CreatePreguntaDto {
    @ApiProperty({ description: 'Identificador único de la pregunta', example: 'PREG001' })
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    id: string;

    @ApiProperty({ description: 'ID del área a la que pertenece la pregunta', example: 'MATC' })
    @IsNotEmpty()
    @IsString()
    areaId: string;

    @ApiPropertyOptional({ description: 'ID del texto asociado a la pregunta (opcional)', example: 'TEXT001' })
    @IsOptional()
    @IsString()
    textoId?: string;

    @ApiProperty({
        description: 'Nivel de complejidad de la pregunta',
        example: 'medio',
        enum: ['básico', 'medio', 'avanzado']
    })
    @IsNotEmpty()
    @IsString()
    complejidad: string;

    @ApiProperty({
        description: 'Enunciado completo de la pregunta',
        example: '¿Cuál es la solución de la ecuación 2x + 5 = 15?'
    })
    @IsNotEmpty()
    @IsString()
    enunciado: string;

    @ApiProperty({
        description: 'Justificación de la respuesta correcta',
        example: 'Para resolver esta ecuación, se despeja x: 2x = 10, por lo tanto x = 5'
    })
    @IsNotEmpty()
    @IsString()
    justificacion: string;

    @ApiPropertyOptional({ description: 'ID de la afirmación asociada', example: 'AFIR01' })
    @IsOptional()
    @IsString()
    afirmacionId?: string;

    @ApiPropertyOptional({ description: 'ID de la habilidad evaluada', example: 'HAB01' })
    @IsOptional()
    @IsString()
    habilidadId?: string;

    @ApiPropertyOptional({
        description: 'Clasificación según taxonomía de Bloom',
        example: 'APLICACION'
    })
    @IsOptional()
    @IsString()
    taxonomiaBloom?: string;

    @ApiPropertyOptional({
        description: 'Fecha de creación de la pregunta',
        example: '2023-05-23T10:00:00Z'
    })
    @IsOptional()
    @IsDateString()
    fechaCreacion?: string;

    @ApiPropertyOptional({
        description: 'Estado de la pregunta (activa/inactiva)',
        default: true
    })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @ApiPropertyOptional({
        description: 'Lista de opciones de la pregunta',
        type: 'array',
        isArray: true
    })
    @IsOptional()
    @IsArray()
    opciones?: { textoOpcion: string; esCorrecta: boolean; retroalimentacion?: string; orden?: number }[];
}
