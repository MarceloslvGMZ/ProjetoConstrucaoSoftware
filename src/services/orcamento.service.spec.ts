import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioAutenticado } from '../auth/usuario-autenticado';
import { CreateOrcamentoDto } from '../models/orcamento/create-orcamento.dto';
import { SituacaoOrcamento } from '../models/orcamento/orcamento.model';
import { OrcamentoRepository } from '../repositories/orcamento.repository';
import {
  CalculoMateriaisContract,
  CalculoMateriaisStubService,
} from './contracts/calculo-materiais.contract';
import { OrcamentoService } from './orcamento.service';

describe('OrcamentoService (CU06 – Emitir Orçamento)', () => {
  let service: OrcamentoService;

  const usuarioMock: UsuarioAutenticado = {
    id: 'user-vendas-1',
    nome: 'Vendedor Teste',
    email: 'vendas@forros.com',
    funcao: 'Vendas',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrcamentoService,
        OrcamentoRepository,
        {
          provide: CalculoMateriaisContract,
          useClass: CalculoMateriaisStubService,
        },
      ],
    }).compile();

    service = module.get<OrcamentoService>(OrcamentoService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  describe('criar', () => {
    it('deve concretizar o orçamento a partir do cálculo de materiais sob encomenda', async () => {
      const dto: CreateOrcamentoDto = {
        calculoMateriaisId: 'calc-pvc-001',
        cliente: {
          nome: 'Roberto Carlos',
          telefone: '(11) 99999-1234',
          enderecoObra: 'Av. Paulista, 1000',
        },
        valorMaoDeObra: 600,
        valorDesconto: 50,
        validadeDias: 15,
        emitirImediatamente: true,
      };

      const orcamento = await service.criar(dto, usuarioMock);

      expect(orcamento).toBeDefined();
      expect(orcamento.numero).toBeGreaterThanOrEqual(1001);
      expect(orcamento.cliente.nome).toBe('Roberto Carlos');
      expect(orcamento.tipoServico).toBe('Forro de PVC Branco');
      expect(orcamento.valorMateriais).toBe(1450.0);
      expect(orcamento.valorMaoDeObra).toBe(600);
      expect(orcamento.valorDesconto).toBe(50);
      // Total = 1450 + 600 - 50 = 2000
      expect(orcamento.valorTotal).toBe(2000);
      expect(orcamento.situacao).toBe(SituacaoOrcamento.EMITIDO);
      expect(orcamento.dataEmissao).toBeDefined();
      expect(orcamento.itens.length).toBe(4);
      expect(orcamento.historico.length).toBe(1);
      expect(orcamento.historico[0].acao).toBe('CRIACAO');
    });

    it('deve lançar NotFoundException se o cálculo de materiais não existir', async () => {
      const dto: CreateOrcamentoDto = {
        calculoMateriaisId: 'calc-inexistente',
        cliente: {
          nome: 'Teste',
          telefone: '12345678',
          enderecoObra: 'Rua Teste',
        },
        valorMaoDeObra: 500,
      };

      await expect(service.criar(dto, usuarioMock)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se o desconto for superior ao subtotal', async () => {
      const dto: CreateOrcamentoDto = {
        calculoMateriaisId: 'calc-pvc-001', // valorMateriais = 1450
        cliente: {
          nome: 'Teste',
          telefone: '12345678',
          enderecoObra: 'Rua Teste',
        },
        valorMaoDeObra: 50, // subtotal = 1500
        valorDesconto: 1600, // desconto > subtotal
      };

      await expect(service.criar(dto, usuarioMock)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('fluxo de aprovação e bloqueio', () => {
    it('deve permitir aprovar orçamento emitido e disponibilizá-lo para agendamento', async () => {
      const orcamentoCriado = await service.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente Aprovador',
            telefone: '11999998888',
            enderecoObra: 'Rua Central, 50',
          },
          valorMaoDeObra: 500,
        },
        usuarioMock,
      );

      const aprovado = await service.aprovar(orcamentoCriado.id, usuarioMock);
      expect(aprovado.situacao).toBe(SituacaoOrcamento.APROVADO);

      const disponiveis = await service.listarAprovadosParaAgendamento();
      expect(disponiveis.some((o) => o.id === aprovado.id)).toBe(true);
    });

    it('deve impedir alteração de orçamento quando já possui agendamento de serviço', async () => {
      const orcamentoCriado = await service.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente com Agendamento',
            telefone: '11999998888',
            enderecoObra: 'Rua Central, 50',
          },
          valorMaoDeObra: 500,
        },
        usuarioMock,
      );

      await service.marcarAgendamentoVinculado(orcamentoCriado.id, true);

      await expect(
        service.atualizar(
          orcamentoCriado.id,
          { valorMaoDeObra: 700 },
          usuarioMock,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('não deve permitir exclusão de orçamento emitido', async () => {
      const orcamentoCriado = await service.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente Emitido',
            telefone: '11999998888',
            enderecoObra: 'Rua Central, 50',
          },
          valorMaoDeObra: 500,
          emitirImediatamente: true,
        },
        usuarioMock,
      );

      await expect(service.excluir(orcamentoCriado.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
