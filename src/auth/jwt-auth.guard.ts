import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SituacaoUsuario } from '../models/usuario/usuario.model';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { JwtPayload } from '../services/autenticacao.service';
import { AUTH_JWT_SECRET } from './auth.constants';
import { UsuarioAutenticado } from './usuario-autenticado';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: UsuarioAutenticado;
    }>();

    const token = this.extrairToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Token de autenticação ausente');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: AUTH_JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido');
    }

    const usuario = await this.usuarioRepository.findById(payload.sub);
    if (!usuario || usuario.situacao !== SituacaoUsuario.ATIVO) {
      throw new UnauthorizedException('Sessão inválida');
    }

    request.user = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      funcao: usuario.funcao,
    };

    return true;
  }

  private extrairToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }
    const [tipo, token] = authorization.split(' ');
    if (tipo !== 'Bearer' || !token) {
      return null;
    }
    return token;
  }
}
