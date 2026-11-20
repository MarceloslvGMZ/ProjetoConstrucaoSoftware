/**
 * Situação da ordem de serviço / compromisso na agenda (CU07).
 */
export enum SituacaoAgendamento {
  AGENDADO = 'Agendado',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDO = 'Concluido',
  CANCELADO = 'Cancelado',
}

/**
 * Resumo dos materiais e insumos que a equipe deve levar para a obra.
 */
export class AgendamentoMaterialResumo {
  descricao!: string;
  quantidade!: number;
  unidade!: string;

  constructor(data: {
    descricao: string;
    quantidade: number;
    unidade: string;
  }) {
    this.descricao = data.descricao;
    this.quantidade = data.quantidade;
    this.unidade = data.unidade;
  }
}

/**
 * Entidade de Domínio do Agendamento / Ordem de Serviço (CU07 – Manter Agenda).
 */
export class Agendamento {
  id!: string;
  orcamentoId!: string;
  numeroOrcamento!: number;
  clienteNome!: string;
  clienteTelefone!: string;
  clienteCpfCnpj?: string;
  enderecoObra!: string;
  tipoServico!: string;
  descricaoServico!: string;
  valorAcordado!: number;
  materiaisResumo!: AgendamentoMaterialResumo[];
  dataInicio!: Date;
  dataFimPrevisao!: Date | null;
  situacao!: SituacaoAgendamento;
  equipeOuInstalador?: string;
  criadoPorId!: string;
  criadoPorNome!: string;
  criadoEm!: Date;
  atualizadoEm!: Date;

  constructor(data: {
    id: string;
    orcamentoId: string;
    numeroOrcamento: number;
    clienteNome: string;
    clienteTelefone: string;
    clienteCpfCnpj?: string;
    enderecoObra: string;
    tipoServico: string;
    descricaoServico: string;
    valorAcordado: number;
    materiaisResumo: AgendamentoMaterialResumo[];
    dataInicio: Date;
    dataFimPrevisao?: Date | null;
    situacao: SituacaoAgendamento;
    equipeOuInstalador?: string;
    criadoPorId: string;
    criadoPorNome: string;
    criadoEm: Date;
    atualizadoEm: Date;
  }) {
    this.id = data.id;
    this.orcamentoId = data.orcamentoId;
    this.numeroOrcamento = data.numeroOrcamento;
    this.clienteNome = data.clienteNome;
    this.clienteTelefone = data.clienteTelefone;
    this.clienteCpfCnpj = data.clienteCpfCnpj;
    this.enderecoObra = data.enderecoObra;
    this.tipoServico = data.tipoServico;
    this.descricaoServico = data.descricaoServico;
    this.valorAcordado = data.valorAcordado;
    this.materiaisResumo = data.materiaisResumo;
    this.dataInicio = data.dataInicio;
    this.dataFimPrevisao = data.dataFimPrevisao ?? null;
    this.situacao = data.situacao;
    this.equipeOuInstalador = data.equipeOuInstalador;
    this.criadoPorId = data.criadoPorId;
    this.criadoPorNome = data.criadoPorNome;
    this.criadoEm = data.criadoEm;
    this.atualizadoEm = data.atualizadoEm;
  }
}
