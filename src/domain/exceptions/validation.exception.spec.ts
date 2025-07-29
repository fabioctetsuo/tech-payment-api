import { HttpStatus } from '@nestjs/common';
import {
  ValidationException,
  ValidationErrorType,
} from './validation.exception';

describe('ValidationException', () => {
  describe('constructor', () => {
    it('should create exception with known error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.PAYMENT_PROCESSING_ERROR,
      );

      expect(exception.name).toBe('ValidationException');
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Erro ao processar pagamento',
        error: ValidationErrorType.PAYMENT_PROCESSING_ERROR,
      });
    });

    it('should handle unknown error type with default message', () => {
      // Create an unknown error type by casting
      const unknownErrorType = 'UNKNOWN_ERROR_TYPE' as ValidationErrorType;
      const exception = new ValidationException(unknownErrorType);

      expect(exception.name).toBe('ValidationException');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro de validação desconhecido',
        error: unknownErrorType,
      });
    });

    it('should create exception with CLIENT_NOT_FOUND type', () => {
      const exception = new ValidationException(
        ValidationErrorType.CLIENTE_NOT_FOUND,
      );

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Cliente não encontrado',
        error: ValidationErrorType.CLIENTE_NOT_FOUND,
      });
    });

    it('should create exception with UNAUTHORIZED type', () => {
      const exception = new ValidationException(
        ValidationErrorType.UNAUTHORIZED,
      );

      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Não autorizado',
        error: ValidationErrorType.UNAUTHORIZED,
      });
    });
  });
});
