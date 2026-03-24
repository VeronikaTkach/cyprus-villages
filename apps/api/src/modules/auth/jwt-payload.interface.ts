import { UserRole } from '@prisma/client';

export interface IJwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
