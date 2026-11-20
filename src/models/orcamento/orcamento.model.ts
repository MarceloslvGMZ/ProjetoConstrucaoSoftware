/**
 * Situações possíveis do ciclo de vida de um orçamento (CU06 – RN06).
 */
export enum SituacaoOrcamento {
  RASCUNHO = 'Rascunho',
  EMITIDO = 'Emitido',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado',
  CANCELADO = 'Cancelado',
}

/**
 * Informações cadastrais básicas do cliente necessárias para formalizar o orçamento.
 */
export class ClienteOrcamento {
  nome!: string;
  telefone!: string;
  enderecoObra!: string;
  cpfCnpj?: string;

  constructor(data: {
    nome: string;
    telefone: string;
    enderecoObra: string;
    cpfCnpj?: string;
  }) {
    this.nome = data.nome;
    this.telefone = data.telefone;
    this.enderecoObra = data.enderecoObra;
    this.cpfCnpj = data.cpfCnpj;
  }
}

/**
 * Item de material sob encomenda consolidado a partir do CU05 (Cálculo de Materiais).
 */
export class ItemOrcamentoCalculado {
  descricao!: string;
  quantidade!: number;
  unidade!: string;
  valorUnitarioEstimado!: number;
  valorTotal!: number;

  constructor(data: {
    descricao: string;
    quantidade: number;
    unidade: string;
    valorUnitarioEstimado: number;
    valorTotal: number;
  }) {
    this.descricao = data.descricao;
    this.quantidade = data.quantidade;
    this.unidade = data.unidade;
    this.valorUnitarioEstimado = data.valorUnitarioEstimado;
    this.valorTotal = data.valorTotal;
  }
}

/**
 * Registro de auditoria das ações realizadas sobre o orçamento (RN09).
 */
export class OrcamentoAuditLog {
  dataHora!: Date;
  usuarioId!: string;
  usuarioNome!: string;
  acao!: string;
  detalhes?: string;

  constructor(data: {
    dataHora: Date;
    usuarioId: string;
    usuarioNome: string;
    acao: string;
    detalhes?: string;
  }) {
    this.dataHora = data.dataHora;
    this.usuarioId = data.usuarioId;
    this.usuarioNome = data.usuarioNome;
    this.acao = data.acao;
    this.detalhes = data.detalhes;
  }
}

/**
 * Entidade de Domínio do Orçamento (CU06 – Emitir Orçamento).
 * Concretiza comercialmente o cálculo de materiais sob encomenda já realizado no CU05.
 */
export class Orcamento {
  id!: string;
  numero!: number;
  calculoMateriaisId!: string;
  cliente!: ClienteOrcamento;
  tipoServico!: string;
  descricaoObra!: string;
  itens!: ItemOrcamentoCalculado[];
  valorMateriais!: number;
  valorMaoDeObra!: number;
  valorDesconto!: number;
  valorTotal!: number;
  validadeDias!: number;
  dataValidade!: Date;
  situacao!: SituacaoOrcamento;
  possuiAgendamento!: boolean;
  dataEmissao!: Date | null;
  criadoPorId!: string;
  criadoPorNome!: string;
  historico!: OrcamentoAuditLog[];
  criadoEm!: Date;
  atualizadoEm!: Date;

  constructor(data: {
    id: string;
    numero: number;
    calculoMateriaisId: string;
    cliente: ClienteOrcamento;
    tipoServico: string;
    descricaoObra: string;
    itens: ItemOrcamentoCalculado[];
    valorMateriais: number;
    valorMaoDeObra: number;
    valorDesconto?: number;
    valorTotal: number;
    validadeDias?: number;
    dataValidade: Date;
    situacao: SituacaoOrcamento;
    possuiAgendamento?: boolean;
    dataEmissao?: Date | null;
    criadoPorId: string;
    criadoPorNome: string;
    historico?: OrcamentoAuditLog[];
    criadoEm: Date;
    atualizadoEm: Date;
  }) {
    this.id = data.id;
    this.numero = data.numero;
    this.calculoMateriaisId = data.calculoMateriaisId;
    this.cliente = data.cliente;
    this.tipoServico = data.tipoServico;
    this.descricaoObra = data.descricaoObra;
    this.itens = data.itens;
    this.valorMateriais = data.valorMateriais;
    this.valorMaoDeObra = data.valorMaoDeObra;
    this.valorDesconto = data.valorDesconto ?? 0;
    this.valorTotal = data.valorTotal;
    this.validadeDias = data.validadeDias ?? 15;
    this.dataValidade = data.dataValidade;
    this.situacao = data.situacao;
    this.possuiAgendamento = data.possuiAgendamento ?? false;
    this.dataEmissao = data.dataEmissao ?? null;
    this.criadoPorId = data.criadoPorId;
    this.criadoPorNome = data.criadoPorNome;
    this.historico = data.historico ?? [];
    this.criadoEm = data.criadoEm;
    this.atualizadoEm = data.atualizadoEm;
  }
}
