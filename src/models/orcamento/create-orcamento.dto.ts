import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Dados de contato e endereço do cliente para a proposta.
 */
export class ClienteOrcamentoDto {
  @ApiProperty({
    example: 'Carlos Silva',
    description: 'Nome completo ou razão social do cliente',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome do cliente é obrigatório' })
  nome!: string;

  @ApiProperty({
    example: '(11) 98765-4321',
    description: 'Telefone de contato principal',
  })
  @IsString()
  @IsNotEmpty({ message: 'Telefone de contato é obrigatório' })
  telefone!: string;

  @ApiProperty({
    example: 'Rua das Flores, 120, Bairro Jardim, São Paulo - SP',
    description: 'Endereço completo onde a obra/instalação será realizada',
  })
  @IsString()
  @IsNotEmpty({ message: 'Endereço da obra é obrigatório' })
  enderecoObra!: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF ou CNPJ do cliente',
  })
  @IsString()
  @IsOptional()
  cpfCnpj?: string;
}

/**
 * Payload de entrada para concretizar e cadastrar um novo orçamento (CU06).
 */
export class CreateOrcamentoDto {
  @ApiProperty({
    example: 'calc-pvc-001',
    description:
      'Identificador do cálculo de materiais previamente realizado e aprovado no CU05',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do cálculo de materiais é obrigatório' })
  calculoMateriaisId!: string;

  @ApiProperty({
    type: ClienteOrcamentoDto,
    description: 'Dados cadastrais do cliente e endereço da obra',
  })
  @ValidateNested()
  @Type(() => ClienteOrcamentoDto)
  cliente!: ClienteOrcamentoDto;

  @ApiProperty({
    example: 650.0,
    description: 'Valor cobrado pela mão de obra de instalação',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Valor da mão de obra deve ser numérico' })
  @Min(0, { message: 'Valor da mão de obra não pode ser negativo' })
  valorMaoDeObra!: number;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Valor de desconto concedido na negociação',
    default: 0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Valor do desconto deve ser numérico' })
  @Min(0, { message: 'Valor do desconto não pode ser negativo' })
  @IsOptional()
  valorDesconto?: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Prazo de validade da proposta em dias',
    default: 15,
  })
  @IsNumber()
  @Min(1, { message: 'Validade deve ser de no mínimo 1 dia' })
  @IsOptional()
  validadeDias?: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'Se true, o orçamento já nasce na situação Emitido. Se false, é salvo como Rascunho.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  emitirImediatamente?: boolean;
}
