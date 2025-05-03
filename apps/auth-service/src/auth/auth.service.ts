import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createAuthDto.email }
      });

      if (existingUser) {
        throw new ConflictException(`User with email ${createAuthDto.email} already exists`);
      }

      // Crear el nuevo usuario
      const newUser = await this.prisma.user.create({
        data: createAuthDto
      });

      this.logger.log(`User created: ${newUser.email}`);

      // Retorna el usuario sin la contraseña
      const { password, ...result } = newUser;

      return {
        statusCode: 201,
        message: 'User created successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: users
      };
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return {
        statusCode: 200,
        message: 'User retrieved successfully',
        data: user
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Actualizar el usuario
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateAuthDto,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        statusCode: 200,
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Eliminar el usuario
      await this.prisma.user.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        message: 'User deleted successfully',
        data: { id }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }
}
