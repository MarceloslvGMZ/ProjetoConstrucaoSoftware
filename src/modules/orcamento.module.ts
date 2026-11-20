import { Module } from '@nestjs/common';
import { OrcamentoController } from '../controllers/orcamento.controller';
import { OrcamentoRepository } from '../repositories/orcamento.repository';
import {
  CalculoMateriaisContract,
  CalculoMateriaisStubService,
} from '../services/contracts/calculo-materiais.contract';
import { OrcamentoService } from '../services/orcamento.service';

/**
 * Módulo encapsulado do Caso de Uso 06 – Emitir Orçamento.
 */
@Module({
  controllers: [OrcamentoController],
  providers: [
    OrcamentoService,
    OrcamentoRepository,
    {
      provide: CalculoMateriaisContract,
      useClass: CalculoMateriaisStubService,
    },
  ],
  exports: [OrcamentoService, OrcamentoRepository, CalculoMateriaisContract],
})
export class OrcamentoModule {}
