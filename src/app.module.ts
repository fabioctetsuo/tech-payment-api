import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/persistence/mongoose/mongoose.module';
import { PagamentoController } from './application/rest/pagamento.api';
import { WebhookController } from './application/rest/webhook.api';
import { PagamentoService } from './business/pagamento/pagamento.service';
import { PagamentoRepository } from './infrastructure/persistence/repositories/pagamento.repository';
import { PagamentoUseCases } from './business/pagamento/pagamento.usecases';
import { HealthModule } from './infrastructure/health/health.module';
import { PaymentModule } from './infrastructure/external/payment/payment.module';
import { OrderModule } from './infrastructure/external/order/order.module';

@Module({
  imports: [DatabaseModule, HealthModule, PaymentModule, OrderModule],
  controllers: [PagamentoController, WebhookController],
  providers: [PagamentoService, PagamentoRepository, PagamentoUseCases],
})
export class AppModule {}
