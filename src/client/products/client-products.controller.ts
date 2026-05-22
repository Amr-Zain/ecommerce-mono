import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientProductsService } from './client-products.service';

@ApiContext('client')
@Controller('products')
export class ClientProductsController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(BigInt(id));
  }
}