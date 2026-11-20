import { Injectable } from '@nestjs/common';
import { AgendamentoFiltroDto } from '../models/agenda/agendamento-filtro.dto';
import { Agendamento } from '../models/agenda/agendamento.model';

/**
 * Camada de persistência in-memory do Agendamento (CU07).
 */
@Injectable()
export class AgendamentoRepository {
  private readonly agendamentos: Agendamento[] = [];

  create(agendamento: Agendamento): Promise<Agendamento> {
    this.agendamentos.push(agendamento);
    return Promise.resolve(agendamento);
  }

  findAll(): Promise<Agendamento[]> {
    return Promise.resolve([...this.agendamentos]);
  }

  findById(id: string): Promise<Agendamento | undefined> {
    return Promise.resolve(this.agendamentos.find((a) => a.id === id));
  }

  findByOrcamentoId(orcamentoId: string): Promise<Agendamento | undefined> {
    return Promise.resolve(
      this.agendamentos.find((a) => a.orcamentoId === orcamentoId),
    );
  }

  search(filtros?: AgendamentoFiltroDto): Promise<Agendamento[]> {
    if (!filtros) {
      return this.findAll();
    }

    return Promise.resolve(
      this.agendamentos.filter((item) => {
        if (
          filtros.cliente?.trim() &&
          !item.clienteNome
            .toLowerCase()
            .includes(filtros.cliente.trim().toLowerCase())
        ) {
          return false;
        }

        if (filtros.situacao && item.situacao !== filtros.situacao) {
          return false;
        }

        if (filtros.data) {
          // Filtro por dia específico (comparação de data sem considerar horário)
          const dataFiltroStr = filtros.data.split('T')[0];
          const dataItemStr = item.dataInicio.toISOString().split('T')[0];
          if (dataItemStr !== dataFiltroStr) {
            return false;
          }
        }

        if (filtros.dataInicio) {
          const inicio = new Date(filtros.dataInicio);
          if (item.dataInicio < inicio) {
            return false;
          }
        }

        if (filtros.dataFim) {
          const fim = new Date(filtros.dataFim);
          fim.setHours(23, 59, 59, 999);
          if (item.dataInicio > fim) {
            return false;
          }
        }

        return true;
      }),
    );
  }

  update(agendamento: Agendamento): Promise<Agendamento> {
    const index = this.agendamentos.findIndex((a) => a.id === agendamento.id);
    if (index === -1) {
      return Promise.reject(
        new Error(`Agendamento com ID ${agendamento.id} não encontrado`),
      );
    }
    this.agendamentos[index] = agendamento;
    return Promise.resolve(agendamento);
  }

  delete(id: string): Promise<void> {
    const index = this.agendamentos.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.agendamentos.splice(index, 1);
    }
    return Promise.resolve();
  }
}
