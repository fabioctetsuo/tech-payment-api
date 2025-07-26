import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreatePagamentoDto } from '../dto/pagamento.dto';
import { PagamentoService } from '../../business/pagamento/pagamento.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

@ApiTags('Pagamentos')
@Controller('pagamentos')
export class PagamentoController {
  private readonly logger = new Logger(PagamentoController.name);
  constructor(private pagamentoService: PagamentoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({
    status: 503,
    description: 'Serviço de pagamento indisponível',
  })
  async create(@Body() createPagamentoDto: CreatePagamentoDto) {
    this.logger.log('Iniciando fluxo de pagamento do pedido: create', createPagamentoDto);
    return this.pagamentoService.create(createPagamentoDto);
  }

  @Get('/pedidos/:id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID do pedido' })
  @ApiResponse({ status: 200, description: 'Retorna o pagamento' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async findByPedidoId(@Param('id') pedidoId: string) {
    return this.pagamentoService.findByPedidoId(pedidoId);
  }
}
