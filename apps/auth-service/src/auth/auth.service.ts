import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { NATS_SERVICE } from '../nats/nats.module';

// Definir interfaces para los datos de respuesta
interface UserCreatedResponse {
  id: string;
  email: string;
  name: string;
  // otros campos que devuelva el users-service
}

export interface AuthResponse {
  message: string;
  user?: UserCreatedResponse;
  error?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    // Aquí iría la lógica de autenticación (registro)
    
    // Ejemplo: Crear usuario en users-service después del registro
    // Esto envía un mensaje a users-service a través de NATS
    try {
      const userCreated = await firstValueFrom<UserCreatedResponse>(
        this.client.send<UserCreatedResponse>('createUser', {
          email: createAuthDto.email,
          name: createAuthDto.name,
          // otros campos necesarios
        })
      );
      
      return {
        message: 'Usuario registrado correctamente',
        user: userCreated
      };
    } catch (error: unknown) {
      // Manejar error de forma segura con verificación de tipo
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido';
      
      return {
        message: 'Error al registrar usuario',
        error: errorMessage
      };
    }
  }

  findAll(): string {
    return `This action returns all auth`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto): string {
    return `This action updates a #${id} auth`;
  }

  remove(id: number): string {
    return `This action removes a #${id} auth`;
  }
}
