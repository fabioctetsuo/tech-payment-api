import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentStatus } from '../../../domain/pagamento/pagamento.types';

export type PagamentoDocument = Pagamento & Document;

@Schema({ collection: 'pagamentos', timestamps: true })
export class Pagamento {
  @Prop({ required: true })
  pedido_id: string;

  @Prop({ required: false })
  cliente_id: string;

  @Prop({ required: true, enum: Object.values(PaymentStatus) })
  status: PaymentStatus;

  @Prop({ required: true, type: Number })
  valor: number;
}

export const PagamentoSchema = SchemaFactory.createForClass(Pagamento); 