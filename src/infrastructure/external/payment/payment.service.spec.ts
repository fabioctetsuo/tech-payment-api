import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { Pagamento } from '../../../domain/pagamento/pagamento.entity';
import { PaymentStatus } from '../../../domain/pagamento/pagamento.types';
import {
  ValidationException,
  ValidationErrorType,
} from '../../../domain/exceptions/validation.exception';

// Mock fetch globally
global.fetch = jest.fn();

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set default environment variable
    process.env.MOCK_PAYMENT_SERVICE_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    delete process.env.MOCK_PAYMENT_SERVICE_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayment', () => {
    it('should successfully process payment and return APPROVED status', async () => {
      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: PaymentStatus.APPROVED }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.processPayment(pagamento);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/pagamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'payment-123',
          pedido_id: '123',
          valor: 100.5,
        }),
      });
      expect(result).toBe(PaymentStatus.APPROVED);
    });

    it('should successfully process payment and return REJECTED status', async () => {
      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: PaymentStatus.REJECTED }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.processPayment(pagamento);

      expect(result).toBe(PaymentStatus.REJECTED);
    });

    it('should throw ValidationException when payment service responds with error status', async () => {
      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.processPayment(pagamento)).rejects.toThrow(
        ValidationException,
      );

      try {
        await service.processPayment(pagamento);
        fail('Should have thrown ValidationException');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).getResponse()).toEqual(
          expect.objectContaining({
            error: ValidationErrorType.PAYMENT_PROCESSING_ERROR,
          }),
        );
      }
    });

    it('should throw ValidationException when fetch fails (network error)', async () => {
      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      (fetch as jest.Mock).mockRejectedValue(new TypeError('fetch failed'));

      await expect(service.processPayment(pagamento)).rejects.toThrow(
        ValidationException,
      );

      try {
        await service.processPayment(pagamento);
        fail('Should have thrown ValidationException');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).getResponse()).toEqual(
          expect.objectContaining({
            error: ValidationErrorType.PAYMENT_PROCESSING_ERROR,
          }),
        );
      }
    });

    it('should throw ValidationException when JSON parsing fails', async () => {
      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.processPayment(pagamento)).rejects.toThrow(
        ValidationException,
      );

      try {
        await service.processPayment(pagamento);
        fail('Should have thrown ValidationException');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).getResponse()).toEqual(
          expect.objectContaining({
            error: ValidationErrorType.PAYMENT_PROCESSING_ERROR,
          }),
        );
      }
    });

    it('should use environment variable for service URL', async () => {
      process.env.MOCK_PAYMENT_SERVICE_URL = 'http://custom-url:8080';

      const pagamento = new Pagamento({
        id: 'payment-123',
        pedido_id: '123',
        valor: 100.5,
        status: PaymentStatus.PENDING,
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: PaymentStatus.APPROVED }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.processPayment(pagamento);

      expect(fetch).toHaveBeenCalledWith(
        'http://custom-url:8080/pagamentos',
        expect.any(Object),
      );
    });
  });
});
