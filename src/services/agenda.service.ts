import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsuarioAutenticado } from '../auth/usuario-autenticado';
import { AgendamentoFiltroDto } from '../models/agenda/agendamento-filtro.dto';
import { AgendamentoResponseDto } from '../models/agenda/agendamento-response.dto';
import {
  Agendamento,
  AgendamentoMaterialResumo,
  SituacaoAgendamento,
} from '../models/agenda/agendamento.model';
import { CreateAgendamentoDto } from '../models/agenda/create-agendamento.dto';
import { UpdateAgendamentoDto } from '../models/agenda/update-agendamento.dto';
import { SituacaoOrcamento } from '../models/orcamento/orcamento.model';
import { AgendamentoRepository } from '../repositories/agendamento.repository';
import { OrcamentoService } from './orcamento.service';

/**
 * Camada de negócio do Caso de Uso 07 – Manter Agenda.
 * Gerencia o agendamento de ordens de serviço a partir de orçamentos aprovados.
 */
@Injectable()
export class AgendaService {
  constructor(
    private readonly agendamentoRepository: AgendamentoRepository,
    private readonly orcamentoService: OrcamentoService,
  ) {}

  async criar(
    dto: CreateAgendamentoDto,
    usuario: UsuarioAutenticado,
  ): Promise<AgendamentoResponseDto> {
    // 1. Obter e validar o orçamento de origem
    const orcamento = await this.orcamentoService.buscarModeloPorId(
      dto.orcamentoId,
    );

    // RN-AGE-01: Apenas orçamentos aprovados podem ser agendados
    if (orcamento.situacao !== SituacaoOrcamento.APROVADO) {
      throw new BadRequestException(
        `Apenas orçamentos aprovados pelo cliente podem ser agendados. Situação atual: '${orcamento.situacao}'`,
      );
    }

    // Evita duplicidade de agendamento ativo para o mesmo orçamento
    const existente = await this.agendamentoRepository.findByOrcamentoId(
      dto.orcamentoId,
    );
    if (existente && existente.situacao !== SituacaoAgendamento.CANCELADO) {
      throw new ConflictException(
        `O orçamento #${orcamento.numero} já possui um agendamento ativo registrado na agenda`,
      );
    }

    // 2. Validações de data
    const dataInicio = new Date(dto.dataInicio);
    if (isNaN(dataInicio.getTime())) {
      throw new BadRequestException('Data de início em formato inválido');
    }

    let dataFimPrevisao: Date | null = null;
    if (dto.dataFimPrevisao) {
      dataFimPrevisao = new Date(dto.dataFimPrevisao);
      if (isNaN(dataFimPrevisao.getTime())) {
        throw new BadRequestException(
          'Data de previsão de término em formato inválido',
        );
      }
      if (dataFimPrevisao <= dataInicio) {
        throw new BadRequestException(
          'A previsão de término deve ser posterior à data de início do serviço',
        );
      }
    }

    // 3. Validação de telefone e documento
    const telefone = (
      dto.clienteTelefone?.trim() || orcamento.cliente.telefone
    ).trim();
    this.validarTelefone(telefone);

    const cpfCnpj = (
      dto.clienteCpfCnpj?.trim() || orcamento.cliente.cpfCnpj
    )?.trim();
    if (cpfCnpj) {
      this.validarDocumentoCpfCnpj(cpfCnpj);
    }

    // 4. Mapear resumo dos materiais para a equipe
    const materiaisResumo = orcamento.itens.map(
      (item) =>
        new AgendamentoMaterialResumo({
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
        }),
    );

    const agora = new Date();
    const agendamento = new Agendamento({
      id: randomUUID(),
      orcamentoId: orcamento.id,
      numeroOrcamento: orcamento.numero,
      clienteNome: orcamento.cliente.nome,
      clienteTelefone: telefone,
      clienteCpfCnpj: cpfCnpj,
      enderecoObra: orcamento.cliente.enderecoObra,
      tipoServico: orcamento.tipoServico,
      descricaoServico: dto.descricaoServico.trim(),
      valorAcordado: orcamento.valorTotal,
      materiaisResumo,
      dataInicio,
      dataFimPrevisao,
      situacao: SituacaoAgendamento.AGENDADO,
      equipeOuInstalador: dto.equipeOuInstalador?.trim(),
      criadoPorId: usuario.id,
      criadoPorNome: usuario.nome,
      criadoEm: agora,
      atualizadoEm: agora,
    });

    const criado = await this.agendamentoRepository.create(agendamento);

    // RN-AGE-02 / RN06: Notifica o orçamento que o agendamento foi vinculado, congelando-o
    await this.orcamentoService.marcarAgendamentoVinculado(orcamento.id, true);

    return AgendamentoResponseDto.fromModel(criado);
  }

