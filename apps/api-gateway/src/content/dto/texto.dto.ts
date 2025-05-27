/**
 * DTO para textos que se utilizarán en el API Gateway
 */

// Enumerados para textos
export enum TipoTexto {
    NARRATIVO = 'Narrativo',
    EXPOSITIVO = 'Expositivo',
    ARGUMENTATIVO = 'Argumentativo',
    DESCRIPTIVO = 'Descriptivo',
}

export enum NivelLectura {
    BASICO = 'basico',
    MEDIO = 'medio',
    ALTO = 'alto',
}

export enum DificultadLexica {
    BAJA = 'baja',
    MEDIA = 'media',
    ALTA = 'alta',
}

export enum EstadoTexto {
    BORRADOR = 'borrador',
    REVISION = 'revision',
    PUBLICADO = 'publicado',
    INACTIVO = 'inactivo',
}

export interface CreateTextoDto {
    id: string;
    fuente?: string;
    contenido: string;
    tipoTexto?: string;
    subtipo?: string;
    nivelLectura?: string;
    palabrasClave?: string[];
    fechaCreacion?: string;
    contadorPalabras?: number;
    dificultadLexica?: string;
    estado?: string;
    imagen?: string;
    taxonomiaBloomIds?: string[];
}

export interface UpdateTextoDto {
    fuente?: string;
    contenido?: string;
    tipoTexto?: string;
    subtipo?: string;
    nivelLectura?: string;
    palabrasClave?: string[];
    contadorPalabras?: number;
    dificultadLexica?: string;
    estado?: string;
    imagen?: string;
    taxonomiaBloomIds?: string[];
}

export interface TextoDto {
    id: string;
    fuente?: string;
    contenido: string;
    tipoTexto?: string;
    subtipo?: string;
    nivelLectura?: string;
    palabrasClave: string[];
    fechaCreacion: string;
    contadorPalabras?: number;
    dificultadLexica?: string;
    estado: string;
    imagen?: string;
    // Relaciones que pueden estar expandidas
    preguntas?: any[];
    taxonomiaBloom?: any[];
}
