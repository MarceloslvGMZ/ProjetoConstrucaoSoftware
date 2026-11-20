import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SituacaoOrcamento } from './orcamento.model';

/**
 * Filtros de busca para consulta de orçamentos (CU06 – UC01).
 */
export class OrcamentoFiltroDto {
  @ApiPropertyOptional({
    example: 1001,
    description: 'Filtrar por número sequencial exato do orçamento',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  numero?: number;

  @ApiPropertyOptional({
    example: 'Carlos',
    description: 'Filtrar por nome do cliente (busca parcial)',
  })
  @IsString()
  @IsOptional()
  cliente?: string;

  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'Data de início do período de emissão/criação (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  periodoInicial?: string;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'Data final do período de emissão/criação (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  periodoFinal?: string;

  @ApiPropertyOptional({
    enum: SituacaoOrcamento,
    example: SituacaoOrcamento.EMITIDO,
    description: 'Filtrar por status/situação do orçamento',
  })
  @IsEnum(SituacaoOrcamento)
  @IsOptional()
  situacao?: SituacaoOrcamento;
}
