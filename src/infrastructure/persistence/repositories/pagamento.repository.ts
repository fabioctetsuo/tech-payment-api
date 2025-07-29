import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pagamento, PagamentoDocument } from '../mongoose/pagamento.schema';
import { Pagamento as PagamentoEntity } from '../../../domain/pagamento/pagamento.entity';

@Injectable()
export class PagamentoRepository {
  constructor(
    @InjectModel(Pagamento.name)
    private pagamentoModel: Model<PagamentoDocument>,
  ) {}

  async save(pagamento: PagamentoEntity): Promise<PagamentoEntity> {
    const newPagamento = new this.pagamentoModel({
      pedido_id: pagamento.pedido_id,
      cliente_id: pagamento.cliente_id,
      status: pagamento.status,
      valor: pagamento.valor,
    });
    const saved = await newPagamento.save();
    return this.mapToEntity(saved);
  }

  async update(
    id: string,
    pagamento: PagamentoEntity,
  ): Promise<PagamentoEntity> {
    const updated = await this.pagamentoModel.findByIdAndUpdate(
      id,
      {
        status: pagamento.status,
        valor: pagamento.valor,
      },
      { new: true },
    );
    return this.mapToEntity(updated);
  }

  async findById(id: string): Promise<PagamentoEntity> {
    const found = await this.pagamentoModel.findById(id);
    return found ? this.mapToEntity(found) : null;
  }

  async findByPedidoId(pedidoId: string): Promise<PagamentoEntity> {
    const found = await this.pagamentoModel.findOne({ pedido_id: pedidoId });
    return found ? this.mapToEntity(found) : null;
  }

  async findAll(): Promise<PagamentoEntity[]> {
    const found = await this.pagamentoModel.find();
    return found.map((doc) => this.mapToEntity(doc));
  }

  private mapToEntity(doc: PagamentoDocument): PagamentoEntity {
    return new PagamentoEntity({
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      id: doc._id ? doc._id.toString() : '',
      pedido_id: doc.pedido_id,
      cliente_id: doc.cliente_id,
      status: doc.status,
      valor: doc.valor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      created_at: (doc as any).createdAt as Date,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updated_at: (doc as any).updatedAt as Date,
    });
  }
}
