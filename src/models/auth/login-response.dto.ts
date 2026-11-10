import { ApiProperty } from '@nestjs/swagger';
import { FuncaoUsuario, SituacaoUsuario } from '../usuario/usuario.model';

/**
 * Resposta de autenticação bem-sucedida (CU02).
 */
export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autorizar as próximas requisições',
  })
  accessToken!: string;

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
}
