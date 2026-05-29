import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientOrdersService } from './client-orders.service';
import { CreateOrderDto } from './dto/order.dto';

@ApiContext('client')
@Controller('orders')
export class ClientOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }) {
    return this.ordersService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.ordersService.findOne(user.id, BigInt(id));
  }

  @Post()
  create(@CurrentUser() user: { id: bigint }, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }
}