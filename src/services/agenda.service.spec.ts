import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioAutenticado } from '../auth/usuario-autenticado';
import { CreateAgendamentoDto } from '../models/agenda/create-agendamento.dto';
import { SituacaoAgendamento } from '../models/agenda/agendamento.model';
import { AgendamentoRepository } from '../repositories/agendamento.repository';
import { OrcamentoRepository } from '../repositories/orcamento.repository';
import {
  CalculoMateriaisContract,
  CalculoMateriaisStubService,
} from './contracts/calculo-materiais.contract';
import { AgendaService } from './agenda.service';
import { OrcamentoService } from './orcamento.service';

describe('AgendaService (CU07 – Manter Agenda)', () => {
  let agendaService: AgendaService;
  let orcamentoService: OrcamentoService;

  const usuarioMock: UsuarioAutenticado = {
    id: 'user-instala-1',
    nome: 'Instalador Teste',
    email: 'instalacao@forros.com',
    funcao: 'Instalacao',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        AgendamentoRepository,
        OrcamentoService,
        OrcamentoRepository,
        {
          provide: CalculoMateriaisContract,
          useClass: CalculoMateriaisStubService,
        },
      ],
    }).compile();

    agendaService = module.get<AgendaService>(AgendaService);
    orcamentoService = module.get<OrcamentoService>(OrcamentoService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(agendaService).toBeDefined();
    expect(orcamentoService).toBeDefined();
  });

  describe('criar', () => {
    it('deve agendar uma ordem de serviço vinculada a um orçamento aprovado', async () => {
      // 1. Criar e aprovar orçamento
      const orcamento = await orcamentoService.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Marina Santos',
            telefone: '(11) 98888-7777',
            enderecoObra: 'Rua das Palmeiras, 300',
          },
          valorMaoDeObra: 600,
        },
        usuarioMock,
      );
      await orcamentoService.aprovar(orcamento.id, usuarioMock);

      // 2. Agendar serviço
      const dto: CreateAgendamentoDto = {
        orcamentoId: orcamento.id,
        dataInicio: '2026-11-25T08:00:00.000Z',
        dataFimPrevisao: '2026-11-25T17:00:00.000Z',
        descricaoServico: 'Instalação completa com cantoneiras',
        equipeOuInstalador: 'Equipe 1',
      };

      const agendamento = await agendaService.criar(dto, usuarioMock);

      expect(agendamento).toBeDefined();
      expect(agendamento.orcamentoId).toBe(orcamento.id);
      expect(agendamento.numeroOrcamento).toBe(orcamento.numero);
      expect(agendamento.clienteNome).toBe('Marina Santos');
      expect(agendamento.valorAcordado).toBe(orcamento.valorTotal);
      expect(agendamento.materiaisResumo.length).toBeGreaterThan(0);
      expect(agendamento.situacao).toBe(SituacaoAgendamento.AGENDADO);

      // 3. Verificar que o orçamento agora está congelado
      const orcamentoConsultado = await orcamentoService.buscarPorId(
        orcamento.id,
      );
      expect(orcamentoConsultado.possuiAgendamento).toBe(true);
    });

    it('deve rejeitar agendamento se o orçamento não estiver aprovado', async () => {
      // Orçamento apenas criado (Emitido, mas não Aprovado)
      const orcamento = await orcamentoService.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente Não Aprovado',
            telefone: '11988887777',
            enderecoObra: 'Rua X',
          },
          valorMaoDeObra: 500,
        },
        usuarioMock,
      );

      const dto: CreateAgendamentoDto = {
        orcamentoId: orcamento.id,
        dataInicio: '2026-11-25T08:00:00.000Z',
        descricaoServico: 'Instalação',
      };

      await expect(agendaService.criar(dto, usuarioMock)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve impedir duplicidade de agendamento ativo para o mesmo orçamento', async () => {
      const orcamento = await orcamentoService.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente Duplicidade',
            telefone: '11988887777',
            enderecoObra: 'Rua Y',
          },
          valorMaoDeObra: 500,
        },
        usuarioMock,
      );
      await orcamentoService.aprovar(orcamento.id, usuarioMock);

      const dto: CreateAgendamentoDto = {
        orcamentoId: orcamento.id,
        dataInicio: '2026-11-25T08:00:00.000Z',
        descricaoServico: 'Primeiro agendamento',
      };

      await agendaService.criar(dto, usuarioMock);

      // Tentativa de segundo agendamento
      await expect(agendaService.criar(dto, usuarioMock)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve liberar o orçamento caso o agendamento seja cancelado ou excluído', async () => {
      const orcamento = await orcamentoService.criar(
        {
          calculoMateriaisId: 'calc-pvc-001',
          cliente: {
            nome: 'Cliente Cancelamento',
            telefone: '11988887777',
            enderecoObra: 'Rua Z',
          },
          valorMaoDeObra: 500,
        },
        usuarioMock,
      );
      await orcamentoService.aprovar(orcamento.id, usuarioMock);

      const agendamento = await agendaService.criar(
        {
          orcamentoId: orcamento.id,
          dataInicio: '2026-11-25T08:00:00.000Z',
          descricaoServico: 'Agendamento a cancelar',
        },
        usuarioMock,
      );

      // Excluir agendamento
      await agendaService.excluir(agendamento.id);

      const orcamentoLiberado = await orcamentoService.buscarPorId(
        orcamento.id,
      );
      expect(orcamentoLiberado.possuiAgendamento).toBe(false);
    });
  });
});
