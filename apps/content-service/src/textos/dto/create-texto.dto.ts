import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// Enum para los tipos de texto
enum TipoTexto {
    NARRATIVO = 'Narrativo',
    EXPOSITIVO = 'Expositivo',
    ARGUMENTATIVO = 'Argumentativo',
    DESCRIPTIVO = 'Descriptivo',
}

// Enum para el nivel de lectura
enum NivelLectura {
    BASICO = 'basico',
    MEDIO = 'medio',
    ALTO = 'alto',
}

// Enum para la dificultad léxica
enum DificultadLexica {
    BAJA = 'baja',
    MEDIA = 'media',
    ALTA = 'alta',
}

// Enum para el estado del texto
enum EstadoTexto {
    BORRADOR = 'borrador',
    REVISION = 'revision',
    PUBLICADO = 'publicado',
    INACTIVO = 'inactivo',
}

export class CreateTextoDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    id: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    fuente?: string;

    @IsNotEmpty()
    @IsString()
    contenido: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    tipoTexto?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    subtipo?: string;

    @IsOptional()
    @IsString()
    nivelLectura?: string;

    @IsOptional()
    @IsArray()
    palabrasClave?: string[];

    @IsOptional()
    @IsDateString()
    fechaCreacion?: string;

    @IsOptional()
    @IsNumber()
    contadorPalabras?: number;

    @IsOptional()
    @IsString()
    dificultadLexica?: string;

    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    imagen?: string;

    @IsOptional()
    @IsArray()
    taxonomiaBloomIds?: string[];
}
