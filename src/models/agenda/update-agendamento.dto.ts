import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SituacaoAgendamento } from './agendamento.model';

/**
 * Payload para alteração de agendamento existente (CU07 – UC03).
 */
export class UpdateAgendamentoDto {
  @ApiPropertyOptional({
    example: '2026-11-27T08:00:00.000Z',
    description: 'Nova data/horário de início',
  })
  @IsDateString(
    {},
    { message: 'Data de início deve estar em formato ISO válido' },
  )
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({
    example: '2026-11-28T18:00:00.000Z',
    description: 'Nova previsão de término',
  })
  @IsDateString(
    {},
    { message: 'Data de previsão deve estar em formato ISO válido' },
  )
  @IsOptional()
  dataFimPrevisao?: string;

  @ApiPropertyOptional({
    example: 'Ajuste no cronograma devido a preparação da laje',
    description: 'Atualização da descrição ou notas técnicas',
  })
  @IsString()
  @IsOptional()
  descricaoServico?: string;

  @ApiPropertyOptional({
    example: 'Equipe Beta',
    description: 'Alteração da equipe/instalador responsável',
  })
  @IsString()
  @IsOptional()
  equipeOuInstalador?: string;

  @ApiPropertyOptional({
    enum: SituacaoAgendamento,
    example: SituacaoAgendamento.EM_ANDAMENTO,
    description: 'Atualização da situação da ordem de serviço',
  })
  @IsEnum(SituacaoAgendamento)
  @IsOptional()
  situacao?: SituacaoAgendamento;

  @ApiPropertyOptional({
    example: '(11) 91234-5678',
    description: 'Telefone atualizado de contato',
  })
  @IsString()
  @IsOptional()
  clienteTelefone?: string;
}
