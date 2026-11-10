import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_BLOQUEIO_MINUTOS,
  AUTH_JWT_EXPIRA_LEMBRAR,
  AUTH_JWT_EXPIRA_PADRAO,
  AUTH_MAX_TENTATIVAS,
  MSG_ACESSO_BLOQUEADO,
  MSG_CREDENCIAIS_INVALIDAS,
} from '../auth/auth.constants';
import { LoginResponseDto } from '../models/auth/login-response.dto';
import { LoginDto } from '../models/auth/login.dto';
import { SituacaoUsuario, Usuario } from '../models/usuario/usuario.model';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { UsuarioService } from './usuario.service';

export type JwtPayload = {
  sub: string;
  email: string;
  funcao: string;
  nome: string;
};

/**
 * Camada de negócio do CU02 – Autenticar Usuário.
 */
@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async autenticar(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.usuarioRepository.findByEmail(email);

    if (usuario) {
      await this.tratarBloqueioTemporario(usuario);
    }

    const credenciaisValidas =
      !!usuario &&
      usuario.situacao === SituacaoUsuario.ATIVO &&
      this.usuarioService.verificarSenha(dto.senha, usuario.senhaHash);

    if (!credenciaisValidas) {
      if (usuario) {
        await this.registrarTentativaIncorreta(usuario);
      }
      throw new UnauthorizedException(MSG_CREDENCIAIS_INVALIDAS);
    }

    usuario.tentativasIncorretas = 0;
    usuario.bloqueadoAte = null;
    usuario.atualizadoEm = new Date();
    await this.usuarioRepository.update(usuario);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: usuario.id,
        email: usuario.email,
        funcao: usuario.funcao,
        nome: usuario.nome,
      } satisfies JwtPayload,
      {
        expiresIn: dto.lembrarAcesso
          ? AUTH_JWT_EXPIRA_LEMBRAR
          : AUTH_JWT_EXPIRA_PADRAO,
      },
    );

    return {
      accessToken,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      funcao: usuario.funcao,
      situacao: usuario.situacao,
    };
  }

  /**
   * Fluxo Alternativo 1 / Exceção E3 – bloqueio temporário.
   */
  private async tratarBloqueioTemporario(usuario: Usuario): Promise<void> {
    if (!usuario.bloqueadoAte) {
      return;
    }

    const agora = new Date();
    if (usuario.bloqueadoAte.getTime() > agora.getTime()) {
      // E3: não valida credenciais enquanto o bloqueio estiver ativo
      throw new ForbiddenException(MSG_ACESSO_BLOQUEADO);
    }

    // Alternativo 1: bloqueio expirado — remove e zera contador
    usuario.bloqueadoAte = null;
    usuario.tentativasIncorretas = 0;
    usuario.atualizadoEm = agora;
    await this.usuarioRepository.update(usuario);
  }

  /**
   * Exceção E2 + Cenário 2 – registra tentativa e bloqueia na 5ª.
   */
  private async registrarTentativaIncorreta(usuario: Usuario): Promise<void> {
    usuario.tentativasIncorretas += 1;
    usuario.atualizadoEm = new Date();

    if (usuario.tentativasIncorretas >= AUTH_MAX_TENTATIVAS) {
      const bloqueadoAte = new Date();
      bloqueadoAte.setMinutes(
        bloqueadoAte.getMinutes() + AUTH_BLOQUEIO_MINUTOS,
      );
      usuario.bloqueadoAte = bloqueadoAte;
      await this.usuarioRepository.update(usuario);
      throw new ForbiddenException(MSG_ACESSO_BLOQUEADO);
    }

    await this.usuarioRepository.update(usuario);
  }
}
