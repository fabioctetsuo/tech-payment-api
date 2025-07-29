import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PagamentoRepository } from './pagamento.repository';
import { Pagamento, PagamentoDocument } from '../mongoose/pagamento.schema';
import { Pagamento as PagamentoEntity } from '../../../domain/pagamento/pagamento.entity';
import { PaymentStatus } from '../../../domain/pagamento/pagamento.types';

describe('PagamentoRepository', () => {
  let repository: PagamentoRepository;
  let mockModel: Partial<Model<PagamentoDocument>>;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoRepository,
        { provide: getModelToken(Pagamento.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<PagamentoRepository>(PagamentoRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save a payment', async () => {
      const entity = new PagamentoEntity({
        pedido_id: '123',
        status: PaymentStatus.PENDING,
        valor: 100.5,
      });

      const mockDoc = {
        _id: 'payment-id',
        pedido_id: '123',
        status: PaymentStatus.PENDING,
        valor: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue({
          _id: 'payment-id',
          pedido_id: '123',
          status: PaymentStatus.PENDING,
          valor: 100.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      // Mock the constructor properly
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (repository as any).pagamentoModel = jest
        .fn()
        .mockImplementation(() => mockDoc);

      const result = await repository.save(entity);

      expect(mockDoc.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(PagamentoEntity);
      expect(result.pedido_id).toBe('123');
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const entity = new PagamentoEntity({
        status: PaymentStatus.APPROVED,
        valor: 100.5,
      });

      const mockDoc = {
        _id: 'payment-id',
        pedido_id: '123',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDoc);

      const result = await repository.update('payment-id', entity);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'payment-id',
        {
          status: PaymentStatus.APPROVED,
          valor: 100.5,
        },
        { new: true },
      );
      expect(result).toBeInstanceOf(PagamentoEntity);
      expect(result.status).toBe(PaymentStatus.APPROVED);
    });
  });

  describe('findById', () => {
    it('should find payment by id', async () => {
      const mockDoc = {
        _id: 'payment-id',
        pedido_id: '123',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockModel.findById as jest.Mock).mockResolvedValue(mockDoc);

      const result = await repository.findById('payment-id');

      expect(mockModel.findById).toHaveBeenCalledWith('payment-id');
      expect(result).toBeInstanceOf(PagamentoEntity);
      expect(result.id).toBe('payment-id');
    });

    it('should return null when payment not found', async () => {
      (mockModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByPedidoId', () => {
    it('should find payment by order id', async () => {
      const mockDoc = {
        _id: 'payment-id',
        pedido_id: '123',
        status: PaymentStatus.APPROVED,
        valor: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockModel.findOne as jest.Mock).mockResolvedValue(mockDoc);

      const result = await repository.findByPedidoId('123');

      expect(mockModel.findOne).toHaveBeenCalledWith({ pedido_id: '123' });
      expect(result).toBeInstanceOf(PagamentoEntity);
      expect(result.pedido_id).toBe('123');
    });

    it('should return null when payment not found by order id', async () => {
      (mockModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByPedidoId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all payments', async () => {
      const mockDocs = [
        {
          _id: 'payment-1',
          pedido_id: '123',
          status: PaymentStatus.APPROVED,
          valor: 100.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'payment-2',
          pedido_id: '789',
          status: PaymentStatus.PENDING,
          valor: 200.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockModel.find as jest.Mock).mockResolvedValue(mockDocs);

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PagamentoEntity);
      expect(result[1]).toBeInstanceOf(PagamentoEntity);
    });
  });
});
