import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pagamento, PagamentoSchema } from './pagamento.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/payment_db'),
    MongooseModule.forFeature([
      { name: Pagamento.name, schema: PagamentoSchema }
    ])
  ],
  exports: [MongooseModule]
})
export class DatabaseModule {} 