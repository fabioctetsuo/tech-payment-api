import { Injectable, Logger } from '@nestjs/common';
import { PaymentProviderPort } from '../../../domain/ports/payment-provider.port';
import { PaymentService } from './payment.service';
import { Pagamento } from '../../../domain/pagamento/pagamento.entity';
import { PaymentStatus } from '../../../domain/pagamento/pagamento.types';

@Injectable()
export class PaymentAdapter implements PaymentProviderPort {
  private readonly logger = new Logger(PaymentAdapter.name);
  constructor(private paymentService: PaymentService) {}

  async processPayment(pagamento: Pagamento): Promise<PaymentStatus> {
    this.logger.log('payment-adapter: Processando pagamento...');
    return this.paymentService.processPayment(pagamento);
  }
}
