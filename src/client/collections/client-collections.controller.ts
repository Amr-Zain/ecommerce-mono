import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientCollectionsService } from './client-collections.service';

@ApiContext('client')
@Controller('collections')
export class ClientCollectionsController {
  constructor(private readonly collectionsService: ClientCollectionsService) {}

  @Public()
  @Get()
  findAll(@Query('parentId') parentId?: string) {
    return this.collectionsService.findAll(parentId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(+id);
  }
}