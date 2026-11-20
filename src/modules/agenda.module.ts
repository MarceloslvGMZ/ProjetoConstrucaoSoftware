import { Module } from '@nestjs/common';
import { AgendaController } from '../controllers/agenda.controller';
import { AgendamentoRepository } from '../repositories/agendamento.repository';
import { AgendaService } from '../services/agenda.service';
import { OrcamentoModule } from './orcamento.module';

/**
 * Módulo encapsulado do Caso de Uso 07 – Manter Agenda.
 */
@Module({
  imports: [OrcamentoModule],
  controllers: [AgendaController],
  providers: [AgendaService, AgendamentoRepository],
  exports: [AgendaService, AgendamentoRepository],
})
export class AgendaModule {}
