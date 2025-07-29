import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof AppModule).toBe('function');
  });
});
