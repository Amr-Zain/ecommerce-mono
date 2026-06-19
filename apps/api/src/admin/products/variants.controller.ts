import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto, AdjustStockDto } from '@/common/dto/product.dto';
import { UpdateVariantDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Variants')
@ApiBearerAuth('access-token')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post('product/:productId')
  @RequirePermissions({ resource: 'products', action: 'create' })
  create(@Param('productId', ParseIntPipe) productId: number, @Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.create(productId, createVariantDto);
  }

  @Get()
  @RequirePermissions({ resource: 'products', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery() query: AdvancedQueryDto) {
    return this.variantsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'products', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'products', action: 'update' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Post('adjust-stock')
  @RequirePermissions({ resource: 'products', action: 'update' })
  adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    return this.variantsService.adjustStock(adjustStockDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'products', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.remove(id);
  }

  @Get(':id/price-history')
  @RequirePermissions({ resource: 'products', action: 'read' })
  @ApiAdvancedQuery()
  getPriceHistory(@Param('id', ParseIntPipe) id: number, @ParsedQuery() query: AdvancedQueryDto) {
    return this.variantsService.getPriceHistory(id, query);
  }

  @Get(':id/inventory-logs')
  @RequirePermissions({ resource: 'products', action: 'read' })
  @ApiAdvancedQuery()
  getInventoryLogs(@Param('id', ParseIntPipe) id: number, @ParsedQuery() query: AdvancedQueryDto) {
    return this.variantsService.getInventoryLogs(id, query);
  }
}
