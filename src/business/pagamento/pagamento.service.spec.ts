import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoService } from './pagamento.service';
import { PagamentoUseCases } from './pagamento.usecases';
import { CreatePagamentoDto } from '../../application/dto/pagamento.dto';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { Pagamento } from '../../domain/pagamento/pagamento.entity';

describe('PagamentoService', () => {
  let service: PagamentoService;
  let mockUseCases: Partial<PagamentoUseCases>;

  beforeEach(async () => {
    mockUseCases = {
      create: jest.fn(),
      findByPedidoId: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoService,
        { provide: PagamentoUseCases, useValue: mockUseCases },
      ],
    }).compile();

    service = module.get<PagamentoService>(PagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      (mockUseCases.create as jest.Mock).mockResolvedValue(expectedPayment);

      const result = await service.create(createDto);

      expect(mockUseCases.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedPayment);
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

      (mockUseCases.findByPedidoId as jest.Mock).mockResolvedValue(
        expectedPayment,
      );

      const result = await service.findByPedidoId(pedidoId);

      expect(mockUseCases.findByPedidoId).toHaveBeenCalledWith(pedidoId);
      expect(result).toEqual(expectedPayment);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      const pagamentoId = 'payment-123';
      const newStatus = PaymentStatus.APPROVED;
      const expectedPayment = new Pagamento({
        id: pagamentoId,
        pedido_id: '123',
        valor: 100.5,
        status: newStatus,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockUseCases.updateStatus as jest.Mock).mockResolvedValue(
        expectedPayment,
      );

      const result = await service.updateStatus(pagamentoId, newStatus);

      expect(mockUseCases.updateStatus).toHaveBeenCalledWith(
        pagamentoId,
        newStatus,
      );
      expect(result).toEqual(expectedPayment);
    });
  });
});
