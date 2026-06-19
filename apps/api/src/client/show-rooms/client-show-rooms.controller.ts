import { Controller, Get } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ClientShowRoomsService } from './client-show-rooms.service';
import { ApiTags } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Show-rooms')
@Controller('show-rooms')
export class ClientShowRoomsController {
  constructor(private readonly showRoomsService: ClientShowRoomsService) {}

  @Public()
  @Get()
  findAll(@I18nLang() lang: string) {
    return this.showRoomsService.findAll(lang);
  }
}
