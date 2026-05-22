import { Controller, Get } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientFaqsService } from './client-faqs.service';

@ApiContext('client')
@Controller('faqs')
export class ClientFaqsController {
  constructor(private readonly faqsService: ClientFaqsService) {}

  @Public()
  @Get()
  findAll() {
    return this.faqsService.findAll();
  }
}