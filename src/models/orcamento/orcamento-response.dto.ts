import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Orcamento, SituacaoOrcamento } from './orcamento.model';

export class ClienteOrcamentoResponseDto {
  @ApiProperty({ example: 'Carlos Silva' })
  nome!: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  telefone!: string;

  @ApiProperty({
    example: 'Rua das Flores, 120, Bairro Jardim, São Paulo - SP',
  })
  enderecoObra!: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  cpfCnpj?: string;
}

export class ItemOrcamentoResponseDto {
  @ApiProperty({ example: 'Régua de PVC Branco 20cm x 6m' })
  descricao!: string;

  @ApiProperty({ example: 28 })
  quantidade!: number;

  @ApiProperty({ example: 'barra' })
  unidade!: string;

  @ApiProperty({ example: 35.0 })
  valorUnitarioEstimado!: number;

  @ApiProperty({ example: 980.0 })
  valorTotal!: number;
}

export class OrcamentoAuditLogResponseDto {
  @ApiProperty()
  dataHora!: Date;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  usuarioId!: string;

  @ApiProperty({ example: 'admin' })
  usuarioNome!: string;

  @ApiProperty({ example: 'EMISSAO' })
  acao!: string;

  @ApiPropertyOptional()
  detalhes?: string;
}

/**
 * Representação completa do orçamento para respostas da API.
 */
export class OrcamentoResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 1001 })
  numero!: number;

  @ApiProperty({ example: 'calc-pvc-001' })
  calculoMateriaisId!: string;

  @ApiProperty({ type: ClienteOrcamentoResponseDto })
  cliente!: ClienteOrcamentoResponseDto;

  @ApiProperty({ example: 'Forro de PVC Branco' })
  tipoServico!: string;

  @ApiProperty({ example: 'Sala (4x5m) e Quarto Casal (3x4m)' })
  descricaoObra!: string;

  @ApiProperty({ type: [ItemOrcamentoResponseDto] })
  itens!: ItemOrcamentoResponseDto[];

  @ApiProperty({ example: 1450.0 })
  valorMateriais!: number;

  @ApiProperty({ example: 650.0 })
  valorMaoDeObra!: number;

  @ApiProperty({ example: 50.0 })
  valorDesconto!: number;

  @ApiProperty({ example: 2050.0 })
  valorTotal!: number;

  @ApiProperty({ example: 15 })
  validadeDias!: number;

  @ApiProperty()
  dataValidade!: Date;

  @ApiProperty({ enum: SituacaoOrcamento, example: SituacaoOrcamento.EMITIDO })
  situacao!: SituacaoOrcamento;

  @ApiProperty({ example: false })
  possuiAgendamento!: boolean;

  @ApiPropertyOptional()
  dataEmissao!: Date | null;

  @ApiProperty({ example: 'admin' })
  criadoPorNome!: string;

  @ApiProperty({ type: [OrcamentoAuditLogResponseDto] })
  historico!: OrcamentoAuditLogResponseDto[];

  @ApiProperty()
  criadoEm!: Date;

  @ApiProperty()
  atualizadoEm!: Date;

  static fromModel(orcamento: Orcamento): OrcamentoResponseDto {
    const dto = new OrcamentoResponseDto();
    dto.id = orcamento.id;
    dto.numero = orcamento.numero;
    dto.calculoMateriaisId = orcamento.calculoMateriaisId;
    dto.cliente = { ...orcamento.cliente };
    dto.tipoServico = orcamento.tipoServico;
    dto.descricaoObra = orcamento.descricaoObra;
    dto.itens = orcamento.itens.map((i) => ({ ...i }));
    dto.valorMateriais = orcamento.valorMateriais;
    dto.valorMaoDeObra = orcamento.valorMaoDeObra;
    dto.valorDesconto = orcamento.valorDesconto;
    dto.valorTotal = orcamento.valorTotal;
    dto.validadeDias = orcamento.validadeDias;
    dto.dataValidade = orcamento.dataValidade;
    dto.situacao = orcamento.situacao;
    dto.possuiAgendamento = orcamento.possuiAgendamento;
    dto.dataEmissao = orcamento.dataEmissao;
    dto.criadoPorNome = orcamento.criadoPorNome;
    dto.historico = orcamento.historico.map((h) => ({ ...h }));
    dto.criadoEm = orcamento.criadoEm;
    dto.atualizadoEm = orcamento.atualizadoEm;
    return dto;
  }
}
