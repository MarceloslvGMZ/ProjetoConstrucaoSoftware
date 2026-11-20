import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { ClienteOrcamentoDto } from './create-orcamento.dto';

/**
 * Payload para atualização de orçamento não aprovado/não agendado (CU06 – RN06).
 */
export class UpdateOrcamentoDto {
  @ApiPropertyOptional({
    type: ClienteOrcamentoDto,
    description: 'Atualização dos dados do cliente e local da obra',
  })
  @ValidateNested()
  @Type(() => ClienteOrcamentoDto)
  @IsOptional()
  cliente?: ClienteOrcamentoDto;

  @ApiPropertyOptional({
    example: 700.0,
    description: 'Atualização do valor de mão de obra',
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Valor da mão de obra não pode ser negativo' })
  @IsOptional()
  valorMaoDeObra?: number;

  @ApiPropertyOptional({
    example: 80.0,
    description: 'Atualização do valor do desconto',
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Valor do desconto não pode ser negativo' })
  @IsOptional()
  valorDesconto?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Atualização do prazo de validade em dias',
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Validade deve ser de no mínimo 1 dia' })
  @IsOptional()
  validadeDias?: number;
}
