import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { HealthCheckService } from '@nestjs/terminus';

describe('HealthService', () => {
  let service: HealthService;
  let mockHealthCheckService: Partial<HealthCheckService>;

  beforeEach(async () => {
    mockHealthCheckService = {
      check: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should perform health check', async () => {
      const expectedResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };

      (mockHealthCheckService.check as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.check();

      expect(mockHealthCheckService.check).toHaveBeenCalledWith([]);
      expect(result).toEqual(expectedResult);
    });

    it('should handle health check errors', async () => {
      const error = new Error('Health check failed');
      (mockHealthCheckService.check as jest.Mock).mockRejectedValue(error);

      await expect(service.check()).rejects.toThrow('Health check failed');
    });
  });
});
