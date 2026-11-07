import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUsuarioDto } from '../models/usuario/create-usuario.dto';
import { UpdateUsuarioDto } from '../models/usuario/update-usuario.dto';
import { UsuarioResponseDto } from '../models/usuario/usuario-response.dto';
import { UsuarioService } from '../services/usuario.service';

/**
 * Camada de apresentação HTTP do CU01 – Manter Usuário.
 */
@ApiTags('usuarios')
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
