import { Pagamento } from '../pagamento/pagamento.entity';
import { PaymentStatus } from '../pagamento/pagamento.types';

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProviderPort {
  processPayment(pagamento: Pagamento): Promise<PaymentStatus>;
}
