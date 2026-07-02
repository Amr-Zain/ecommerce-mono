import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { DEFAULT_LOYALTY_SETTINGS } from '@/shared/loyalty/loyalty.constants';
import { UpdateSettingsDto } from '@/shared/settings/dto/settings.dto';
import { AppSettingsService } from '@/shared/settings/settings.service';

@ApiContext('admin')
@ApiTags('Admin - Settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class AdminSettingsController {
  constructor(private readonly settings: AppSettingsService) {}

  @Get()
  @RequirePermissions({ resource: 'settings', action: 'list' })
  async findAll() {
    return { settings: await this.settings.listSettings(DEFAULT_LOYALTY_SETTINGS) };
  }

  @Patch()
  @RequirePermissions({ resource: 'settings', action: 'update' })
  async update(@Body() dto: UpdateSettingsDto) {
    return { settings: await this.settings.updateSettings(dto, DEFAULT_LOYALTY_SETTINGS) };
  }
}
