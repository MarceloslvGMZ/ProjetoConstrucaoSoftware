import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsuarioAutenticado } from '../auth/usuario-autenticado';
import { CreateOrcamentoDto } from '../models/orcamento/create-orcamento.dto';
import { OrcamentoFiltroDto } from '../models/orcamento/orcamento-filtro.dto';
import { OrcamentoResponseDto } from '../models/orcamento/orcamento-response.dto';
import {
  ClienteOrcamento,
  ItemOrcamentoCalculado,
  Orcamento,
  OrcamentoAuditLog,
  SituacaoOrcamento,
} from '../models/orcamento/orcamento.model';
import { UpdateOrcamentoDto } from '../models/orcamento/update-orcamento.dto';
import { OrcamentoRepository } from '../repositories/orcamento.repository';
import { CalculoMateriaisContract } from './contracts/calculo-materiais.contract';

/**
 * Camada de negócio do Caso de Uso 06 – Emitir Orçamento.
 * Concretiza o cálculo de materiais adicionando dados do cliente e condições comerciais.
 */
@Injectable()
export class OrcamentoService {
  constructor(
    private readonly orcamentoRepository: OrcamentoRepository,
    private readonly calculoMateriaisContract: CalculoMateriaisContract,
  ) {}

  async criar(
    dto: CreateOrcamentoDto,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    // 1. Obter e validar o cálculo de materiais de origem (CU05)
    const calculo = await this.calculoMateriaisContract.obterCalculoPorId(
      dto.calculoMateriaisId,
    );
    if (!calculo) {
      throw new NotFoundException({
        campo: 'calculoMateriaisId',
        motivo: `Cálculo de materiais '${dto.calculoMateriaisId}' não encontrado`,
      });
    }

    // 2. Validação financeira (RN05)
    const valorMateriais = calculo.valorEstimadoMateriais;
    const valorMaoDeObra = dto.valorMaoDeObra;
    const subtotal = valorMateriais + valorMaoDeObra;
    const valorDesconto = dto.valorDesconto ?? 0;

    if (valorDesconto > subtotal) {
      throw new BadRequestException({
        campo: 'valorDesconto',
        motivo: 'O desconto não pode ser maior que o subtotal do orçamento',
      });
    }

    const valorTotal = subtotal - valorDesconto;
    const validadeDias = dto.validadeDias ?? 15;
    const agora = new Date();
    const dataValidade = new Date(
      agora.getTime() + validadeDias * 24 * 60 * 60 * 1000,
    );

    // 3. Definição do status e numeração sequencial única (RN06 e RN07)
    const situacao =
      dto.emitirImediatamente === false
        ? SituacaoOrcamento.RASCUNHO
        : SituacaoOrcamento.EMITIDO;
    const numero = await this.orcamentoRepository.proximoNumero();
    const dataEmissao = situacao === SituacaoOrcamento.EMITIDO ? agora : null;

    // 4. Mapear itens calculados
    const itens = calculo.itens.map(
      (item) =>
        new ItemOrcamentoCalculado({
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valorUnitarioEstimado: item.valorUnitarioEstimado,
          valorTotal: item.valorTotal,
        }),
    );

    const logInicial = new OrcamentoAuditLog({
      dataHora: agora,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      acao: 'CRIACAO',
      detalhes:
        situacao === SituacaoOrcamento.EMITIDO
          ? `Orçamento #${numero} criado e emitido diretamente com valor total R$ ${valorTotal.toFixed(2)}`
          : `Orçamento #${numero} salvo como Rascunho`,
    });

    const orcamento = new Orcamento({
      id: randomUUID(),
      numero,
      calculoMateriaisId: calculo.id,
      cliente: new ClienteOrcamento({
        nome: dto.cliente.nome.trim(),
        telefone: dto.cliente.telefone.trim(),
        enderecoObra: dto.cliente.enderecoObra.trim(),
        cpfCnpj: dto.cliente.cpfCnpj?.trim(),
      }),
      tipoServico: calculo.tipoServico,
      descricaoObra: calculo.descricaoAmbientes,
      itens,
      valorMateriais,
      valorMaoDeObra,
      valorDesconto,
      valorTotal,
      validadeDias,
      dataValidade,
      situacao,
      possuiAgendamento: false,
      dataEmissao,
      criadoPorId: usuario.id,
      criadoPorNome: usuario.nome,
      historico: [logInicial],
      criadoEm: agora,
      atualizadoEm: agora,
    });

    const salvo = await this.orcamentoRepository.create(orcamento);
    return OrcamentoResponseDto.fromModel(salvo);
  }

