import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { LoggerService } from '@brainrush-nx/shared';
import { envs } from '../config';
import {
  CreatePreguntaDto, PreguntaDto, UpdatePreguntaDto,
  CreateOpcionDto, OpcionDto, UpdateOpcionDto,
  CreateAreaDto, AreaDto, UpdateAreaDto,
  CreateTextoDto, TextoDto, UpdateTextoDto
} from './dto';

// Interfaz para respuestas de eliminación
interface DeleteResponse {
  id: string;
  message: string;
}

@Injectable()
export class ContentService {
  private readonly contentServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    // Usar envs directamente en lugar de ConfigService
    this.contentServiceUrl = envs.CONTENT_SERVICE_URL;
  }

  /**
   * Método genérico para realizar peticiones HTTP al content-service
   */
  private async makeRequest<T>(method: 'get' | 'post' | 'patch' | 'delete', endpoint: string, data?: unknown): Promise<T> {
    try {
      let request;

      switch (method) {
        case 'get':
          request = this.httpService.get<T>(`${this.contentServiceUrl}/${endpoint}`);
          break;
        case 'post':
          request = this.httpService.post<T>(`${this.contentServiceUrl}/${endpoint}`, data);
          break;
        case 'patch':
          request = this.httpService.patch<T>(`${this.contentServiceUrl}/${endpoint}`, data);
          break;
        case 'delete':
          request = this.httpService.delete<T>(`${this.contentServiceUrl}/${endpoint}`);
          break;
      }

      const response = await firstValueFrom<AxiosResponse<T>>(request);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('ContentGatewayService', `Error en petición ${method.toUpperCase()} a ${endpoint}: ${axiosError.message}`, axiosError.stack);

      // Rethrow the actual error response if available
      if (axiosError.response?.data) {
        throw new InternalServerErrorException(axiosError.response.data);
      }

      throw new InternalServerErrorException('Error al comunicarse con el servicio de contenido');
    }
  }

  // Métodos para áreas
  async getAllAreas(): Promise<AreaDto[]> {
    return this.makeRequest<AreaDto[]>('get', 'areas');
  }

  async getAreaById(id: string): Promise<AreaDto> {
    return this.makeRequest<AreaDto>('get', `areas/${id}`);
  }

  async createArea(createAreaDto: CreateAreaDto): Promise<AreaDto> {
    return this.makeRequest<AreaDto>('post', 'areas', createAreaDto);
  }

  async updateArea(id: string, updateAreaDto: UpdateAreaDto): Promise<AreaDto> {
    return this.makeRequest<AreaDto>('patch', `areas/${id}`, updateAreaDto);
  }

  async deleteArea(id: string): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>('delete', `areas/${id}`);
  }

  // Métodos para textos
  async getAllTextos(): Promise<TextoDto[]> {
    return this.makeRequest<TextoDto[]>('get', 'textos');
  }

  async getTextoById(id: string): Promise<TextoDto> {
    return this.makeRequest<TextoDto>('get', `textos/${id}`);
  }

  async createTexto(createTextoDto: CreateTextoDto): Promise<TextoDto> {
    return this.makeRequest<TextoDto>('post', 'textos', createTextoDto);
  }

  async updateTexto(id: string, updateTextoDto: UpdateTextoDto): Promise<TextoDto> {
    return this.makeRequest<TextoDto>('patch', `textos/${id}`, updateTextoDto);
  }

  async deleteTexto(id: string): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>('delete', `textos/${id}`);
  }

  // Métodos para preguntas
  async getAllPreguntas(textoId?: string, areaId?: string): Promise<PreguntaDto[]> {
    let endpoint = 'preguntas';

    // Añadir query params si están presentes
    const queryParams = [];
    if (textoId) queryParams.push(`textoId=${textoId}`);
    if (areaId) queryParams.push(`areaId=${areaId}`);

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

    return this.makeRequest<PreguntaDto[]>('get', endpoint);
  }

  async getPreguntaById(id: string): Promise<PreguntaDto> {
    return this.makeRequest<PreguntaDto>('get', `preguntas/${id}`);
  }

  async createPregunta(createPreguntaDto: CreatePreguntaDto): Promise<PreguntaDto> {
    return this.makeRequest<PreguntaDto>('post', 'preguntas', createPreguntaDto);
  }

  async updatePregunta(id: string, updatePreguntaDto: UpdatePreguntaDto): Promise<PreguntaDto> {
    return this.makeRequest<PreguntaDto>('patch', `preguntas/${id}`, updatePreguntaDto);
  }

  async deletePregunta(id: string): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>('delete', `preguntas/${id}`);
  }

  // Métodos para opciones
  async getAllOpciones(preguntaId?: string): Promise<OpcionDto[]> {
    let endpoint = 'opciones';

    if (preguntaId) {
      endpoint += `?preguntaId=${preguntaId}`;
    }

    return this.makeRequest<OpcionDto[]>('get', endpoint);
  }

  async getOpcionById(id: string): Promise<OpcionDto> {
    return this.makeRequest<OpcionDto>('get', `opciones/${id}`);
  }

  async createOpcion(createOpcionDto: CreateOpcionDto): Promise<OpcionDto> {
    return this.makeRequest<OpcionDto>('post', 'opciones', createOpcionDto);
  }

  async updateOpcion(id: string, updateOpcionDto: UpdateOpcionDto): Promise<OpcionDto> {
    return this.makeRequest<OpcionDto>('patch', `opciones/${id}`, updateOpcionDto);
  }

  async deleteOpcion(id: string): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>('delete', `opciones/${id}`);
  }
}
