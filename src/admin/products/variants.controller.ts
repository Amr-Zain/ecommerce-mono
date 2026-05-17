import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto, AdjustStockDto } from './dto/product.dto';
import { UpdateVariantDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post('product/:productId')
  create(@Param('productId', ParseIntPipe) productId: number, @Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.create(productId, createVariantDto);
  }

  @Get()
  findAll(@ParsedQuery() query: AdvancedQueryDto) {
    return this.variantsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Post('adjust-stock')
  adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    return this.variantsService.adjustStock(adjustStockDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.remove(id);
  }
}
