import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { envs } from '../config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Configura la URL desde variables de entorno
    this.authServiceUrl  = `http://${envs.authServiceHost}:${envs.authServicePort}`;
  }

  async create(createAuthDto: CreateAuthDto) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/users`, createAuthDto)
    );
    return data;
  }

  async findAll() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/users`)
    );
    return data;
  }

  async findOne(id: number) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/users/${id}`)
    );
    return data;
  }


  async update(id: number, updateAuthDto: UpdateAuthDto) {
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.authServiceUrl}/users/${id}`, updateAuthDto)
    );
    return data;
  }

  async remove(id: number) {
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.authServiceUrl}/users/${id}`)
    );
    return data;
  }
}
