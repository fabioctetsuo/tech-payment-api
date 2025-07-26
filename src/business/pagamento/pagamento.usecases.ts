import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreatePagamentoDto } from '../../application/dto/pagamento.dto';
import { Pagamento } from '../../domain/pagamento/pagamento.entity';
import { PaymentProviderPort } from '../../domain/ports/payment-provider.port';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { PagamentoRepository } from '../../infrastructure/persistence/repositories/pagamento.repository';
import { PAYMENT_PROVIDER } from '../../domain/ports/payment-provider.port';

@Injectable()
export class PagamentoUseCases {
  private readonly logger = new Logger(PagamentoUseCases.name);

  constructor(
    private pagamentoRepository: PagamentoRepository,
    @Inject(PAYMENT_PROVIDER)
    private paymentProvider: PaymentProviderPort,
  ) {}

  async create(dados: CreatePagamentoDto) {
    this.logger.log(`Criando pagamento para o pedido ${dados.pedido_id}`);
    const pagamento = new Pagamento({
      ...dados,
      status: PaymentStatus.PENDING,
    });

    const createdPagamento = await this.pagamentoRepository.save(pagamento);
    this.logger.log(
      `Pagamento salvo com ID: ${createdPagamento.id} para o pedido ${dados.pedido_id} com status ${createdPagamento.status}`,
    );

    pagamento.id = createdPagamento.id;

    this.logger.log(
      `Iniciando processamento do pagamento ${pagamento.id} para o pedido ${pagamento.pedido_id}`,
    );
    const paymentStatus = await this.paymentProvider.processPayment(pagamento);
    pagamento.updateStatus(paymentStatus);

    this.logger.log(
      `Serviço externo de pagamento retornou pedido ${pagamento.pedido_id} com status ${paymentStatus}`,
    );

    return this.pagamentoRepository.save(pagamento);
  }

  async updateStatus(pagamentoId: string, status: PaymentStatus) {
    const pagamento = await this.pagamentoRepository.findById(pagamentoId);
    
    if (!pagamento) {
      throw new Error(`Pagamento com ID ${pagamentoId} não encontrado`);
    }

    pagamento.updateStatus(status);
    return this.pagamentoRepository.update(pagamentoId, pagamento);
  }

  async findById(id: string) {
    return this.pagamentoRepository.findById(id);
  }

  async findByPedidoId(pedidoId: string) {
    return this.pagamentoRepository.findByPedidoId(pedidoId);
  }
}
