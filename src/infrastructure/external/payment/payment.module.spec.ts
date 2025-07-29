import { PaymentModule } from './payment.module';

describe('PaymentModule', () => {
  it('should be defined', () => {
    expect(PaymentModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof PaymentModule).toBe('function');
  });
});
