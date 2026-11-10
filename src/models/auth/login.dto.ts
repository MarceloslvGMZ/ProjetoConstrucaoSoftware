import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Dados de entrada do CU02 – Autenticar Usuário.
 */
export class LoginDto {
  @ApiProperty({
    example: 'admin@forros.com',
    description: 'E-mail do usuário cadastrado',
  })
  @IsEmail({}, { message: 'E-mail em formato inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha!: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Quando true, mantém o acesso lembrado neste dispositivo (token com validade maior)',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Lembrar acesso deve ser verdadeiro ou falso' })
  lembrarAcesso?: boolean;
}
