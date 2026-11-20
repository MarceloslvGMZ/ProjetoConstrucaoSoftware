import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Agendamento, SituacaoAgendamento } from './agendamento.model';

export class AgendamentoMaterialResumoResponseDto {
  @ApiProperty({ example: 'Régua de PVC Branco 20cm x 6m' })
  descricao!: string;

  @ApiProperty({ example: 28 })
  quantidade!: number;

  @ApiProperty({ example: 'barra' })
  unidade!: string;
}

/**
 * Representação completa do agendamento / OS para retorno na API.
 */
export class AgendamentoResponseDto {
  @ApiProperty({ example: 'e3b0c442-98fc-1c14-9afbf4c8996fb924' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  orcamentoId!: string;

  @ApiProperty({ example: 1001 })
  numeroOrcamento!: number;

  @ApiProperty({ example: 'Carlos Silva' })
  clienteNome!: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  clienteTelefone!: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  clienteCpfCnpj?: string;

  @ApiProperty({
    example: 'Rua das Flores, 120, Bairro Jardim, São Paulo - SP',
  })
  enderecoObra!: string;

  @ApiProperty({ example: 'Forro de PVC Branco' })
  tipoServico!: string;

  @ApiProperty({
    example: 'Instalação de forro de PVC branco com 2 pontos de iluminação',
  })
  descricaoServico!: string;

  @ApiProperty({ example: 2050.0 })
  valorAcordado!: number;

  @ApiProperty({ type: [AgendamentoMaterialResumoResponseDto] })
  materiaisResumo!: AgendamentoMaterialResumoResponseDto[];

  @ApiProperty()
  dataInicio!: Date;

  @ApiPropertyOptional()
  dataFimPrevisao!: Date | null;

  @ApiProperty({
    enum: SituacaoAgendamento,
    example: SituacaoAgendamento.AGENDADO,
  })
  situacao!: SituacaoAgendamento;

  @ApiPropertyOptional({ example: 'Equipe Alpha' })
  equipeOuInstalador?: string;

  @ApiProperty({ example: 'admin' })
  criadoPorNome!: string;

  @ApiProperty()
  criadoEm!: Date;

  @ApiProperty()
  atualizadoEm!: Date;

  static fromModel(model: Agendamento): AgendamentoResponseDto {
    const dto = new AgendamentoResponseDto();
    dto.id = model.id;
    dto.orcamentoId = model.orcamentoId;
    dto.numeroOrcamento = model.numeroOrcamento;
    dto.clienteNome = model.clienteNome;
    dto.clienteTelefone = model.clienteTelefone;
    dto.clienteCpfCnpj = model.clienteCpfCnpj;
    dto.enderecoObra = model.enderecoObra;
    dto.tipoServico = model.tipoServico;
    dto.descricaoServico = model.descricaoServico;
    dto.valorAcordado = model.valorAcordado;
    dto.materiaisResumo = model.materiaisResumo.map((m) => ({ ...m }));
    dto.dataInicio = model.dataInicio;
    dto.dataFimPrevisao = model.dataFimPrevisao;
    dto.situacao = model.situacao;
    dto.equipeOuInstalador = model.equipeOuInstalador;
    dto.criadoPorNome = model.criadoPorNome;
    dto.criadoEm = model.criadoEm;
    dto.atualizadoEm = model.atualizadoEm;
    return dto;
  }
}
