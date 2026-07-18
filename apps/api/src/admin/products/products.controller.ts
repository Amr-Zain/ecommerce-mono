import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from '@/common/dto/product.dto';
import { UpdateProductDto } from './dto/update-dtos';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseLanguageTransform({ recursive: true })
  @RequirePermissions({ resource: 'products', action: 'create' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @RequirePermissions({ resource: 'products', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(ProductQueryDto) query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id/statistics')
  @RequirePermissions({ resource: 'products', action: 'read' })
  statistics(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.statistics(id);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'products', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseLanguageTransform({ recursive: true })
  @RequirePermissions({ resource: 'products', action: 'update' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'products', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
