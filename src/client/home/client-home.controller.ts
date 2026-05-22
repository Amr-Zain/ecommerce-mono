import { Controller, Get } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientHomeService } from './client-home.service';

@ApiContext('client')
@Controller('home')
export class ClientHomeController {
  constructor(private readonly homeService: ClientHomeService) {}

  @Public()
  @Get()
  getHomePage() {
    return this.homeService.getHomePage();
  }
}