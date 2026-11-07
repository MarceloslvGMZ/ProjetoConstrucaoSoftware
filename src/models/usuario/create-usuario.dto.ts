import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { FuncaoUsuario } from './usuario.model';

/**
 * Dados de entrada do cenário Incluir Usuário (CU01).
 */
export class CreateUsuarioDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nome de autenticação (único)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  @ApiProperty({
    example: 'admin@forros.com',
    description: 'E-mail único do usuário',
  })
  @IsEmail({}, { message: 'E-mail em formato inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    description: 'Senha com no mínimo 6 caracteres',
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha!: string;

  @ApiProperty({
    enum: FuncaoUsuario,
    example: FuncaoUsuario.ADMINISTRADOR,
    description: 'Perfil de acesso do usuário',
  })
  @IsEnum(FuncaoUsuario, { message: 'Função inválida' })
  funcao!: FuncaoUsuario;
}
