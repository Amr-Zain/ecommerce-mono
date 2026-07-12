import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { DEFAULT_LOYALTY_SETTINGS } from '@/shared/loyalty/loyalty.constants';
import { UpdateSettingsDto } from '@/shared/settings/dto/settings.dto';
import { AppSettingsService } from '@/shared/settings/settings.service';
import { DEFAULT_STOREFRONT_SETTINGS } from '@/shared/settings/storefront-settings.constants';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

const DEFAULT_SETTINGS = { ...DEFAULT_LOYALTY_SETTINGS, ...DEFAULT_STOREFRONT_SETTINGS };

@ApiContext('admin')
@ApiTags('Admin - Settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class AdminSettingsController {
  constructor(
    private readonly settings: AppSettingsService,
    private readonly cacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  @Get()
  @RequirePermissions({ resource: 'settings', action: 'list' })
  async findAll() {
    return { settings: await this.settings.listSettings(DEFAULT_SETTINGS) };
  }

  @Patch()
  @RequirePermissions({ resource: 'settings', action: 'update' })
  async update(@Body() dto: UpdateSettingsDto) {
    const settings = await this.settings.updateSettings(dto, DEFAULT_SETTINGS);
    this.cacheInvalidation.publish(PUBLIC_CACHE_EVENTS.settingsChanged);
    return { settings };
  }
}
