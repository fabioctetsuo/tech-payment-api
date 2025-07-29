import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.api';
import { PagamentoService } from '../../business/pagamento/pagamento.service';
import { OrderService } from '../../infrastructure/external/order/order.service';
import { WebhookPagamentoDto } from '../dto/webhook.dto';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { Pagamento } from '../../domain/pagamento/pagamento.entity';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockPagamentoService: Partial<PagamentoService>;
  let mockOrderService: Partial<OrderService>;

  beforeEach(async () => {
    mockPagamentoService = {
      updateStatus: jest.fn(),
    };

    mockOrderService = {
      confirmOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: PagamentoService, useValue: mockPagamentoService },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const webhookData: WebhookPagamentoDto = {
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.REJECTED,
        valor: 100.5,
      };

      const updatedPayment = new Pagamento({
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.REJECTED,
        valor: 100.5,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockPagamentoService.updateStatus as jest.Mock).mockResolvedValue(
        updatedPayment,
      );

      const result = await controller.updatePaymentStatus(webhookData);

      expect(mockPagamentoService.updateStatus).toHaveBeenCalledWith(
        webhookData.id,
        webhookData.status,
      );
      expect(mockOrderService.confirmOrder).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Status atualizado com sucesso',
        data: updatedPayment,
      });
    });

    it('should confirm order when payment is approved', async () => {
      const webhookData: WebhookPagamentoDto = {
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
      };

      const updatedPayment = new Pagamento({
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockPagamentoService.updateStatus as jest.Mock).mockResolvedValue(
        updatedPayment,
      );
      (mockOrderService.confirmOrder as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.updatePaymentStatus(webhookData);

      expect(mockPagamentoService.updateStatus).toHaveBeenCalledWith(
        webhookData.id,
        webhookData.status,
      );
      expect(mockOrderService.confirmOrder).toHaveBeenCalledWith('order-456');
      expect(result).toEqual({
        success: true,
        message: 'Status atualizado com sucesso',
        data: updatedPayment,
      });
    });

    it('should handle order confirmation failure gracefully', async () => {
      const webhookData: WebhookPagamentoDto = {
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
      };

      const updatedPayment = new Pagamento({
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockPagamentoService.updateStatus as jest.Mock).mockResolvedValue(
        updatedPayment,
      );
      (mockOrderService.confirmOrder as jest.Mock).mockRejectedValue(
        new Error('Order service unavailable'),
      );

      const result = await controller.updatePaymentStatus(webhookData);

      expect(mockPagamentoService.updateStatus).toHaveBeenCalledWith(
        webhookData.id,
        webhookData.status,
      );
      expect(mockOrderService.confirmOrder).toHaveBeenCalledWith('order-456');
      expect(result).toEqual({
        success: true,
        message: 'Status atualizado com sucesso',
        data: updatedPayment,
      });
    });

    it('should throw error when payment service fails', async () => {
      const webhookData: WebhookPagamentoDto = {
        id: 'payment-123',
        pedido_id: 'order-456',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
      };

      const error = new Error('Payment not found');
      (mockPagamentoService.updateStatus as jest.Mock).mockRejectedValue(error);

      await expect(controller.updatePaymentStatus(webhookData)).rejects.toThrow(
        'Payment not found',
      );

      expect(mockPagamentoService.updateStatus).toHaveBeenCalledWith(
        webhookData.id,
        webhookData.status,
      );
      expect(mockOrderService.confirmOrder).not.toHaveBeenCalled();
    });
  });
});
