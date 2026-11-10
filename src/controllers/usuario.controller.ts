import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUsuarioDto } from '../models/usuario/create-usuario.dto';
import { UpdateUsuarioDto } from '../models/usuario/update-usuario.dto';
import { FuncaoUsuario } from '../models/usuario/usuario.model';
import { UsuarioResponseDto } from '../models/usuario/usuario-response.dto';
import { UsuarioService } from '../services/usuario.service';

/**
 * Camada de apresentação HTTP do CU01 – Manter Usuário.
 * Funcionalidades restritas ao perfil Administrador (CU02 – R4).
 */
@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(FuncaoUsuario.ADMINISTRADOR)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Incluir usuário' })
  @ApiCreatedResponse({ type: UsuarioResponseDto })
  criar(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar usuários' })
  @ApiQuery({
    name: 'filtro',
    required: false,
    description: 'Busca por nome ou função',
  })
  @ApiOkResponse({
    description: 'Listagem com total e usuários',
  })
  listar(@Query('filtro') filtro?: string) {
    return this.usuarioService.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  buscarPorId(@Param('id') id: string) {
    return this.usuarioService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Alterar ou inativar usuário',
    description:
      'Atualiza dados do usuário. Situação Inativo realiza soft delete.',
  })
  @ApiOkResponse({ type: UsuarioResponseDto })
  atualizar(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.atualizar(id, dto);
  }
}
