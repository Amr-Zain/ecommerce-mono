import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';
import { CreateAttributeDto } from './dto/attribute.dto';
import { UpdateAttributeDto } from './dto/update-dtos';
import { I18nLang } from 'nestjs-i18n';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';

import { ApiContext } from '@/common/decorators/api-context.decorator';

@ApiContext('admin')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get()
  @RequirePermissions({ resource: 'attributes', action: 'list' })
  findAll(@Query() query: AttributeQueryDto, @I18nLang() lang: string) {
    return this.service.findAll(query, lang);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'attributes', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @UseLanguageTransform()
  @RequirePermissions({ resource: 'attributes', action: 'create' })
  create(@Body() data: CreateAttributeDto) {
    return this.service.create(data);
  }

  @Patch(':id')
  @UseLanguageTransform()
  @RequirePermissions({ resource: 'attributes', action: 'update' })
  update(@Param('id') id: string, @Body() data: UpdateAttributeDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'attributes', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
