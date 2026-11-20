import { Injectable } from '@nestjs/common';

/**
 * Representação de um item de material/insumo calculado no CU05 (Cálculo de Materiais).
 * Os produtos são confeccionados sob encomenda e sob medida.
 */
export interface ItemCalculadoDto {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitarioEstimado: number;
  valorTotal: number;
}

/**
 * Estrutura do cálculo de materiais aprovado originado do CU05.
 * Serve como base técnica obrigatória para a concretização do orçamento (CU06).
 */
export interface CalculoMateriaisAprovadoDto {
  id: string;
  tipoServico: string;
  descricaoAmbientes: string;
  areaTotalM2: number;
  valorEstimadoMateriais: number;
  itens: ItemCalculadoDto[];
  dataCalculo: Date;
}

/**
 * Contrato de integração com o Caso de Uso 05 – Cálculo de Materiais.
 * A implementação real deste caso de uso está sob a responsabilidade de outro membro da equipe.
 */
export abstract class CalculoMateriaisContract {
  abstract obterCalculoPorId(
    id: string,
  ): Promise<CalculoMateriaisAprovadoDto | null>;
  abstract listarCalculosDisponiveisParaOrcamento(): Promise<
    CalculoMateriaisAprovadoDto[]
  >;
}

/**
 * Implementação Mock/Stub em memória do contrato do CU05.
 * Permite que o CU06 (Emitir Orçamento) funcione de forma autônoma e completa nos testes e no ambiente de execução.
 */
@Injectable()
export class CalculoMateriaisStubService implements CalculoMateriaisContract {
  private readonly calculos: CalculoMateriaisAprovadoDto[] = [
    {
      id: 'calc-pvc-001',
      tipoServico: 'Forro de PVC Branco',
      descricaoAmbientes: 'Sala (4x5m) e Quarto Casal (3x4m)',
      areaTotalM2: 32,
      valorEstimadoMateriais: 1450.0,
      itens: [
        {
          descricao: 'Régua de PVC Branco 20cm x 6m (sob medida)',
          quantidade: 28,
          unidade: 'barra',
          valorUnitarioEstimado: 35.0,
          valorTotal: 980.0,
        },
        {
          descricao: 'Perfil Cantoneira PVC 6m',
          quantidade: 6,
          unidade: 'barra',
          valorUnitarioEstimado: 25.0,
          valorTotal: 150.0,
        },
        {
          descricao: 'Emenda H de PVC 6m',
          quantidade: 4,
          unidade: 'barra',
          valorUnitarioEstimado: 30.0,
          valorTotal: 120.0,
        },
        {
          descricao: 'Kit de Fixação e Parafusos',
          quantidade: 2,
          unidade: 'kit',
          valorUnitarioEstimado: 100.0,
          valorTotal: 200.0,
        },
      ],
      dataCalculo: new Date(),
    },
    {
      id: 'calc-drywall-002',
      tipoServico: 'Drywall Rebaixamento',
      descricaoAmbientes: 'Escritório Comercial (6x8m)',
      areaTotalM2: 48,
      valorEstimadoMateriais: 2890.0,
      itens: [
        {
          descricao: 'Placa Drywall Standard 1,20x1,80m',
          quantidade: 24,
          unidade: 'placa',
          valorUnitarioEstimado: 65.0,
          valorTotal: 1560.0,
        },
        {
          descricao: 'Canaleta e Perfil Metálico Estrutural',
          quantidade: 18,
          unidade: 'barra',
          valorUnitarioEstimado: 45.0,
          valorTotal: 810.0,
        },
        {
          descricao: 'Kit Massa e Fita de Acabamento',
          quantidade: 4,
          unidade: 'kit',
          valorUnitarioEstimado: 130.0,
          valorTotal: 520.0,
        },
      ],
      dataCalculo: new Date(),
    },
  ];

  obterCalculoPorId(id: string): Promise<CalculoMateriaisAprovadoDto | null> {
    const item = this.calculos.find((c) => c.id === id);
    return Promise.resolve(item ? { ...item } : null);
  }

  listarCalculosDisponiveisParaOrcamento(): Promise<
    CalculoMateriaisAprovadoDto[]
  > {
    return Promise.resolve(this.calculos.map((c) => ({ ...c })));
  }
}
