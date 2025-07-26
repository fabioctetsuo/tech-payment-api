import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WebhookPagamentoDto } from '../dto/webhook.dto';
import { PagamentoService } from '../../business/pagamento/pagamento.service';
import { OrderService } from '../../infrastructure/external/order/order.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  
  constructor(
    private pagamentoService: PagamentoService,
    private orderService: OrderService,
  ) {}

  @Post('/payment')
  @ApiOperation({ summary: 'Webhook para atualização de status de pagamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async updatePaymentStatus(@Body() webhookData: WebhookPagamentoDto) {
    this.logger.log(
      `Recebendo webhook de atualização de status para pagamento ${webhookData.id}: ${webhookData.status}`,
    );

    try {
      const updatedPagamento = await this.pagamentoService.updateStatus(
        webhookData.id,
        webhookData.status,
      );

      this.logger.log(
        `Status do pagamento ${webhookData.id} atualizado para ${webhookData.status}`,
      );

      // If payment is approved, confirm the order
      if (webhookData.status === PaymentStatus.APPROVED) {
        this.logger.log(
          `Pagamento aprovado, confirmando pedido ${webhookData.pedido_id}`,
        );
        
        try {
          await this.orderService.confirmOrder(webhookData.pedido_id);
          this.logger.log(
            `Pedido ${webhookData.pedido_id} confirmado com sucesso`,
          );
        } catch (orderError) {
          this.logger.error(
            `Erro ao confirmar pedido ${webhookData.pedido_id}: ${orderError.message}`,
          );
          // Don't fail the webhook if order confirmation fails
          // The payment status is already updated
        }
      }

      return {
        success: true,
        message: 'Status atualizado com sucesso',
        data: updatedPagamento,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar status do pagamento ${webhookData.id}: ${error.message}`,
      );
      throw error;
    }
  }
} 