  async listar(filtros?: AgendamentoFiltroDto): Promise<{
    total: number;
    agendamentos: AgendamentoResponseDto[];
  }> {
    const lista = await this.agendamentoRepository.search(filtros);
    return {
      total: lista.length,
      agendamentos: lista.map((a) => AgendamentoResponseDto.fromModel(a)),
    };
  }

  async buscarPorId(id: string): Promise<AgendamentoResponseDto> {
    const agendamento = await this.obterOuFalhar(id);
    return AgendamentoResponseDto.fromModel(agendamento);
  }

  async atualizar(
    id: string,
    dto: UpdateAgendamentoDto,
  ): Promise<AgendamentoResponseDto> {
    const agendamento = await this.obterOuFalhar(id);

    if (dto.dataInicio) {
      const novaDataInicio = new Date(dto.dataInicio);
      if (isNaN(novaDataInicio.getTime())) {
        throw new BadRequestException('Data de início inválida');
      }
      agendamento.dataInicio = novaDataInicio;
    }

    if (dto.dataFimPrevisao !== undefined) {
      if (dto.dataFimPrevisao === null || dto.dataFimPrevisao === '') {
        agendamento.dataFimPrevisao = null;
      } else {
        const novaDataFim = new Date(dto.dataFimPrevisao);
        if (isNaN(novaDataFim.getTime())) {
          throw new BadRequestException('Data de término prevista inválida');
        }
        if (novaDataFim <= agendamento.dataInicio) {
          throw new BadRequestException(
            'A previsão de término deve ser posterior à data de início',
          );
        }
        agendamento.dataFimPrevisao = novaDataFim;
      }
    }

    if (dto.descricaoServico?.trim()) {
      agendamento.descricaoServico = dto.descricaoServico.trim();
    }

    if (dto.equipeOuInstalador !== undefined) {
      agendamento.equipeOuInstalador = dto.equipeOuInstalador.trim();
    }

    if (dto.clienteTelefone?.trim()) {
      this.validarTelefone(dto.clienteTelefone.trim());
      agendamento.clienteTelefone = dto.clienteTelefone.trim();
    }

    if (dto.situacao) {
      agendamento.situacao = dto.situacao;

      // Se o agendamento for cancelado, descongela o orçamento correspondente
      if (dto.situacao === SituacaoAgendamento.CANCELADO) {
        await this.orcamentoService.marcarAgendamentoVinculado(
          agendamento.orcamentoId,
          false,
        );
      }
    }

    agendamento.atualizadoEm = new Date();
    const atualizado = await this.agendamentoRepository.update(agendamento);
    return AgendamentoResponseDto.fromModel(atualizado);
  }

  async excluir(id: string): Promise<void> {
    const agendamento = await this.obterOuFalhar(id);
    await this.agendamentoRepository.delete(id);

    // Libera a trava do orçamento vinculado
    await this.orcamentoService.marcarAgendamentoVinculado(
      agendamento.orcamentoId,
      false,
    );
  }

  private async obterOuFalhar(id: string): Promise<Agendamento> {
    const agendamento = await this.agendamentoRepository.findById(id);
    if (!agendamento) {
      throw new NotFoundException(`Agendamento '${id}' não encontrado`);
    }
    return agendamento;
  }

  private validarTelefone(telefone: string): void {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length < 8 || numeros.length > 13) {
      throw new BadRequestException({
        campo: 'clienteTelefone',
        motivo: 'Número de telefone deve conter entre 8 e 13 dígitos numéricos',
      });
    }
  }

  private validarDocumentoCpfCnpj(documento: string): void {
    const digitos = documento.replace(/\D/g, '');
    if (digitos.length !== 11 && digitos.length !== 14) {
      throw new BadRequestException({
        campo: 'clienteCpfCnpj',
        motivo:
          'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
      });
    }
  }
}
