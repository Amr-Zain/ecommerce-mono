import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValueQueryDto, CreateAttributeValueDto } from './dto/attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-dtos';
import { I18nLang } from 'nestjs-i18n';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly service: AttributeValuesService) {}

  @Get()
  findAll(@Query() query: AttributeValueQueryDto, @I18nLang() lang: string) {
    return this.service.findAll(query, lang);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: CreateAttributeValueDto) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAttributeValueDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
