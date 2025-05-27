/**
 * DTO para opciones que se utilizarán en el API Gateway
 */

export interface CreateOpcionDto {
    id?: string;
    preguntaId: string;
    textoOpcion: string;
    esCorrecta?: boolean;
    retroalimentacion?: string;
    orden?: number;
}

export interface UpdateOpcionDto {
    textoOpcion?: string;
    esCorrecta?: boolean;
    retroalimentacion?: string;
    orden?: number;
}

export interface OpcionDto {
    id: string;
    preguntaId: string;
    textoOpcion: string;
    esCorrecta: boolean;
    retroalimentacion?: string;
    orden: number;
    // Relaciones expandidas que pueden ser incluidas en la respuesta
    pregunta?: any;
}
