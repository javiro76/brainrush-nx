import { UserRole } from '@brainrush-nx/shared';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
