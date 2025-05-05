import { UserRole } from '@brainrush-nx/shared';

export interface AuthResponse {
  token: string;
  refreshToken: string; // Añadido el refresh token
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
