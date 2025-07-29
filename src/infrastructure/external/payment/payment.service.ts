import { Injectable, Logger } from '@nestjs/common';
import { PaymentProviderPort } from '../../../domain/ports/payment-provider.port';
import { Pagamento } from '../../../domain/pagamento/pagamento.entity';
import { PaymentStatus } from '../../../domain/pagamento/pagamento.types';
import {
  ValidationException,
  ValidationErrorType,
} from '../../../domain/exceptions/validation.exception';

@Injectable()
export class PaymentService implements PaymentProviderPort {
  private readonly logger = new Logger(PaymentService.name);

  async processPayment(pagamento: Pagamento): Promise<PaymentStatus> {
    try {
      const response = await fetch(
        `${process.env.MOCK_PAYMENT_SERVICE_URL}/pagamentos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: pagamento.id,
            pedido_id: pagamento.pedido_id,
            valor: pagamento.valor,
          }),
        },
      );

      if (!response.ok) {
        this.logger.error(
          `Payment service responded with status ${response.status}: ${response.statusText}`,
        );
        throw new ValidationException(
          ValidationErrorType.PAYMENT_PROCESSING_ERROR,
        );
      }

      const result = (await response.json()) as { status: PaymentStatus };
      return result.status;
    } catch (error) {
      this.logger.error(
        `Erro ao processar pagamento para o pedido ${pagamento.pedido_id}: ${error}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof TypeError && error.message === 'fetch failed') {
        this.logger.error(
          'Could not connect to payment service. Is it running?',
        );
      }

      throw new ValidationException(
        ValidationErrorType.PAYMENT_PROCESSING_ERROR,
      );
    }
  }
}
