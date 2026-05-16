import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributeQueryDto, CreateAttributeDto } from './dto/attribute.dto';
import { UpdateAttributeDto } from './dto/update-dtos';
import { I18nLang } from 'nestjs-i18n';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get()
  findAll(@Query() query: AttributeQueryDto, @I18nLang() lang: string) {
    return this.service.findAll(query, lang);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: CreateAttributeDto) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAttributeDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
