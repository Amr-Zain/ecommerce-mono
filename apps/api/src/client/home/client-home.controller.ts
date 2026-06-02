import { Controller, Get, UseGuards } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientHomeService } from './client-home.service';

@ApiContext('client')
@Controller('home')
export class ClientHomeController {
  constructor(private readonly homeService: ClientHomeService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getHomePage(@I18nLang() lang: string, @CurrentUser() user?: { id: bigint }) {
    return this.homeService.getHomePage(lang, user?.id);
  }
}
