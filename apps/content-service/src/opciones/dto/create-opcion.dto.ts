import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpcionDto {
    @ApiPropertyOptional({ description: 'Identificador único de la opción', example: 'OPC001' })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({
        description: 'ID de la pregunta a la que pertenece esta opción',
        example: 'PREG001'
    })
    @IsNotEmpty()
    @IsString()
    preguntaId: string;

    @ApiProperty({
        description: 'Texto de la opción de respuesta',
        maxLength: 1000,
        example: 'x = 5'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    textoOpcion: string;

    @ApiPropertyOptional({
        description: 'Indica si esta opción es la respuesta correcta',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    esCorrecta?: boolean;

    @ApiPropertyOptional({
        description: 'Retroalimentación específica para esta opción',
        maxLength: 1000,
        example: 'Esta es la respuesta correcta porque...'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    retroalimentacion?: string;

    @ApiPropertyOptional({
        description: 'Orden de presentación de la opción',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    orden?: number;
}
