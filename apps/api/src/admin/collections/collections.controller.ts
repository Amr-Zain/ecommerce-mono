import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';
import { I18nLang } from 'nestjs-i18n';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';

@ApiContext('admin')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @RequirePermissions({ resource: 'collections', action: 'create' })
  @UseLanguageTransform()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  @RequirePermissions({ resource: 'collections', action: 'list' })
  findAll(@Query() query: CollectionQueryDto, @I18nLang() lang: string) {
    return this.collectionsService.findAll(query, lang);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'collections', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'collections', action: 'update' })
  @UseLanguageTransform()
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionsService.update(+id, updateCollectionDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'collections', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(+id);
  }
}
