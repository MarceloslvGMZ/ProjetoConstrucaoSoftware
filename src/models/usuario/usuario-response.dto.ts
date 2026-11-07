import { ApiProperty } from '@nestjs/swagger';
import { FuncaoUsuario, SituacaoUsuario, Usuario } from './usuario.model';

/**
 * Representação segura do usuário para a API (sem senha).
 */
export class UsuarioResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'admin' })
  nome!: string;

  @ApiProperty({ example: 'admin@forros.com' })
  email!: string;

  @ApiProperty({ enum: FuncaoUsuario, example: FuncaoUsuario.ADMINISTRADOR })
  funcao!: FuncaoUsuario;

  @ApiProperty({ enum: SituacaoUsuario, example: SituacaoUsuario.ATIVO })
  situacao!: SituacaoUsuario;

  @ApiProperty()
  criadoEm!: Date;

  @ApiProperty()
  atualizadoEm!: Date;

  static fromModel(usuario: Usuario): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = usuario.id;
    dto.nome = usuario.nome;
    dto.email = usuario.email;
    dto.funcao = usuario.funcao;
    dto.situacao = usuario.situacao;
    dto.criadoEm = usuario.criadoEm;
    dto.atualizadoEm = usuario.atualizadoEm;
    return dto;
  }
}
