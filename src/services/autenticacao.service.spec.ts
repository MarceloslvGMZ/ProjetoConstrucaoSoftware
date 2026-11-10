import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AUTH_MAX_TENTATIVAS,
  MSG_ACESSO_BLOQUEADO,
  MSG_CREDENCIAIS_INVALIDAS,
} from '../auth/auth.constants';
import {
  FuncaoUsuario,
  SituacaoUsuario,
  Usuario,
} from '../models/usuario/usuario.model';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { AutenticacaoService } from './autenticacao.service';
import { UsuarioService } from './usuario.service';

describe('AutenticacaoService (CU02)', () => {
  let service: AutenticacaoService;
  let usuarioRepository: UsuarioRepository;
  let usuarioService: UsuarioService;

  const criarUsuario = (overrides?: Partial<Usuario>): Usuario => {
    const agora = new Date();
    return new Usuario({
      id: 'user-1',
      nome: 'admin',
      email: 'admin@forros.com',
      senhaHash: 'salt:hash',
      funcao: FuncaoUsuario.ADMINISTRADOR,
      situacao: SituacaoUsuario.ATIVO,
      tentativasIncorretas: 0,
      bloqueadoAte: null,
      criadoEm: agora,
      atualizadoEm: agora,
      ...overrides,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoService,
        {
          provide: UsuarioRepository,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn((u: Usuario) => Promise.resolve(u)),
          },
        },
        {
          provide: UsuarioService,
          useValue: {
            verificarSenha: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => Promise.resolve('token-jwt')),
          },
        },
      ],
    }).compile();

    service = module.get(AutenticacaoService);
    usuarioRepository = module.get(UsuarioRepository);
    usuarioService = module.get(UsuarioService);
  });

  it('autentica com credenciais válidas e zera tentativas', async () => {
    const usuario = criarUsuario({ tentativasIncorretas: 3 });
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    jest.spyOn(usuarioService, 'verificarSenha').mockReturnValue(true);

    const resultado = await service.autenticar({
      email: 'admin@forros.com',
      senha: '123456',
    });

    expect(resultado.accessToken).toBe('token-jwt');
    expect(resultado.funcao).toBe(FuncaoUsuario.ADMINISTRADOR);
    expect(usuario.tentativasIncorretas).toBe(0);
    expect(usuario.bloqueadoAte).toBeNull();
  });

  it('retorna mensagem genérica para credenciais inválidas', async () => {
    const usuario = criarUsuario();
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    jest.spyOn(usuarioService, 'verificarSenha').mockReturnValue(false);

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: 'errada' }),
    ).rejects.toThrow(MSG_CREDENCIAIS_INVALIDAS);

    expect(usuario.tentativasIncorretas).toBe(2);
  });

  it('bloqueia após 5 tentativas incorretas consecutivas', async () => {
    const usuario = criarUsuario({
      tentativasIncorretas: AUTH_MAX_TENTATIVAS - 1,
    });
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    jest.spyOn(usuarioService, 'verificarSenha').mockReturnValue(false);

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: 'errada' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: 'errada' }),
    ).rejects.toThrow(MSG_ACESSO_BLOQUEADO);

    expect(usuario.bloqueadoAte).toBeInstanceOf(Date);
    expect(usuario.tentativasIncorretas).toBe(AUTH_MAX_TENTATIVAS);
  });

  it('não valida credenciais enquanto o acesso está bloqueado', async () => {
    const bloqueadoAte = new Date();
    bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() + 10);
    const usuario = criarUsuario({
      tentativasIncorretas: 5,
      bloqueadoAte,
    });
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    const verificarSenha = jest.spyOn(usuarioService, 'verificarSenha');

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: '123456' }),
    ).rejects.toThrow(MSG_ACESSO_BLOQUEADO);

    expect(verificarSenha).not.toHaveBeenCalled();
  });

  it('remove bloqueio expirado e permite autenticar', async () => {
    const bloqueadoAte = new Date();
    bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() - 1);
    const usuario = criarUsuario({
      tentativasIncorretas: 5,
      bloqueadoAte,
    });
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    jest.spyOn(usuarioService, 'verificarSenha').mockReturnValue(true);

    const resultado = await service.autenticar({
      email: 'admin@forros.com',
      senha: '123456',
    });

    expect(resultado.accessToken).toBe('token-jwt');
    expect(usuario.tentativasIncorretas).toBe(0);
    expect(usuario.bloqueadoAte).toBeNull();
  });

  it('trata usuário Inativo como credencial inválida', async () => {
    const usuario = criarUsuario({ situacao: SituacaoUsuario.INATIVO });
    jest.spyOn(usuarioRepository, 'findByEmail').mockResolvedValue(usuario);
    jest.spyOn(usuarioService, 'verificarSenha').mockReturnValue(true);

    await expect(
      service.autenticar({ email: 'admin@forros.com', senha: '123456' }),
    ).rejects.toThrow(MSG_CREDENCIAIS_INVALIDAS);
  });
});
