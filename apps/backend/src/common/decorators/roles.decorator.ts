import { SetMetadata } from '@nestjs/common';
import type { KullaniciRol } from '@sinav/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: KullaniciRol[]) =>
  SetMetadata(ROLES_KEY, roles);
