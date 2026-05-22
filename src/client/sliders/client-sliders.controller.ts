import { Controller, Get } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientSlidersService } from './client-sliders.service';

@ApiContext('client')
@Controller('sliders')
export class ClientSlidersController {
  constructor(private readonly slidersService: ClientSlidersService) {}

  @Public()
  @Get()
  findAll() {
    return this.slidersService.findAll();
  }
}