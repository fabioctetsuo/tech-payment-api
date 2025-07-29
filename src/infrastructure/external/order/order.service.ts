import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly httpService: HttpService) {}

  async confirmOrder(orderId: string): Promise<void> {
    const orderApiUrl = process.env.ORDER_API_URL || 'http://localhost:3002';
    const confirmUrl = `${orderApiUrl}/pedidos/${orderId}/confirmar`;

    this.logger.log(`Confirmando pedido ${orderId} via API: ${confirmUrl}`);

    try {
      const response = await firstValueFrom(
        this.httpService.put(
          confirmUrl,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`Pedido ${orderId} confirmado com sucesso`);
    } catch (error) {
      this.logger.error(
        `Erro ao confirmar pedido ${orderId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Re-throw the error so the webhook can handle it appropriately
      throw error;
    }
  }
}
