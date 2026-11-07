import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { FuncaoUsuario, SituacaoUsuario } from './usuario.model';

/**
 * Dados de entrada dos cenários Alterar / Inativar Usuário (CU01).
 * Nova senha é opcional: omita o campo para manter a senha atual.
 */
export class UpdateUsuarioDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nome de autenticação (único)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  @ApiPropertyOptional({
    example: '654321',
    minLength: 6,
    description: 'Nova senha (opcional). Se omitida, mantém a atual.',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  novaSenha?: string;

  @ApiProperty({
    enum: FuncaoUsuario,
    example: FuncaoUsuario.VENDAS,
    description: 'Perfil de acesso do usuário',
  })
  @IsEnum(FuncaoUsuario, { message: 'Função inválida' })
  funcao!: FuncaoUsuario;

  @ApiProperty({
    enum: SituacaoUsuario,
    example: SituacaoUsuario.ATIVO,
    description: 'Ativo ou Inativo (soft delete)',
  })
  @IsEnum(SituacaoUsuario, { message: 'Situação inválida' })
  situacao!: SituacaoUsuario;
}
