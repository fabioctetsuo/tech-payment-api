import { Injectable } from '@nestjs/common';
import { CreatePagamentoDto } from '../../application/dto/pagamento.dto';
import { PagamentoUseCases } from './pagamento.usecases';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';

@Injectable()
export class PagamentoService {
  constructor(private pagamentoUseCases: PagamentoUseCases) {}

  async create(dados: CreatePagamentoDto) {
    return this.pagamentoUseCases.create(dados);
  }

  async findByPedidoId(pedidoId: string) {
    return this.pagamentoUseCases.findByPedidoId(pedidoId);
  }

  async updateStatus(pagamentoId: string, status: PaymentStatus) {
    return this.pagamentoUseCases.updateStatus(pagamentoId, status);
  }
}
