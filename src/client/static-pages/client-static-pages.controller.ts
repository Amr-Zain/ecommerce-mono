import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientStaticPagesService } from './client-static-pages.service';

@ApiContext('client')
@Controller('static-pages')
export class ClientStaticPagesController {
  constructor(private readonly staticPagesService: ClientStaticPagesService) {}

  @Public()
  @Get()
  findAll() {
    return this.staticPagesService.findAll();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.staticPagesService.findBySlug(slug);
  }
}