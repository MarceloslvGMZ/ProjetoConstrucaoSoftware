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
import { AgendamentoFiltroDto } from '../models/agenda/agendamento-filtro.dto';
import { AgendamentoResponseDto } from '../models/agenda/agendamento-response.dto';
import { CreateAgendamentoDto } from '../models/agenda/create-agendamento.dto';
import { UpdateAgendamentoDto } from '../models/agenda/update-agendamento.dto';
import { AgendaService } from '../services/agenda.service';

/**
 * Camada de apresentação HTTP do Caso de Uso 07 – Manter Agenda.
 */
@ApiTags('agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar novo agendamento de serviço',
    description:
      'Registra uma nova ordem de serviço vinculada a um orçamento aprovado.',
  })
  @ApiCreatedResponse({ type: AgendamentoResponseDto })
  criar(
    @Body() dto: CreateAgendamentoDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.agendaService.criar(dto, usuario);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar agendamentos na tabela/calendário',
    description:
      'Permite buscar agendamentos por data específica, período (semana/mês), cliente ou status.',
  })
  @ApiOkResponse({
    description: 'Listagem de agendamentos com total e itens',
  })
  listar(@Query() filtros: AgendamentoFiltroDto) {
    return this.agendaService.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiOkResponse({ type: AgendamentoResponseDto })
  buscarPorId(@Param('id') id: string) {
    return this.agendaService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Editar agendamento',
    description:
      'Atualiza data, horário, equipe responsável, descrição ou status da ordem de serviço.',
  })
  @ApiOkResponse({ type: AgendamentoResponseDto })
  atualizar(@Param('id') id: string, @Body() dto: UpdateAgendamentoDto) {
    return this.agendaService.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir ou remover agendamento',
    description:
      'Deleta o compromisso e descongela o orçamento para eventuais ajustes.',
  })
  @ApiNoContentResponse({ description: 'Agendamento removido com sucesso' })
  excluir(@Param('id') id: string) {
    return this.agendaService.excluir(id);
  }
}
