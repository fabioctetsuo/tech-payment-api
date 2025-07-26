import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPagamentoDto {
  @ApiProperty({
    description: 'ID do pagamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ID do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  pedido_id: string;

  @ApiProperty({
    description: 'Status atualizado do pagamento',
    example: PaymentStatus.APPROVED,
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 100.5,
  })
  @IsNumber()
  @IsNotEmpty()
  valor: number;
} 