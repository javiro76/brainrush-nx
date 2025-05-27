/**
 * DTO para preguntas que se utilizarán en el API Gateway
 * Estos DTOs son una versión ligeramente simplificada de los usados
 * directamente en el content-service
 */

import { OpcionDto } from './opcion.dto';

// Interfaces para tipos enumerados
export enum Complejidad {
  BASICO = 'básico',
  MEDIO = 'medio',
  AVANZADO = 'avanzado',
}

export interface CreatePreguntaDto {
  id?: string;
  areaId: string;
  textoId?: string;
  complejidad: string;
  enunciado: string;
  justificacion: string;
  afirmacionId?: string;
  habilidadId?: string;
  taxonomiaBloom?: string;
  fechaCreacion?: string;
  activo?: boolean;
  opciones?: OpcionDto[];
}

export interface UpdatePreguntaDto {
  areaId?: string;
  textoId?: string;
  complejidad?: string;
  enunciado?: string;
  justificacion?: string;
  afirmacionId?: string;
  habilidadId?: string;
  taxonomiaBloom?: string;
  fechaCreacion?: string;
  activo?: boolean;
  opciones?: OpcionDto[];
}

export interface PreguntaDto {
  id: string;
  areaId: string;
  textoId?: string;
  complejidad: string;
  enunciado: string;
  justificacion: string;
  afirmacionId?: string;
  habilidadId?: string;
  taxonomiaBloom?: string;
  fechaCreacion: string;
  activo: boolean;
  opciones: OpcionDto[];
  // Relaciones expandidas que pueden ser incluidas en la respuesta
  area?: any;
  texto?: any;
  afirmacion?: any;
}
