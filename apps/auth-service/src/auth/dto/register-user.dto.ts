import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@brainrush-nx/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class RegisterUserDto {

  @ApiProperty({
    description: 'Email único del usuario',
    example: 'estudiante@ejemplo.com',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;


  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'María José García',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  name: string;


  @ApiProperty({
    description: 'Contraseña segura del usuario',
    example: 'MiClaveSegura123!',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;


  @ApiPropertyOptional({
    description: 'Rol del usuario en BrainRush',
    enum: UserRole,
    example: UserRole.STUDENT,
    default: UserRole.STUDENT
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
