import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { CreateUsuarioDto } from '../models/usuario/create-usuario.dto';
import { UpdateUsuarioDto } from '../models/usuario/update-usuario.dto';
import { UsuarioResponseDto } from '../models/usuario/usuario-response.dto';
import {
  FuncaoUsuario,
  SituacaoUsuario,
  Usuario,
} from '../models/usuario/usuario.model';
import { UsuarioRepository } from '../repositories/usuario.repository';

/**
 * Camada de negócio do CU01 – Manter Usuário.
 */
@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async criar(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    await this.garantirEmailUnico(dto.email);
    await this.garantirNomeUnico(dto.nome);

    const agora = new Date();
    const usuario = new Usuario({
      id: randomUUID(),
      nome: dto.nome.trim(),
      email: dto.email.trim().toLowerCase(),
      senhaHash: this.hashSenha(dto.senha),
      funcao: dto.funcao,
      situacao: SituacaoUsuario.ATIVO,
      criadoEm: agora,
      atualizadoEm: agora,
    });

    const criado = await this.usuarioRepository.create(usuario);
    return UsuarioResponseDto.fromModel(criado);
  }

  async listar(filtro?: string): Promise<{
    total: number;
    usuarios: UsuarioResponseDto[];
  }> {
    const usuarios = await this.usuarioRepository.search(filtro);
    return {
      total: usuarios.length,
      usuarios: usuarios.map((usuario) =>
        UsuarioResponseDto.fromModel(usuario),
      ),
    };
  }

  async buscarPorId(id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.obterOuFalhar(id);
    return UsuarioResponseDto.fromModel(usuario);
  }

  async atualizar(
    id: string,
    dto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.obterOuFalhar(id);

    await this.garantirNomeUnico(dto.nome, id);

    if (
      dto.situacao === SituacaoUsuario.INATIVO &&
      usuario.situacao === SituacaoUsuario.ATIVO
    ) {
      await this.validarInativacao(usuario);
    }

    usuario.nome = dto.nome.trim();
    usuario.funcao = dto.funcao;
    usuario.situacao = dto.situacao;

    if (dto.novaSenha?.trim()) {
      usuario.senhaHash = this.hashSenha(dto.novaSenha);
    }

    usuario.atualizadoEm = new Date();
    const atualizado = await this.usuarioRepository.update(usuario);
    return UsuarioResponseDto.fromModel(atualizado);
  }

  private async obterOuFalhar(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  private async garantirEmailUnico(email: string): Promise<void> {
    const existente = await this.usuarioRepository.findByEmail(email);
    if (existente) {
      throw new ConflictException({
        campo: 'email',
        motivo: 'E-mail já cadastrado',
      });
    }
  }

  private async garantirNomeUnico(
    nome: string,
    ignorarId?: string,
  ): Promise<void> {
    const existente = await this.usuarioRepository.findByNome(nome);
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException({
        campo: 'nome',
        motivo: 'Nome já cadastrado',
      });
    }
  }

  private async validarInativacao(usuario: Usuario): Promise<void> {
    if (usuario.funcao !== FuncaoUsuario.ADMINISTRADOR) {
      return;
    }

    const usuarios = await this.usuarioRepository.findAll();
    const adminsAtivos = usuarios.filter(
      (item) =>
        item.funcao === FuncaoUsuario.ADMINISTRADOR &&
        item.situacao === SituacaoUsuario.ATIVO,
    );

    if (adminsAtivos.length <= 1) {
      throw new BadRequestException({
        campo: 'situacao',
        motivo: 'Não é permitido inativar o último Administrador ativo',
      });
    }
  }

  private hashSenha(senha: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(senha, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verificarSenha(senha: string, senhaHash: string): boolean {
    const [salt, hashArmazenado] = senhaHash.split(':');
    if (!salt || !hashArmazenado) {
      throw new BadRequestException('Hash de senha inválido');
    }
    const hashInformado = scryptSync(senha, salt, 64);
    const hashBuffer = Buffer.from(hashArmazenado, 'hex');
    return timingSafeEqual(hashInformado, hashBuffer);
  }
}
