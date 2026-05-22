import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientAttributesService } from './client-attributes.service';

@ApiContext('client')
@Controller('attributes')
export class ClientAttributesController {
  constructor(private readonly attributesService: ClientAttributesService) {}

  @Public()
  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(+id);
  }
}