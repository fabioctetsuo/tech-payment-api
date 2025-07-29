import { defineFeature, loadFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoUseCases } from './pagamento.usecases';
import { PagamentoRepository } from '../../infrastructure/persistence/repositories/pagamento.repository';
import {
  PaymentProviderPort,
  PAYMENT_PROVIDER,
} from '../../domain/ports/payment-provider.port';
import { Pagamento } from '../../domain/pagamento/pagamento.entity';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { CreatePagamentoDto } from '../../application/dto/pagamento.dto';

const feature = loadFeature('./src/features/pagamento.feature');

defineFeature(feature, (test) => {
  let pagamentoUseCases: PagamentoUseCases;
  let mockRepository: Partial<PagamentoRepository>;
  let mockPaymentProvider: Partial<PaymentProviderPort>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByPedidoId: jest.fn(),
      update: jest.fn(),
    };

    mockPaymentProvider = {
      processPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoUseCases,
        { provide: PagamentoRepository, useValue: mockRepository },
        { provide: PAYMENT_PROVIDER, useValue: mockPaymentProvider },
      ],
    }).compile();

    pagamentoUseCases = module.get<PagamentoUseCases>(PagamentoUseCases);
  });

  test('Creating a new payment', ({ given, when, then, and }) => {
    let paymentRequest: CreatePagamentoDto;
    let result: Pagamento;

    given(
      'a valid payment request with order id "123", customer id "456", and amount 100.50',
      () => {
        paymentRequest = {
          pedido_id: '123',
          valor: 100.5,
        };
      },
    );

    when('I create a payment', async () => {
      // Mock the first save call (creates payment with PENDING status)
      const pendingPagamento = new Pagamento({
        id: 'payment-id-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock the second save call (after processing)
      const approvedPagamento = new Pagamento({
        id: 'payment-id-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.APPROVED,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockRepository.save as jest.Mock)
        .mockResolvedValueOnce(pendingPagamento)
        .mockResolvedValueOnce(approvedPagamento);

      (mockPaymentProvider.processPayment as jest.Mock).mockResolvedValue(
        PaymentStatus.APPROVED,
      );

      result = await pagamentoUseCases.create(paymentRequest);
    });

    then('the payment should be created with status "PENDING"', () => {
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      // The first save call should be made during payment creation
      expect(mockRepository.save).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
      );
    });

    and('the payment should be processed through the payment provider', () => {
      expect(mockPaymentProvider.processPayment).toHaveBeenCalled();
    });

    and(
      'the payment status should be updated based on provider response',
      () => {
        expect(result.status).toBe(PaymentStatus.APPROVED);
      },
    );
  });

  test('Updating payment status', ({ given, when, then, and }) => {
    let paymentId: string;
    let existingPayment: Pagamento;
    let result: Pagamento;

    given('an existing payment with id "payment-123"', () => {
      paymentId = 'payment-123';
      existingPayment = new Pagamento({
        id: paymentId,
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockRepository.findById as jest.Mock).mockResolvedValue(existingPayment);
    });

    when('I update the payment status to "APPROVED"', async () => {
      const updatedPayment = new Pagamento({
        ...existingPayment,
        status: PaymentStatus.APPROVED,
        updated_at: new Date(),
      });

      (mockRepository.update as jest.Mock).mockResolvedValue(updatedPayment);

      result = await pagamentoUseCases.updateStatus(
        paymentId,
        PaymentStatus.APPROVED,
      );
    });

    then('the payment status should be "APPROVED"', () => {
      expect(result.status).toBe(PaymentStatus.APPROVED);
    });

    and('the updated timestamp should be current', () => {
      expect(mockRepository.update).toHaveBeenCalledWith(
        paymentId,
        expect.objectContaining({
          status: PaymentStatus.APPROVED,
        }),
      );
    });
  });

  test('Finding payment by order id', ({ given, when, then }) => {
    let orderId: string;
    let existingPayment: Pagamento;
    let result: Pagamento;

    given('a payment exists for order id "order-456"', () => {
      orderId = 'order-456';
      existingPayment = new Pagamento({
        id: 'payment-456',
        pedido_id: orderId,
        valor: 200.0,
        status: PaymentStatus.APPROVED,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (mockRepository.findByPedidoId as jest.Mock).mockResolvedValue(
        existingPayment,
      );
    });

    when('I search for payment by order id "order-456"', async () => {
      result = await pagamentoUseCases.findByPedidoId(orderId);
    });

    then('I should receive the payment details', () => {
      expect(result).toEqual(existingPayment);
      expect(result.pedido_id).toBe(orderId);
    });
  });
});

describe('PagamentoUseCases', () => {
  let pagamentoUseCases: PagamentoUseCases;
  let mockRepository: Partial<PagamentoRepository>;
  let mockPaymentProvider: Partial<PaymentProviderPort>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByPedidoId: jest.fn(),
      update: jest.fn(),
    };

    mockPaymentProvider = {
      processPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoUseCases,
        { provide: PagamentoRepository, useValue: mockRepository },
        { provide: PAYMENT_PROVIDER, useValue: mockPaymentProvider },
      ],
    }).compile();

    pagamentoUseCases = module.get<PagamentoUseCases>(PagamentoUseCases);
  });

  describe('updateStatus - error cases', () => {
    it('should throw error when payment not found', async () => {
      (mockRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        pagamentoUseCases.updateStatus(
          'non-existent-id',
          PaymentStatus.APPROVED,
        ),
      ).rejects.toThrow('Pagamento com ID non-existent-id não encontrado');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find payment by id', async () => {
      const payment = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.APPROVED,
      });

      (mockRepository.findById as jest.Mock).mockResolvedValue(payment);

      const result = await pagamentoUseCases.findById('payment-123');

      expect(mockRepository.findById).toHaveBeenCalledWith('payment-123');
      expect(result).toEqual(payment);
    });

    it('should return null when payment not found', async () => {
      (mockRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await pagamentoUseCases.findById('non-existent');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent');
      expect(result).toBeNull();
    });
  });
});