  async listar(filtros?: OrcamentoFiltroDto): Promise<{
    total: number;
    orcamentos: OrcamentoResponseDto[];
  }> {
    const lista = await this.orcamentoRepository.search(filtros);
    return {
      total: lista.length,
      orcamentos: lista.map((o) => OrcamentoResponseDto.fromModel(o)),
    };
  }

  async buscarPorId(id: string): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);
    return OrcamentoResponseDto.fromModel(orcamento);
  }

  /**
   * Método interno para obtenção do modelo do orçamento ou lançamento de NotFoundException.
   */
  async buscarModeloPorId(id: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepository.findById(id);
    if (!orcamento) {
      throw new NotFoundException(`Orçamento '${id}' não encontrado`);
    }
    return orcamento;
  }

  /**
   * Consulta os orçamentos que já estão aprovados pelo cliente e aptos a agendamento (CU07).
   */
  async listarAprovadosParaAgendamento(): Promise<OrcamentoResponseDto[]> {
    const todos = await this.orcamentoRepository.findAll();
    const aprovadosSemAgendamento = todos.filter(
      (o) => o.situacao === SituacaoOrcamento.APROVADO && !o.possuiAgendamento,
    );
    return aprovadosSemAgendamento.map((o) =>
      OrcamentoResponseDto.fromModel(o),
    );
  }

  async atualizar(
    id: string,
    dto: UpdateOrcamentoDto,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);

    // RN06: Não permite alterar orçamento já agendado
    if (orcamento.possuiAgendamento) {
      throw new BadRequestException(
        'Não é permitido alterar orçamento que já possui serviço agendado na agenda',
      );
    }

    // Apenas RASCUNHO ou EMITIDO podem ter dados/valores alterados
    if (
      orcamento.situacao === SituacaoOrcamento.APROVADO ||
      orcamento.situacao === SituacaoOrcamento.CANCELADO ||
      orcamento.situacao === SituacaoOrcamento.REPROVADO
    ) {
      throw new BadRequestException(
        `Não é permitido alterar orçamento na situação '${orcamento.situacao}'`,
      );
    }

    if (dto.cliente) {
      orcamento.cliente = new ClienteOrcamento({
        nome: dto.cliente.nome?.trim() ?? orcamento.cliente.nome,
        telefone: dto.cliente.telefone?.trim() ?? orcamento.cliente.telefone,
        enderecoObra:
          dto.cliente.enderecoObra?.trim() ?? orcamento.cliente.enderecoObra,
        cpfCnpj: dto.cliente.cpfCnpj?.trim() ?? orcamento.cliente.cpfCnpj,
      });
    }

    let houveMudancaFinanceira = false;
    if (dto.valorMaoDeObra !== undefined) {
      orcamento.valorMaoDeObra = dto.valorMaoDeObra;
      houveMudancaFinanceira = true;
    }

    if (dto.valorDesconto !== undefined) {
      orcamento.valorDesconto = dto.valorDesconto;
      houveMudancaFinanceira = true;
    }

    if (houveMudancaFinanceira) {
      const subtotal = orcamento.valorMateriais + orcamento.valorMaoDeObra;
      if (orcamento.valorDesconto > subtotal) {
        throw new BadRequestException({
          campo: 'valorDesconto',
          motivo: 'O desconto não pode ser maior que o subtotal do orçamento',
        });
      }
      orcamento.valorTotal = subtotal - orcamento.valorDesconto;
    }

    if (dto.validadeDias !== undefined) {
      orcamento.validadeDias = dto.validadeDias;
      const baseData = orcamento.dataEmissao ?? orcamento.criadoEm;
      orcamento.dataValidade = new Date(
        baseData.getTime() + dto.validadeDias * 24 * 60 * 60 * 1000,
      );
    }

    const agora = new Date();
    orcamento.atualizadoEm = agora;
    orcamento.historico.push(
      new OrcamentoAuditLog({
        dataHora: agora,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        acao: 'ALTERACAO',
        detalhes: 'Dados do orçamento atualizados',
      }),
    );

    const atualizado = await this.orcamentoRepository.update(orcamento);
    return OrcamentoResponseDto.fromModel(atualizado);
  }

  async emitir(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);

    if (orcamento.situacao !== SituacaoOrcamento.RASCUNHO) {
      throw new BadRequestException(
        `Apenas orçamentos na situação Rascunho podem ser emitidos. Situação atual: '${orcamento.situacao}'`,
      );
    }

    const agora = new Date();
    orcamento.situacao = SituacaoOrcamento.EMITIDO;
    orcamento.dataEmissao = agora;
    orcamento.dataValidade = new Date(
      agora.getTime() + orcamento.validadeDias * 24 * 60 * 60 * 1000,
    );
    orcamento.atualizadoEm = agora;
    orcamento.historico.push(
      new OrcamentoAuditLog({
        dataHora: agora,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        acao: 'EMISSAO',
        detalhes: `Orçamento emitido formalmente com validade até ${orcamento.dataValidade.toISOString()}`,
      }),
    );

    const atualizado = await this.orcamentoRepository.update(orcamento);
    return OrcamentoResponseDto.fromModel(atualizado);
  }

  async aprovar(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);

    if (orcamento.situacao !== SituacaoOrcamento.EMITIDO) {
      throw new BadRequestException(
        `Apenas orçamentos na situação Emitido podem ser aprovados. Situação atual: '${orcamento.situacao}'`,
      );
    }

    const agora = new Date();
    orcamento.situacao = SituacaoOrcamento.APROVADO;
    orcamento.atualizadoEm = agora;
    orcamento.historico.push(
      new OrcamentoAuditLog({
        dataHora: agora,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        acao: 'APROVACAO',
        detalhes:
          'Orçamento aprovado pelo cliente. Habilitado para agendamento.',
      }),
    );

    const atualizado = await this.orcamentoRepository.update(orcamento);
    return OrcamentoResponseDto.fromModel(atualizado);
  }

  async reprovar(
    id: string,
    motivo: string | undefined,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);

    if (orcamento.situacao !== SituacaoOrcamento.EMITIDO) {
      throw new BadRequestException(
        `Apenas orçamentos na situação Emitido podem ser reprovados. Situação atual: '${orcamento.situacao}'`,
      );
    }

    const agora = new Date();
    orcamento.situacao = SituacaoOrcamento.REPROVADO;
    orcamento.atualizadoEm = agora;
    orcamento.historico.push(
      new OrcamentoAuditLog({
        dataHora: agora,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        acao: 'REPROVACAO',
        detalhes: motivo
          ? `Motivo: ${motivo}`
          : 'Orçamento reprovado pelo cliente',
      }),
    );

    const atualizado = await this.orcamentoRepository.update(orcamento);
    return OrcamentoResponseDto.fromModel(atualizado);
  }

  async cancelar(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<OrcamentoResponseDto> {
    const orcamento = await this.buscarModeloPorId(id);

    if (orcamento.possuiAgendamento) {
      throw new BadRequestException(
        'Não é permitido cancelar orçamento com agendamento ativo. Cancele o agendamento primeiro.',
      );
    }

    if (orcamento.situacao === SituacaoOrcamento.CANCELADO) {
      throw new BadRequestException('Orçamento já está cancelado');
    }

    const agora = new Date();
    orcamento.situacao = SituacaoOrcamento.CANCELADO;
    orcamento.atualizadoEm = agora;
    orcamento.historico.push(
      new OrcamentoAuditLog({
        dataHora: agora,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        acao: 'CANCELAMENTO',
        detalhes: 'Orçamento cancelado',
      }),
    );

    const atualizado = await this.orcamentoRepository.update(orcamento);
    return OrcamentoResponseDto.fromModel(atualizado);
  }

  async excluir(id: string): Promise<void> {
    const orcamento = await this.buscarModeloPorId(id);

    // RN06: Orçamentos emitidos não podem ser excluídos, apenas cancelados.
    if (orcamento.situacao !== SituacaoOrcamento.RASCUNHO) {
      throw new BadRequestException(
        'Orçamentos emitidos não podem ser excluídos fisicamente, apenas cancelados.',
      );
    }

    await this.orcamentoRepository.delete(id);
  }

  /**
   * Comunicação interna disparada pelo AgendaService (CU07).
   * Congela o orçamento para impedir alterações enquanto houver agendamento ativo.
   */
  async marcarAgendamentoVinculado(
    id: string,
    vinculado: boolean,
  ): Promise<void> {
    const orcamento = await this.buscarModeloPorId(id);
    orcamento.possuiAgendamento = vinculado;
    orcamento.atualizadoEm = new Date();
    await this.orcamentoRepository.update(orcamento);
  }
}
