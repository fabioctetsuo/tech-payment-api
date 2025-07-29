import { Pagamento } from './pagamento.entity';
import { PaymentStatus } from './pagamento.types';

describe('Pagamento', () => {
  describe('constructor', () => {
    it('should create a payment with provided data', () => {
      const data = {
        id: 'test-id',
        pedido_id: 'order-123',
        cliente_id: 'client-456',
        status: PaymentStatus.PENDING,
        valor: 100.5,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
      };

      const payment = new Pagamento(data);

      expect(payment.id).toBe(data.id);
      expect(payment.pedido_id).toBe(data.pedido_id);
      expect(payment.cliente_id).toBe(data.cliente_id);
      expect(payment.status).toBe(data.status);
      expect(payment.valor).toBe(data.valor);
      expect(payment.created_at).toBe(data.created_at);
      expect(payment.updated_at).toBe(data.updated_at);
    });

    it('should create a payment with partial data', () => {
      const data = {
        pedido_id: 'order-123',
        valor: 50.25,
      };

      const payment = new Pagamento(data);

      expect(payment.pedido_id).toBe(data.pedido_id);
      expect(payment.valor).toBe(data.valor);
      expect(payment.id).toBeUndefined();
      expect(payment.cliente_id).toBeUndefined();
      expect(payment.status).toBeUndefined();
    });
  });

  describe('isPaymentApproved', () => {
    it('should return true when status is APPROVED', () => {
      const payment = new Pagamento({ status: PaymentStatus.APPROVED });

      expect(payment.isPaymentApproved()).toBe(true);
    });

    it('should return false when status is not APPROVED', () => {
      const payment = new Pagamento({ status: PaymentStatus.PENDING });

      expect(payment.isPaymentApproved()).toBe(false);
    });

    it('should return false when status is REJECTED', () => {
      const payment = new Pagamento({ status: PaymentStatus.REJECTED });

      expect(payment.isPaymentApproved()).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update status and updated_at timestamp', () => {
      const initialDate = new Date('2023-01-01');
      const payment = new Pagamento({
        status: PaymentStatus.PENDING,
        updated_at: initialDate,
      });

      const beforeUpdate = Date.now();
      payment.updateStatus(PaymentStatus.APPROVED);
      const afterUpdate = Date.now();

      expect(payment.status).toBe(PaymentStatus.APPROVED);
      expect(payment.updated_at.getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(payment.updated_at.getTime()).toBeLessThanOrEqual(afterUpdate);
      expect(payment.updated_at).not.toBe(initialDate);
    });
  });

  describe('getters and setters', () => {
    let payment: Pagamento;

    beforeEach(() => {
      payment = new Pagamento({});
    });

    it('should set and get id', () => {
      const id = 'test-id';
      payment.id = id;
      expect(payment.id).toBe(id);
    });

    it('should set and get pedido_id', () => {
      const pedidoId = 'order-123';
      payment.pedido_id = pedidoId;
      expect(payment.pedido_id).toBe(pedidoId);
    });

    it('should set and get cliente_id', () => {
      const clienteId = 'client-456';
      payment.cliente_id = clienteId;
      expect(payment.cliente_id).toBe(clienteId);
    });

    it('should set and get status', () => {
      const status = PaymentStatus.APPROVED;
      payment.status = status;
      expect(payment.status).toBe(status);
    });

    it('should set and get valor', () => {
      const valor = 99.99;
      payment.valor = valor;
      expect(payment.valor).toBe(valor);
    });

    it('should set and get created_at', () => {
      const date = new Date('2023-01-01');
      payment.created_at = date;
      expect(payment.created_at).toBe(date);
    });

    it('should set and get updated_at', () => {
      const date = new Date('2023-01-02');
      payment.updated_at = date;
      expect(payment.updated_at).toBe(date);
    });
  });
});
