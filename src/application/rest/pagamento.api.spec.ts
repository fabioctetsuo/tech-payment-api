import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoController } from './pagamento.api';
import { PagamentoService } from '../../business/pagamento/pagamento.service';
import { CreatePagamentoDto } from '../dto/pagamento.dto';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { Pagamento } from '../../domain/pagamento/pagamento.entity';

describe('PagamentoController', () => {
  let controller: PagamentoController;
  let mockService: Partial<PagamentoService>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findByPedidoId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoController],
      providers: [{ provide: PagamentoService, useValue: mockService }],
    }).compile();

    controller = module.get<PagamentoController>(PagamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      const createDto: CreatePagamentoDto = {
        pedido_id: '123',
        valor: 100.5,
      };

      const expectedPayment = new Pagamento({
        id: 'payment-123',
        ...createDto,
        status: PaymentStatus.APPROVED,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockService.create as jest.Mock).mockResolvedValue(expectedPayment);

      const result = await controller.create(createDto);

      expect(mockService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedPayment);
    });

    it('should handle service errors', async () => {
      const createDto: CreatePagamentoDto = {
        pedido_id: '123',
        valor: 100.5,
      };

      const error = new Error('Service unavailable');
      (mockService.create as jest.Mock).mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Service unavailable',
      );
    });
  });

  describe('findByPedidoId', () => {
    it('should find payment by order id', async () => {
      const pedidoId = '123';
      const expectedPayment = new Pagamento({
        id: 'payment-123',
        pedido_id: pedidoId,
        valor: 100.5,
        status: PaymentStatus.APPROVED,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockService.findByPedidoId as jest.Mock).mockResolvedValue(
        expectedPayment,
      );

      const result = await controller.findByPedidoId(pedidoId);

      expect(mockService.findByPedidoId).toHaveBeenCalledWith(pedidoId);
      expect(result).toEqual(expectedPayment);
    });

    it('should handle not found scenarios', async () => {
      const pedidoId = '123';
      (mockService.findByPedidoId as jest.Mock).mockResolvedValue(null);

      const result = await controller.findByPedidoId(pedidoId);

      expect(mockService.findByPedidoId).toHaveBeenCalledWith(pedidoId);
      expect(result).toBeNull();
    });
  });
});
