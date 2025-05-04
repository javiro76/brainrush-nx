import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { envs } from '../config';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../common/logger.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;
  private readonly context = 'AuthService';

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService
  ) {
    // Configura la URL desde variables de entorno
    this.authServiceUrl = `http://${envs.authServiceHost}:${envs.authServicePort}`;
    this.logger.log(this.context, `Servicio inicializado con URL: ${this.authServiceUrl}`);
  }

  async create(createAuthDto: CreateAuthDto) {
    this.logger.log(this.context, `Creando nuevo usuario: ${createAuthDto.email}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/users`, createAuthDto)
          .pipe(
            catchError(error => {
              this.logger.error(this.context, `Error al crear usuario: ${error.message}`, error.stack);
              return throwError(() => error);
            })
          )
      );

      this.logger.log(this.context, `Usuario creado con éxito: ${createAuthDto.email}`);
      return data;
    } catch (error) {
      this.logger.error(this.context, `Error no controlado al crear usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    this.logger.log(this.context, 'Obteniendo todos los usuarios');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/users`)
          .pipe(
            catchError(error => {
              this.logger.error(this.context, `Error al obtener usuarios: ${error.message}`, error.stack);
              return throwError(() => error);
            })
          )
      );

      this.logger.log(this.context, `${data?.data?.length || 0} usuarios encontrados`);
      return data;
    } catch (error) {
      this.logger.error(this.context, `Error no controlado al obtener usuarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(this.context, `Buscando usuario con ID: ${id}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/users/${id}`)
          .pipe(
            catchError(error => {
              this.logger.error(this.context, `Error al buscar usuario ${id}: ${error.message}`, error.stack);
              return throwError(() => error);
            })
          )
      );

      this.logger.log(this.context, `Usuario encontrado: ${id}`);
      return data;
    } catch (error) {
      this.logger.error(this.context, `Error no controlado al buscar usuario ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    this.logger.log(this.context, `Actualizando usuario ${id}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/users/${id}`, updateAuthDto)
          .pipe(
            catchError(error => {
              this.logger.error(this.context, `Error al actualizar usuario ${id}: ${error.message}`, error.stack);
              return throwError(() => error);
            })
          )
      );

      this.logger.log(this.context, `Usuario ${id} actualizado con éxito`);
      return data;
    } catch (error) {
      this.logger.error(this.context, `Error no controlado al actualizar usuario ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(this.context, `Eliminando usuario ${id}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/users/${id}`)
          .pipe(
            catchError(error => {
              this.logger.error(this.context, `Error al eliminar usuario ${id}: ${error.message}`, error.stack);
              return throwError(() => error);
            })
          )
      );

      this.logger.log(this.context, `Usuario ${id} eliminado con éxito`);
      return data;
    } catch (error) {
      this.logger.error(this.context, `Error no controlado al eliminar usuario ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
