import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@brainrush-nx/shared';

export class UserResponseDto {
    @ApiProperty({ description: 'ID único del usuario' })
    id: string;

    @ApiProperty({ description: 'Email del usuario' })
    email: string;

    @ApiProperty({ description: 'Nombre del usuario' })
    name: string;

    @ApiProperty({ enum: UserRole, description: 'Rol del usuario en el sistema' })
    role: UserRole;
}

export class AuthResponseDto {
    @ApiProperty({ description: 'Token JWT de acceso' })
    token: string;

    @ApiProperty({ description: 'Token de renovación' })
    refreshToken: string;

    @ApiProperty({ type: UserResponseDto, description: 'Información del usuario autenticado' })
    user: UserResponseDto;
}
