import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FuncaoUsuario } from '../models/usuario/usuario.model';
import { ROLES_KEY } from './roles.decorator';
import { UsuarioAutenticado } from './usuario-autenticado';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<FuncaoUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: UsuarioAutenticado;
    }>();
    const usuario = request.user;

    if (!usuario || !roles.includes(usuario.funcao as FuncaoUsuario)) {
      throw new ForbiddenException(
        'Perfil de acesso insuficiente para esta funcionalidade',
      );
    }

    return true;
  }
}
