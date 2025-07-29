import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { OrderService } from './order.service';
import { of, throwError } from 'rxjs';

describe('OrderService', () => {
  let service: OrderService;
  let mockHttpService: Partial<HttpService>;

  beforeEach(async () => {
    mockHttpService = {
      put: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);

    // Set default environment variable
    process.env.ORDER_API_URL = 'http://localhost:3002';
  });

  afterEach(() => {
    delete process.env.ORDER_API_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const orderId = 'order-123';
      const mockResponse = { data: { success: true } };

      (mockHttpService.put as jest.Mock).mockReturnValue(of(mockResponse));

      await service.confirmOrder(orderId);

      expect(mockHttpService.put).toHaveBeenCalledWith(
        'http://localhost:3002/pedidos/order-123/confirmar',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should use custom ORDER_API_URL when provided', async () => {
      process.env.ORDER_API_URL = 'http://custom-order-api:8080';

      const orderId = 'order-123';
      const mockResponse = { data: { success: true } };

      (mockHttpService.put as jest.Mock).mockReturnValue(of(mockResponse));

      await service.confirmOrder(orderId);

      expect(mockHttpService.put).toHaveBeenCalledWith(
        'http://custom-order-api:8080/pedidos/order-123/confirmar',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw error when HTTP request fails', async () => {
      const orderId = 'order-123';
      const error = new Error('Network error');

      (mockHttpService.put as jest.Mock).mockReturnValue(
        throwError(() => error),
      );

      await expect(service.confirmOrder(orderId)).rejects.toThrow(
        'Network error',
      );

      expect(mockHttpService.put).toHaveBeenCalledWith(
        'http://localhost:3002/pedidos/order-123/confirmar',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should use default URL when ORDER_API_URL is not set', async () => {
      delete process.env.ORDER_API_URL;

      const orderId = 'order-456';
      const mockResponse = { data: { success: true } };

      (mockHttpService.put as jest.Mock).mockReturnValue(of(mockResponse));

      await service.confirmOrder(orderId);

      expect(mockHttpService.put).toHaveBeenCalledWith(
        'http://localhost:3002/pedidos/order-456/confirmar',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });
  });
});
