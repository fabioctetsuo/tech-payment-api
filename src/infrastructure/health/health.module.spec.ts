import { HealthModule } from './health.module';

describe('HealthModule', () => {
  it('should be defined', () => {
    expect(HealthModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof HealthModule).toBe('function');
  });
});
