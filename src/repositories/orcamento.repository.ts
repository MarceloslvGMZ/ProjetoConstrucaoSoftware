import { Injectable } from '@nestjs/common';
import { OrcamentoFiltroDto } from '../models/orcamento/orcamento-filtro.dto';
import { Orcamento } from '../models/orcamento/orcamento.model';

/**
 * Camada de persistência in-memory do Orçamento (CU06).
 */
@Injectable()
export class OrcamentoRepository {
  private readonly orcamentos: Orcamento[] = [];
  private sequencialNumero = 1000;

  proximoNumero(): Promise<number> {
    this.sequencialNumero += 1;
    return Promise.resolve(this.sequencialNumero);
  }

  create(orcamento: Orcamento): Promise<Orcamento> {
    this.orcamentos.push(orcamento);
    return Promise.resolve(orcamento);
  }

  findAll(): Promise<Orcamento[]> {
    return Promise.resolve([...this.orcamentos]);
  }

  findById(id: string): Promise<Orcamento | undefined> {
    return Promise.resolve(this.orcamentos.find((o) => o.id === id));
  }

  findByNumero(numero: number): Promise<Orcamento | undefined> {
    return Promise.resolve(this.orcamentos.find((o) => o.numero === numero));
  }

  search(filtros?: OrcamentoFiltroDto): Promise<Orcamento[]> {
    if (!filtros) {
      return this.findAll();
    }

    return Promise.resolve(
      this.orcamentos.filter((orcamento) => {
        if (
          filtros.numero !== undefined &&
          orcamento.numero !== filtros.numero
        ) {
          return false;
        }

        if (
          filtros.cliente?.trim() &&
          !orcamento.cliente.nome
            .toLowerCase()
            .includes(filtros.cliente.trim().toLowerCase())
        ) {
          return false;
        }

        if (filtros.situacao && orcamento.situacao !== filtros.situacao) {
          return false;
        }

        if (filtros.periodoInicial) {
          const dataInicial = new Date(filtros.periodoInicial);
          const dataReferencia = orcamento.dataEmissao ?? orcamento.criadoEm;
          if (dataReferencia < dataInicial) {
            return false;
          }
        }

        if (filtros.periodoFinal) {
          const dataFinal = new Date(filtros.periodoFinal);
          dataFinal.setHours(23, 59, 59, 999);
          const dataReferencia = orcamento.dataEmissao ?? orcamento.criadoEm;
          if (dataReferencia > dataFinal) {
            return false;
          }
        }

        return true;
      }),
    );
  }

  update(orcamento: Orcamento): Promise<Orcamento> {
    const index = this.orcamentos.findIndex((item) => item.id === orcamento.id);
    if (index === -1) {
      return Promise.reject(
        new Error(`Orçamento com ID ${orcamento.id} não encontrado`),
      );
    }
    this.orcamentos[index] = orcamento;
    return Promise.resolve(orcamento);
  }

  delete(id: string): Promise<void> {
    const index = this.orcamentos.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.orcamentos.splice(index, 1);
    }
    return Promise.resolve();
  }
}
