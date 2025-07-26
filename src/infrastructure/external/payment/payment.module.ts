import { Module } from '@nestjs/common';
import { PaymentAdapter } from './payment.adapter';
import { PaymentService } from './payment.service';
import { PAYMENT_PROVIDER } from '../../../domain/ports/payment-provider.port';

@Module({
  providers: [
    PaymentService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: PaymentAdapter,
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentModule {}
