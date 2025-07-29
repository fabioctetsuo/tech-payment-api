import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockService: Partial<HealthService>;

  beforeEach(async () => {
    mockService = {
      check: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const expectedResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };

      (mockService.check as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.check();

      expect(mockService.check).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      const error = new Error('Health check failed');
      (mockService.check as jest.Mock).mockRejectedValue(error);

      await expect(controller.check()).rejects.toThrow('Health check failed');
    });
  });
});
