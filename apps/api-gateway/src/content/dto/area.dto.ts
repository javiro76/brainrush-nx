/**
 * DTO para áreas que se utilizarán en el API Gateway
 */

export interface CreateAreaDto {
    id: string;
    nombre: string;
    descripcion: string;
}

export interface UpdateAreaDto {
    nombre?: string;
    descripcion?: string;
}

export interface AreaDto {
    id: string;
    nombre: string;
    descripcion: string;
    // Relaciones que pueden estar expandidas
    competencias?: any[];
    preguntas?: any[];
}
