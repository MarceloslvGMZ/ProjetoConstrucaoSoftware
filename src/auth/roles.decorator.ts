import { SetMetadata } from '@nestjs/common';
import { FuncaoUsuario } from '../models/usuario/usuario.model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: FuncaoUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);
