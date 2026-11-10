import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { LoginResponseDto } from '../models/auth/login-response.dto';
import { LoginDto } from '../models/auth/login.dto';
import { AutenticacaoService } from '../services/autenticacao.service';

/**
 * Camada de apresentação HTTP do CU02 – Autenticar Usuário.
 */
@ApiTags('autenticacao')
@Controller('auth')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Valida E-mail e Senha. Após 5 tentativas incorretas consecutivas, bloqueia temporariamente o acesso.',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description: 'E-mail ou Senha inválidos (ou usuário Inativo)',
  })
  @ApiForbiddenResponse({
    description: 'Acesso bloqueado temporariamente por segurança',
  })
  autenticar(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.autenticacaoService.autenticar(dto);
  }
}
