import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SituacaoAgendamento } from './agendamento.model';

/**
 * Filtros para consulta da tabela de agendamentos e calendário (CU07 – UC01).
 */
export class AgendamentoFiltroDto {
  @ApiPropertyOptional({
    example: '2026-11-25',
    description: 'Filtrar agendamentos de uma data específica (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  data?: string;

  @ApiPropertyOptional({
    example: '2026-11-20',
    description: 'Data de início do intervalo de busca (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'Data de término do intervalo de busca (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  dataFim?: string;

  @ApiPropertyOptional({
    enum: SituacaoAgendamento,
    example: SituacaoAgendamento.AGENDADO,
    description: 'Filtrar por situação do agendamento',
  })
  @IsEnum(SituacaoAgendamento)
  @IsOptional()
  situacao?: SituacaoAgendamento;

  @ApiPropertyOptional({
    example: 'Carlos',
    description: 'Filtrar por nome do cliente (busca parcial)',
  })
  @IsString()
  @IsOptional()
  cliente?: string;
}
