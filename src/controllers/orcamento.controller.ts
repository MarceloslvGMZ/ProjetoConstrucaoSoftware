import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { UsuarioAutenticado } from '../auth/usuario-autenticado';
import { CreateOrcamentoDto } from '../models/orcamento/create-orcamento.dto';
import { OrcamentoFiltroDto } from '../models/orcamento/orcamento-filtro.dto';
import { OrcamentoResponseDto } from '../models/orcamento/orcamento-response.dto';
import { UpdateOrcamentoDto } from '../models/orcamento/update-orcamento.dto';
import { OrcamentoService } from '../services/orcamento.service';

/**
 * Camada de apresentação HTTP do Caso de Uso 06 – Emitir Orçamento.
 */
@ApiTags('orcamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orcamentos')
export class OrcamentoController {
  constructor(private readonly orcamentoService: OrcamentoService) { }

  @Post()
  @ApiOperation({
    summary: 'Concretizar e cadastrar orçamento',
    description:
      'Cria um novo orçamento a partir do cálculo de materiais do CU05 e dados do cliente.',
  })
  @ApiCreatedResponse({ type: OrcamentoResponseDto })
  criar(
    @Body() dto: CreateOrcamentoDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.orcamentoService.criar(dto, usuario);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar orçamentos com filtros',
    description:
      'Permite buscar orçamentos por número, nome do cliente, situação e período.',
  })
  @ApiOkResponse({
    description: 'Listagem de orçamentos com total e itens',
  })
  listar(@Query() filtros: OrcamentoFiltroDto) {
    return this.orcamentoService.listar(filtros);
  }

  @Get('aprovados-para-agendamento')
  @ApiOperation({
    summary: 'Listar orçamentos aprovados disponíveis para agendamento',
    description:
      'Utilizado pelo Caso de Uso 07 (Manter Agenda) para carregar orçamentos aptos a agendamento.',
  })
  @ApiOkResponse({ type: [OrcamentoResponseDto] })
  listarAprovadosParaAgendamento() {
    return this.orcamentoService.listarAprovadosParaAgendamento();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  buscarPorId(@Param('id') id: string) {
    return this.orcamentoService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Alterar orçamento',
    description:
      'Atualiza dados do cliente, mão de obra, desconto ou validade. Permitido apenas antes da aprovação e sem agendamento.',
  })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateOrcamentoDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.orcamentoService.atualizar(id, dto, usuario);
  }

  @Post(':id/emitir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emitir orçamento formalmente',
    description: 'Transiciona orçamento da situação Rascunho para Emitido.',
  })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  emitir(@Param('id') id: string, @CurrentUser() usuario: UsuarioAutenticado) {
    return this.orcamentoService.emitir(id, usuario);
  }

  @Post(':id/aprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar aprovação do orçamento pelo cliente',
    description:
      'Altera a situação para Aprovado, habilitando o orçamento para agendamento no CU07.',
  })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  aprovar(@Param('id') id: string, @CurrentUser() usuario: UsuarioAutenticado) {
    return this.orcamentoService.aprovar(id, usuario);
  }

  @Post(':id/reprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar reprovação do orçamento pelo cliente',
  })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  reprovar(
    @Param('id') id: string,
    @Body('motivo') motivo: string | undefined,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.orcamentoService.reprovar(id, motivo, usuario);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar orçamento emitido',
    description:
      'Orçamentos emitidos não podem ser excluídos, apenas cancelados.',
  })
  @ApiOkResponse({ type: OrcamentoResponseDto })
  cancelar(
    @Param('id') id: string,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.orcamentoService.cancelar(id, usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir rascunho de orçamento',
    description: 'Apenas rascunhos podem ser excluídos fisicamente do sistema.',
  })
  @ApiNoContentResponse({ description: 'Orçamento excluído com sucesso' })
  excluir(@Param('id') id: string) {
    return this.orcamentoService.excluir(id);
  }
}
