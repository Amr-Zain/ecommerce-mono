import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValueQueryDto, CreateAttributeValueDto } from './dto/attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-dtos';
import { I18nLang } from 'nestjs-i18n';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly service: AttributeValuesService) {}

  @Get()
  @RequirePermissions({ resource: 'attribute-values', action: 'list' })
  findAll(@Query() query: AttributeValueQueryDto, @I18nLang() lang: string) {
    return this.service.findAll(query, lang);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'attribute-values', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @UseLanguageTransform()
  @RequirePermissions({ resource: 'attribute-values', action: 'create' })
  create(@Body() data: CreateAttributeValueDto) {
    return this.service.create(data);
  }

  @Patch(':id')
  @UseLanguageTransform()
  @RequirePermissions({ resource: 'attribute-values', action: 'update' })
  update(@Param('id') id: string, @Body() data: UpdateAttributeValueDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'attribute-values', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
