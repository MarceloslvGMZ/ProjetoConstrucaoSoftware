import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Payload de entrada para cadastrar um novo agendamento / compromisso (CU07 – UC02).
 * Requer um orçamento previamente aprovado pelo cliente.
 */
export class CreateAgendamentoDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Identificador do orçamento previamente APROVADO no CU06',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do orçamento aprovado é obrigatório' })
  orcamentoId!: string;

  @ApiProperty({
    example: '2026-11-25T08:00:00.000Z',
    description: 'Data e horário de início da execução do serviço',
  })
  @IsDateString(
    {},
    {
      message:
        'Data de início deve estar em formato ISO válido (ex: YYYY-MM-DDTHH:mm:ssZ)',
    },
  )
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  dataInicio!: string;

  @ApiPropertyOptional({
    example: '2026-11-26T17:00:00.000Z',
    description: 'Previsão de conclusão do serviço',
  })
  @IsDateString(
    {},
    { message: 'Data de previsão de término deve estar em formato ISO válido' },
  )
  @IsOptional()
  dataFimPrevisao?: string;

  @ApiProperty({
    example:
      'Instalação de forro de PVC branco com 2 pontos de iluminação e acabamento em cantoneira',
    description: 'Descrição detalhada do serviço e instruções para a equipe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Descrição do serviço é obrigatória' })
  descricaoServico!: string;

  @ApiPropertyOptional({
    example: 'Equipe Alpha (Marcos e Tiago)',
    description: 'Identificação do instalador ou equipe responsável',
  })
  @IsString()
  @IsOptional()
  equipeOuInstalador?: string;

  @ApiPropertyOptional({
    example: '(11) 98765-4321',
    description:
      'Telefone de contato do cliente (se omitido, utiliza o do orçamento)',
  })
  @IsString()
  @IsOptional()
  clienteTelefone?: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF ou CNPJ do cliente (se omitido, utiliza o do orçamento)',
  })
  @IsString()
  @IsOptional()
  clienteCpfCnpj?: string;
}
