import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { PaymentStatus } from '../../domain/pagamento/pagamento.types';
import { ApiProperty } from '@nestjs/swagger';

export class PagamentoDto {
  @ApiProperty({
    description: 'ID do pagamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'ID do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  pedido_id: string;

  @ApiProperty({
    description: 'Status do pagamento',
    example: PaymentStatus.PENDING,
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

export class CreatePagamentoDto {
  @ApiProperty({
    description: 'ID do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  pedido_id: string;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 100.5,
  })
  @IsNumber()
  @IsNotEmpty()
  valor: number;
}
